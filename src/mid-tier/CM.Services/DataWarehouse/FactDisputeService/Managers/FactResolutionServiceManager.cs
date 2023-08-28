using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text.Json;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using CM.Services.DataWarehouse.DataWarehouseDataModel.Models;
using CM.Services.DataWarehouse.DataWarehouseRepository.UnitOfWork;
using CM.Services.DataWarehouse.FactDisputeService.Common;
using CM.Services.DataWarehouse.FactDisputeService.Helper;
using Serilog;

namespace CM.Services.DataWarehouse.FactDisputeService.Managers
{
    public class FactResolutionServiceManager : StatisticManagerBase
    {
        public FactResolutionServiceManager(IUnitOfWork unitOfWork, IUnitOfWorkDataWarehouse dwUnitOfWork, ILogger logger)
        : base(unitOfWork, dwUnitOfWork, logger)
        {
        }

        public async System.Threading.Tasks.Task Record(int dateDelay)
        {
            var lastLoadedDateTime = await DwUnitOfWork.LoadingHistoryRepository.GetLastLoadStartDateTime((int)FactTable.FResolutionService);

            var loadingEventId = await LoadingHistoryManager.InsertLoadingHistory(FactTable.FResolutionService);

            var outcomeDocGroups = await UnitOfWork.OutcomeDocGroupRepository.GetOutcomeDocGroups(lastLoadedDateTime, dateDelay);
            var insertedCount = 0;

            foreach (var outcomeDocGroup in outcomeDocGroups)
            {
                FactResolutionService factResolutionService = null;
                try
                {
                    factResolutionService = await GetRecord(outcomeDocGroup);

                    await DwUnitOfWork.FactResolutionServiceRepository.InsertAsync(factResolutionService);
                    var res = await DwUnitOfWork.Complete();

                    if (res.CheckSuccess())
                    {
                        LogInformation("Entity recorded");
                        insertedCount += 1;
                        await LoadingHistoryManager.UpdateLoadingHistory(loadingEventId, LoadingHistoryStatus.LoadComplete, string.Empty, insertedCount);
                    }
                    else
                    {
                        LogInformation("Insert is failed");
                        await LoadingHistoryManager.UpdateLoadingHistory(loadingEventId, LoadingHistoryStatus.Failed, "FactResolutionService Insert is failed.", insertedCount);
                    }
                }
                catch (Exception e)
                {
                    if (factResolutionService != null)
                    {
                        var jsonString = JsonSerializer.Serialize(factResolutionService);
                        LogInformation($"FactResolutionService Dump = {jsonString}");
                    }

                    LogError($"Error during record - {outcomeDocGroup.OutcomeDocGroupId}", e);
                    await LoadingHistoryManager.UpdateLoadingHistory(loadingEventId, LoadingHistoryStatus.Failed, e.Message, insertedCount);
                }
            }

            await LoadingHistoryManager.UpdateLoadingHistory(loadingEventId, LoadingHistoryStatus.LoadComplete, string.Empty, insertedCount);
        }

        private async System.Threading.Tasks.Task<FactResolutionService> GetRecord(OutcomeDocGroup outcomeDocGroup)
        {
            var fileTypes = outcomeDocGroup.OutcomeDocFiles.Select(x => x.FileType).Distinct().ToList();
            var derivedDocumentType = GetDerivedDocumentType(fileTypes);
            var totalDocuments = outcomeDocGroup
                                .OutcomeDocFiles
                                .Count(x => x.FileType != (byte)OutcomeDocFileTypes.PublicDecision
                                         || x.FileType != (byte)OutcomeDocFileTypes.ExternalWorkingDocument);
            var documentFileTypes = outcomeDocGroup
                                .OutcomeDocFiles
                                .Where(x => x.FileType != (byte)OutcomeDocFileTypes.PublicDecision
                                         || x.FileType != (byte)OutcomeDocFileTypes.ExternalWorkingDocument)
                                .Select(x => x.FileType)
                                .Distinct()
                                .ToArray()
                                .CreateString(",");
            var containsVisibleToPublic = outcomeDocGroup.OutcomeDocFiles.Any(x => x.VisibleToPublic == true);
            var containsMateriallyDifferent = outcomeDocGroup.OutcomeDocFiles.Any(x => x.MateriallyDifferent == true);
            var containsNoteworthy = outcomeDocGroup.OutcomeDocFiles.Any(x => x.NoteWorthy == true);

            var fileTypesPriorHearing = new byte[] { 2, 3, 5, 6, 7, 8, 81, 82 };
            var associatedToPriorHearing = outcomeDocGroup.OutcomeDocFiles
                                                        .Any(x => fileTypesPriorHearing.Contains(x.FileType));

            var disputeHearings = await UnitOfWork.DisputeHearingRepository.GetDisputeHearings(outcomeDocGroup.DisputeGuid);
            var hearings = disputeHearings.Select(x => x.Hearing).ToList();
            var priorHearing = hearings
                                .Where(x => x.LocalEndDateTime < DateTime.Now.ToLocalTime())
                                .OrderByDescending(x => x.LocalEndDateTime)
                                .FirstOrDefault();
            var maxDateTime = priorHearing?.LocalEndDateTime;
            var priorHearingId = priorHearing?.HearingId;

            var priorSharedHearingLinkingType = disputeHearings
                                                .Where(x => x.Hearing.LocalEndDateTime < DateTime.Now.ToLocalTime())
                                                .OrderByDescending(x => x.Hearing.LocalEndDateTime)
                                                .FirstOrDefault()
                                                ?.SharedHearingLinkType;
            var priorLinkedDisputes = disputeHearings.Count(x => x.HearingId == priorHearing?.HearingId);
            var containsReviewReplacement = outcomeDocGroup.OutcomeDocFiles.Any(x => x.FileSubType == 3);
            var containsCorrectionReplacement = outcomeDocGroup.OutcomeDocFiles.Any(x => x.FileSubType == 2);

            var outcomeDocDeliveries = outcomeDocGroup
                .OutcomeDocFiles
                .Select(x => x.OutcomeDocDeliveries)
                .ToList()
                .GetSingleFromNestedCollections()
                .ToList();
            var totalDocumentsDelivered = outcomeDocDeliveries
                .Where(x => x.IsDelivered == true)
                .ToList()
                .Count;
            var documentsDeliveredMail = outcomeDocDeliveries
                .Where(x => x.IsDelivered == true && x.DeliveryMethod == (byte?)DeliveryMethod.Mail)
                .ToList()
                .Count;
            var documentsDeliveredEmail = outcomeDocDeliveries
                .Where(x => x.IsDelivered == true && x.DeliveryMethod == (byte?)DeliveryMethod.Email)
                .ToList()
                .Count;
            var documentsDeliveredPickup = outcomeDocDeliveries
                .Where(x => x.IsDelivered == true && x.DeliveryMethod == (byte?)DeliveryMethod.Pickup)
                .ToList()
                .Count;
            var documentsDeliveredOther = outcomeDocDeliveries
                .Where(x => x.IsDelivered == true && x.DeliveryMethod == (byte?)DeliveryMethod.Custom)
                .ToList()
                .Count;

            var latestReadyForDeliveryDate = outcomeDocDeliveries
                .Where(x => x.IsDelivered == true && x.ReadyForDeliveryDate.HasValue)
                .OrderByDescending(x => x.ReadyForDeliveryDate)
                .FirstOrDefault()
                ?.ReadyForDeliveryDate;

            var latestDeliveryDate = outcomeDocDeliveries
                .Where(x => x.IsDelivered == true && x.DeliveryDate.HasValue)
                .OrderByDescending(x => x.DeliveryDate)
                .FirstOrDefault()
                ?.DeliveryDate;

            var deliveryPriority = outcomeDocDeliveries
                .Where(x => x.IsDelivered == true && x.DeliveryPriority.HasValue)
                .OrderByDescending(x => x.DeliveryPriority)
                .FirstOrDefault()
                ?.DeliveryPriority;

            // Same as in FactDisputeSummary
            var disputeGuid = outcomeDocGroup.DisputeGuid;
            var dispute = await UnitOfWork.DisputeRepository.GetNoTrackDisputeByGuidAsync(disputeGuid);
            var disputeLastStatus = dispute.DisputeStatuses.FirstOrDefault(x => x.IsActive == true);
            var applicants = await UnitOfWork.ClaimGroupParticipantRepository.FindAllAsync(x => x.DisputeGuid == disputeGuid
            && (x.Participant.ParticipantStatus != (byte)ParticipantStatus.Removed && x.Participant.ParticipantStatus != (byte)ParticipantStatus.Deleted)
            && x.GroupParticipantRole == (byte)GroupParticipantRole.Applicant);
            var respondents = await UnitOfWork.ClaimGroupParticipantRepository.FindAllAsync(x => x.DisputeGuid == disputeGuid
            && (x.Participant.ParticipantStatus != (byte)ParticipantStatus.Removed && x.Participant.ParticipantStatus != (byte)ParticipantStatus.Deleted)
            && x.GroupParticipantRole == (byte)GroupParticipantRole.Respondent);
            var claims = await CommonFieldsLoader.GetDisputesClaims(UnitOfWork, new List<Guid?> { disputeGuid });
            var linkedFiles = await CommonFieldsLoader.GetLinkedEvidenceFiles(UnitOfWork, new List<Guid?> { disputeGuid });
            var fileIds = linkedFiles.Select(x => x.FileId);
            var associatedFiles = await UnitOfWork.FileRepository.FindAllAsync(x => fileIds.Contains(x.FileId));
            var fileSizesSum = CommonFieldsLoader.GetLinkedEvidenceFilesMb(UnitOfWork, linkedFiles, associatedFiles);

            var factResolutionService = new FactResolutionService
            {
                LoadDateTime = DateTime.UtcNow,
                AssociatedOffice = (int)Offices.Rtbbc,
                IsActive = true,
                IsPublic = false,
                DisputeGuid = outcomeDocGroup.DisputeGuid,
                OutcomeDocGroupId = outcomeDocGroup.OutcomeDocGroupId,
                DocGroupCreatedDate = outcomeDocGroup.CreatedDate,
                DocGroupCreatedById = outcomeDocGroup.CreatedBy,
                DocStatus = outcomeDocGroup.DocStatus,
                DocStatusDate = outcomeDocGroup.DocStatusDate,
                DerivedDocumentType = derivedDocumentType,
                TotalDocuments = totalDocuments,
                DocumentFileTypes = documentFileTypes,
                ContainsVisibleToPublic = containsVisibleToPublic,
                ContainsMateriallyDifferent = containsMateriallyDifferent,
                ContainsNoteworthy = containsNoteworthy,
                AssociatedToPriorHearing = associatedToPriorHearing,
                PriorHearingId = priorHearingId,
                PriorSharedHearingLinkingType = priorSharedHearingLinkingType,
                PriorLinkedDisputes = priorLinkedDisputes,
                PriorHearingDuration = priorHearing?.HearingDuration,
                PriorHearingComplexity = priorHearing?.HearingComplexity,
                ContainsReviewReplacement = containsReviewReplacement,
                ContainsCorrectionReplacement = containsCorrectionReplacement,
                TotalDocumentsDelivered = totalDocumentsDelivered,
                DocumentsDeliveredMail = documentsDeliveredMail,
                DocumentsDeliveredEmail = documentsDeliveredEmail,
                DocumentsDeliveredPickup = documentsDeliveredPickup,
                DocumentsDeliveredOther = documentsDeliveredOther,
                LatestReadyForDeliveryDate = latestReadyForDeliveryDate,
                LatestDeliveryDate = latestDeliveryDate,
                DeliveryPriority = deliveryPriority,
                DocPreparationTime = outcomeDocGroup.DocPreparationTime,
                DocWritingTime = outcomeDocGroup.DocWritingTime,
                DocComplexity = outcomeDocGroup.DocComplexity,
                DocCompletedDate = outcomeDocGroup.DocCompletedDate,
                Applicants = applicants.Count,
                Respondents = respondents.Count,
                Issues = claims.Count,
                DisputeUrgency = dispute.DisputeUrgency,
                DisputeCreationMethod = dispute.CreationMethod,
                LastStage = disputeLastStatus.Stage,
                LastStatus = disputeLastStatus.Status,
                LastProcess = disputeLastStatus.Process,
                LastStatusDateTime = disputeLastStatus.StatusStartDate,
                DisputeType = dispute.DisputeType,
                DisputeSubType = dispute.DisputeSubType,
                CreationMethod = dispute.CreationMethod,
                SubmittedDateTime = dispute.SubmittedDate,
                InitialPaymentDateTime = dispute.InitialPaymentDate,
                EvidenceFiles = linkedFiles.Count,
                EvidenceFilesMb = fileSizesSum
            };

            return factResolutionService;
        }

        private int? GetDerivedDocumentType(List<byte> fileTypes)
        {
            var derivedDocumentTypes1 = new byte[] { 2, 3, 4, 5, 6, 7, 8, 70, 71 };
            var derivedDocumentTypes2 = new byte[] { 30, 31, 32, 33, 34, 35 };
            var derivedDocumentTypes3 = new byte[] { 25, 40, 41, 42, 45, 46, 47 };
            var derivedDocumentTypes4 = new byte[] { 50 };

            if (fileTypes.Any(x => derivedDocumentTypes1.Contains(x)))
            {
                return 1;
            }
            else if (fileTypes.Any(x => derivedDocumentTypes2.Contains(x)))
            {
                return 2;
            }
            else if (fileTypes.Any(x => derivedDocumentTypes3.Contains(x)))
            {
                return 3;
            }
            else if (fileTypes.Any(x => derivedDocumentTypes4.Contains(x)))
            {
                return 4;
            }
            else
            {
                return null;
            }
        }
    }
}
