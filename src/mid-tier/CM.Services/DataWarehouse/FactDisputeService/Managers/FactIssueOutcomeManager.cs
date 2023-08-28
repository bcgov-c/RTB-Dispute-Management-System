using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;
using CM.Services.DataWarehouse.DataWarehouseDataModel.Models;
using CM.Services.DataWarehouse.DataWarehouseRepository.RequestResponseModels;
using CM.Services.DataWarehouse.DataWarehouseRepository.UnitOfWork;
using CM.Services.DataWarehouse.FactDisputeService.Common;
using CM.Services.DataWarehouse.FactDisputeService.Helper;
using Serilog;

namespace CM.Services.DataWarehouse.FactDisputeService.Managers
{
    public class FactIssueOutcomeManager : StatisticManagerBase
    {
        private static bool _anyFailed;

        public FactIssueOutcomeManager(IUnitOfWork unitOfWork, IUnitOfWorkDataWarehouse dwUnitOfWork, ILogger logger)
            : base(unitOfWork, dwUnitOfWork, logger)
        {
        }

        public async Task Record(List<ExistedFileNumbersResponse> fileNumbersResponse, int dateDelay)
        {
            var existedDisputeGuids = fileNumbersResponse.Select(x => x.DisputeGuid).ToList();

            var finalDisputes = await CommonFieldsLoader.GetIssueOutcomeDisputes(UnitOfWork, DwUnitOfWork, dateDelay);

            var insertedCount = 0;

            var loadingEventId = await LoadingHistoryManager.InsertLoadingHistory(FactTable.FIssueOutcome);

            try
            {
                foreach (var dispute in finalDisputes)
                {
                    LogInformation($"FileNumber = {dispute.FileNumber}");

                    if (dispute.FileNumber.HasValue && existedDisputeGuids.Contains(dispute.DisputeGuid))
                    {
                        LogInformation($"Closed Dispute fileNumber existed {dispute.FileNumber}");

                        if (dispute.DisputeLastModified == null)
                        {
                            LogInformation($"Closed Dispute not existed in DisputeLastModified table for fileNumber = {dispute.FileNumber}");
                            continue;
                        }

                        LogInformation($"Closed Dispute fileNumber needs to update {dispute.FileNumber}");

                        var updatedCount = await RecordFactIssueOutcome(dispute.FileNumber.Value, RecordType.Update);

                        if (updatedCount > 0)
                        {
                            LogInformation($"Closed Dispute fileNumber updated {dispute.FileNumber}");
                            insertedCount += updatedCount;
                        }
                        else if (updatedCount < 0)
                        {
                            LogInformation($"Update is failed for {dispute.FileNumber}");
                            _anyFailed = true;
                        }
                    }
                    else
                    {
                        LogInformation($"Closed Dispute fileNumber not exists {dispute.FileNumber}");

                        if (dispute.FileNumber != null)
                        {
                            var addedCount = await RecordFactIssueOutcome(dispute.FileNumber.Value, RecordType.Add);

                            if (addedCount > 0)
                            {
                                LogInformation($"Closed Dispute fileNumber inserted {dispute.FileNumber}");
                                insertedCount += addedCount;
                            }
                            else if (addedCount < 0)
                            {
                                LogInformation($"Insert is failed for {dispute.FileNumber}");
                                _anyFailed = true;
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                LogError(ex.Message, ex);
                await LoadingHistoryManager.UpdateLoadingHistory(loadingEventId, LoadingHistoryStatus.Failed, ex.Message, insertedCount);
                return;
            }

            await LoadingHistoryManager.UpdateLoadingHistory(loadingEventId, _anyFailed ? LoadingHistoryStatus.Failed : LoadingHistoryStatus.LoadComplete, string.Empty, insertedCount);
        }

        private async Task<int> RecordFactIssueOutcome(int fileNumber, RecordType type)
        {
            LogInformation($"Start Record FileNumber {fileNumber}");

            try
            {
                var factIssueOutcomes = await GetRecordsAsync(fileNumber, type);

                if (factIssueOutcomes.Count <= 0)
                {
                    return 0;
                }

                LogInformation("Entity created");

                if (type == RecordType.Add)
                {
                    foreach (var factIssueOutcome in factIssueOutcomes)
                    {
                        await DwUnitOfWork.FactIssueOutcomeRepository.InsertAsync(factIssueOutcome);
                    }
                }
                else
                {
                    foreach (var factIssueOutcome in factIssueOutcomes)
                    {
                        DwUnitOfWork.FactIssueOutcomeRepository.Attach(factIssueOutcome);
                    }
                }

                var res = await DwUnitOfWork.Complete();
                if (res.CheckSuccess())
                {
                    LogInformation($"FileNumber recorded {fileNumber}");
                    return factIssueOutcomes.Count;
                }
            }
            catch (Exception ex)
            {
                LogError($"Error during record for FileNumber={fileNumber}", ex);
            }

            return Constants.NotFoundOrIncorrect;
        }

        private async Task<List<FactIssueOutcome>> GetRecordsAsync(int fileNumber, RecordType type)
        {
            List<FactIssueOutcome> result = new List<FactIssueOutcome>();
            FactIssueOutcome factIssueOutcome;

            var dispute = await UnitOfWork.DisputeRepository.GetDisputeByFileNumber(fileNumber);

            if (type == RecordType.Add)
            {
                factIssueOutcome = new FactIssueOutcome
                {
                    AssociatedOffice = (int)Offices.Rtbbc,
                    IsActive = true,
                    IsPublic = false,
                    DisputeGuid = dispute.DisputeGuid
                };
            }
            else
            {
                factIssueOutcome = await DwUnitOfWork.FactIssueOutcomeRepository.GetByFileNumber(dispute.DisputeGuid);
            }

            factIssueOutcome.LoadDateTime = DateTime.UtcNow;
            factIssueOutcome.DisputeUrgency = dispute.DisputeUrgency;
            factIssueOutcome.DisputeCreationMethod = dispute.CreationMethod;
            factIssueOutcome.DisputeType = dispute.DisputeType;
            factIssueOutcome.DisputeSubType = dispute.DisputeSubType;
            factIssueOutcome.SubmittedDateTime = dispute.SubmittedDate;
            factIssueOutcome.InitialPaymentDateTime = dispute.InitialPaymentDate;
            factIssueOutcome.InitialPaymentMethod = dispute.InitialPaymentMethod;

            var claimGroups = await UnitOfWork.ClaimGroupRepository
                .GetDisputeClaimGroupsWithAllChilds(dispute.DisputeGuid);
            if (claimGroups != null)
            {
                foreach (var claimGroup in claimGroups)
                {
                    factIssueOutcome.ClaimGroupId = claimGroup.ClaimGroupId;

                    var claims = claimGroup.Claims;
                    if (claims != null)
                    {
                        foreach (var claim in claims)
                        {
                            factIssueOutcome.ClaimId = claim.ClaimId;
                            factIssueOutcome.ClaimCode = claim.ClaimCode;
                            factIssueOutcome.ClaimCreatedDate = claim.CreatedDate;
                            factIssueOutcome.IsAmended = claim.IsAmended;

                            var remedies = claim.Remedies;
                            if (remedies != null)
                            {
                                foreach (var remedy in remedies)
                                {
                                    factIssueOutcome.AwardDate = remedy.AwardedDate ?? remedy.ModifiedDate;
                                    factIssueOutcome.AwardedBy = remedy.ModifiedBy;
                                    factIssueOutcome.RemedyStatus = remedy.RemedyStatus;
                                    factIssueOutcome.RemedySubStatus = remedy.RemedySubStatus;
                                    factIssueOutcome.AwardedAmount = remedy.AwardedAmount;
                                    factIssueOutcome.AwardedDate = remedy.AwardedDate;
                                    factIssueOutcome.AwardedDaysAfterService = remedy.AwardedDaysAfterService;
                                    factIssueOutcome.IsReviewed = remedy.IsReviewed;
                                    factIssueOutcome.PrevRemedyStatus = remedy.PrevRemedyStatus;
                                    factIssueOutcome.PrevAwardDate = remedy.PrevAwardDate;
                                    factIssueOutcome.PrevAwardedBy = remedy.PrevAwardBy;
                                    factIssueOutcome.PrevAwardedDate = remedy.PrevAwardedDate;
                                    factIssueOutcome.PrevAwardedDaysAfterService = remedy.PrevAwardedDaysAfterService;
                                    factIssueOutcome.PrevAwardedAmount = remedy.PrevAwardedAmount;

                                    var remedyDetails = remedy.RemedyDetails;
                                    if (remedyDetails != null)
                                    {
                                        foreach (var remedyDetail in remedyDetails)
                                        {
                                            factIssueOutcome.RequestedAmount = remedyDetail.Amount;
                                        }
                                    }
                                }
                            }

                            result.Add(factIssueOutcome);
                        }
                    }
                }
            }

            return result;
        }
    }
}
