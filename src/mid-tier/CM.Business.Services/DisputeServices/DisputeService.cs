using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.AccessCode;
using CM.Business.Entities.Models.ClaimDetail;
using CM.Business.Entities.Models.Dispute;
using CM.Business.Entities.Models.ExternalUpdate;
using CM.Business.Entities.Models.Hearing;
using CM.Business.Services.DisputeFlag;
using CM.Business.Services.DisputeStatusHandler;
using CM.Business.Services.Hearings;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using CM.UserResolverService;
using EasyNetQ;

namespace CM.Business.Services.DisputeServices;

public class DisputeService : CmServiceBase, IDisputeService
{
    private readonly IDisputeFlagService _disputeFlagService;
    private readonly IHearingAuditLogService _hearingAuditLogService;

    public DisputeService(IMapper mapper, IUnitOfWork unitOfWork, IUserResolver userResolver, IBus bus, IHearingAuditLogService hearingAuditLogService, IDisputeFlagService disputeFlagService)
        : base(unitOfWork, mapper)
    {
        UserResolver = userResolver;
        Bus = bus;
        _hearingAuditLogService = hearingAuditLogService;
        _disputeFlagService = disputeFlagService;
    }

    private IUserResolver UserResolver { get; }

    private IBus Bus { get; }

    public async Task<CreateDisputeResponse> CreateAsync(int userId)
    {
        var dispute = new Dispute
        {
            DisputeGuid = Guid.NewGuid(),
            OwnerSystemUserId = userId,

            DisputeStatuses = new List<DisputeStatus>
            {
                new()
                {
                    Status = (byte)DisputeStatuses.SavedNotSubmitted,
                    Stage = (byte)DisputeStage.ApplicationInProgress,
                    StatusStartDate = DateTime.UtcNow,
                    DurationSeconds = 0,
                    IsActive = true
                }
            },

            DisputeUsers = new List<DisputeUser>
            {
                new()
                {
                    SystemUserId = userId,
                    IsActive = true
                }
            }
        };

        var createdDispute = await UnitOfWork.DisputeRepository.InsertAsync(dispute);
        await UnitOfWork.Complete();

        return new CreateDisputeResponse
        {
            DisputeGuid = createdDispute.DisputeGuid
        };
    }

    public async Task<Dispute> PatchDisputeAsync(Dispute dispute)
    {
        var originalDispute = await UnitOfWork.DisputeRepository.GetNoTrackingByIdAsync(x => x.DisputeId == dispute.DisputeId);

        if (dispute.TenancyGeozoneId != null && originalDispute.FileNumber == null)
        {
            dispute.FileNumber = int.Parse(dispute.TenancyGeozoneId + dispute.DisputeId.ToString());
        }

        UnitOfWork.DisputeRepository.Attach(dispute);
        var result = await UnitOfWork.Complete();

        if (result.CheckSuccess())
        {
            return dispute;
        }

        return null;
    }

    public async Task<DisputeListResponse> GetAllAsync(int count, int index, int userId, int? creationMethod)
    {
        if (count == 0)
        {
            count = Pagination.DefaultPageSize;
        }

        var getApplicationResponse = new DisputeListResponse();
        var disputes = await UnitOfWork.DisputeRepository.GetUsersDisputesAsync(userId, count, index, creationMethod);
        if (disputes != null)
        {
            getApplicationResponse.Disputes = MapperService.Map<List<Dispute>, List<DisputeListResponseEntity>>(disputes);

            foreach (var dispute in getApplicationResponse.Disputes)
            {
                var disputeGuid = dispute.DisputeGuid;

                dispute.UnpaidIntakeFee = await UnitOfWork.DisputeFeeRepository.HasUnpaidIntakeFee(disputeGuid);

                dispute.PrimaryApplicantAccessCode = await GetPrimaryApplicantAccessCode(disputeGuid);

                var latestHearing = await UnitOfWork.HearingRepository.GetLastHearing(disputeGuid);
                dispute.DisputeHearing = MapperService.Map<Hearing, DisputeListHearingResponse>(latestHearing);
                if (latestHearing != null)
                {
                    dispute.DisputeHearing.SharedHearingLinkType =
                        latestHearing.DisputeHearings.LastOrDefault()?.SharedHearingLinkType;
                    if (latestHearing.ConferenceBridgeId.HasValue)
                    {
                        var conferenceBridge = await UnitOfWork.ConferenceBridgeRepository.GetByIdAsync(latestHearing.ConferenceBridgeId.Value);

                        if (conferenceBridge != null)
                        {
                            dispute.DisputeHearing.DialInDescription1 = conferenceBridge.DialInDescription1;
                            dispute.DisputeHearing.DialInDescription2 = conferenceBridge.DialInDescription2;
                            dispute.DisputeHearing.DialInNumber1 = conferenceBridge.DialInNumber1;
                            dispute.DisputeHearing.DialInNumber2 = conferenceBridge.DialInNumber2;
                            dispute.DisputeHearing.ParticipantCode = conferenceBridge.ParticipantCode;
                        }
                    }
                }

                var claimGroups = await UnitOfWork.ClaimGroupRepository.GetDisputeClaimGroups(dispute.DisputeGuid);
                if (claimGroups != null)
                {
                    var externalUpdateClaimGroup = new DisputeAccessClaimGroup();
                    foreach (var claimGroup in claimGroups)
                    {
                        externalUpdateClaimGroup.ClaimGroupId = claimGroup.ClaimGroupId;

                        var claimGroupParticipants = await UnitOfWork.ClaimGroupParticipantRepository
                            .GetByClaimGroupIdAsync(claimGroup.ClaimGroupId);

                        if (claimGroupParticipants != null)
                        {
                            foreach (var claimGroupParticipant in claimGroupParticipants)
                            {
                                var participant = await UnitOfWork.ParticipantRepository
                                    .GetByIdAsync(claimGroupParticipant.ParticipantId);

                                var externalUpdateParticipant = MapperService.Map<Participant, DisputeAccessParticipant>(participant);
                                externalUpdateParticipant.Email = externalUpdateParticipant.Email.ToEmailHint();
                                externalUpdateParticipant.PrimaryPhone = externalUpdateParticipant.PrimaryPhone.ToPhoneHint();
                                externalUpdateParticipant.Fax = externalUpdateParticipant.Fax.ToPhoneHint();
                                externalUpdateParticipant.SecondaryPhone = externalUpdateParticipant.SecondaryPhone.ToPhoneHint();
                                externalUpdateParticipant.GroupParticipantRole = claimGroupParticipant.GroupParticipantRole;
                                externalUpdateParticipant.GroupPrimaryContactId = claimGroupParticipant.GroupPrimaryContactId;
                                externalUpdateClaimGroup.Participants.Add(externalUpdateParticipant);
                            }
                        }
                    }

                    dispute.ClaimGroups.Add(externalUpdateClaimGroup);
                }

                var disputeFlags = await _disputeFlagService.GetLinkedFlagsFromHearing(latestHearing, disputeGuid);
                dispute.LinkedDisputeFlags = disputeFlags;

                var latestNotice = await UnitOfWork.NoticeRepository.GetCurrentNotice(disputeGuid);
                if (latestNotice != null)
                {
                    dispute.LatestNoticeId = latestNotice.NoticeId;
                    dispute.LatestNoticeDeliveryDate = latestNotice.NoticeDeliveredDate.ToCmDateTimeString();
                    dispute.LatestNoticeHasServiceDeadline = latestNotice.HasServiceDeadline;
                    dispute.LatestNoticeServiceDeadlineDate = latestNotice.ServiceDeadlineDate.ToCmDateTimeString();
                    dispute.LatestNoticeSecondServiceDeadlineDate = latestNotice.SecondServiceDeadlineDate.ToCmDateTimeString();
                }
            }

            getApplicationResponse.TotalAvailableRecords = await UnitOfWork.DisputeRepository.GetDisputesCountAsync(userId, creationMethod);

            foreach (var disputeResponse in getApplicationResponse.Disputes)
            {
                var lastStatus =
                    await UnitOfWork.DisputeStatusRepository.GetDisputeLastStatusAsync(disputeResponse.DisputeGuid);
                var lastStatusResponse = MapperService.Map<DisputeStatus, DisputeStatusResponse>(lastStatus);
                disputeResponse.LastDisputeStatus = lastStatusResponse;
            }
        }

        return getApplicationResponse;
    }

    public async Task<DisputeResponse> GetDisputeResponseAsync(Guid disputeGuid)
    {
        var dispute = await UnitOfWork.DisputeRepository.GetDisputeByGuidAsync(disputeGuid);
        var lastStatus = await UnitOfWork.DisputeStatusRepository.GetDisputeLastStatusAsync(disputeGuid);
        if (dispute != null)
        {
            var disputeResponse = MapperService.Map<Dispute, DisputeResponse>(dispute);
            if (lastStatus != null)
            {
                var lastStatusResponse = MapperService.Map<DisputeStatus, DisputeStatusResponse>(lastStatus);
                disputeResponse.LastDisputeStatus = lastStatusResponse;
            }

            return disputeResponse;
        }

        return null;
    }

    public async Task<Dispute> GetDisputeNoTrackAsync(Guid disputeGuid)
    {
        var dispute = await UnitOfWork.DisputeRepository.GetNoTrackDisputeByGuidAsync(disputeGuid);
        return dispute;
    }

    public async Task<DisputeStatusResponse> PostDisputeStatusAsync(DisputeStatusPostRequest request, Guid disputeGuid)
    {
        var dispute = await UnitOfWork.DisputeRepository.GetDisputeByGuidAsync(disputeGuid);
        if (dispute != null)
        {
            var disputeStatus = new DisputeStatus();
            var now = DateTime.UtcNow;

            var lastDisputeStatus = await UnitOfWork.DisputeStatusRepository.GetDisputeLastStatusAsync(disputeGuid);
            if (lastDisputeStatus != null)
            {
                disputeStatus.Status = request.Status ?? lastDisputeStatus.Status;
                disputeStatus.Stage = request.Stage ?? lastDisputeStatus.Stage;
                disputeStatus.Owner = request.Owner ?? lastDisputeStatus.Owner;
                disputeStatus.Process = request.Process ?? lastDisputeStatus.Process;
                disputeStatus.EvidenceOverride = request.EvidenceOverride ?? lastDisputeStatus.EvidenceOverride;
                disputeStatus.StatusSetBy = UserResolver.GetUserId();
                disputeStatus.DurationSeconds = 0;

                var duration = now - lastDisputeStatus.StatusStartDate;
                lastDisputeStatus.DurationSeconds = (int)duration.TotalSeconds;
                lastDisputeStatus.IsActive = false;

                UnitOfWork.DisputeStatusRepository.Attach(lastDisputeStatus);
            }

            disputeStatus.DisputeGuid = disputeGuid;

            disputeStatus.StatusNote = request.StatusNote;
            disputeStatus.EvidenceOverride = request.EvidenceOverride;
            disputeStatus.StatusStartDate = now;
            disputeStatus.IsActive = true;

            HandleStatusTransition(lastDisputeStatus, disputeStatus, dispute);

            var result = await UnitOfWork.DisputeStatusRepository.InsertAsync(disputeStatus);

            if (disputeStatus.Status.Equals((byte)DisputeStatusName.Submitted))
            {
                dispute.SubmittedDate = now.GetCmDateTime();
                ////dispute.SubmittedBy = userId;

                UnitOfWork.DisputeRepository.Attach(dispute);
            }

            if (request.Status == (byte?)DisputeStatuses.Withdrawn)
            {
                await UnlinkHearingFromDispute(disputeGuid);
            }

            var completeResult = await UnitOfWork.Complete();
            completeResult.AssertSuccess();

            if (request.Process != null)
            {
                if (lastDisputeStatus != null && lastDisputeStatus.Process != request.Process)
                {
                    var disputeProcessDetail = new Data.Model.DisputeProcessDetail
                    {
                        DisputeGuid = disputeGuid,
                        StartDisputeStatusId = result.DisputeStatusId,
                        AssociatedProcess = (byte)request.Process,
                        CreatedBy = Constants.UndefinedUserId,
                        CreatedDate = DateTime.UtcNow
                    };

                    await UnitOfWork.DisputeProcessDetailRepository.InsertAsync(disputeProcessDetail);
                    var completeInsertResult = await UnitOfWork.Complete();
                    completeInsertResult.AssertSuccess();
                }
            }

            return MapperService.Map<DisputeStatus, DisputeStatusResponse>(result);
        }

        return null;
    }

    public async Task<ExternalUpdateDisputeStatusResponse> PostDisputeStatusAsync(ExternalUpdateDisputeStatusRequest request, Guid disputeGuid, int userId)
    {
        var dispute = await UnitOfWork.DisputeRepository.GetDisputeByGuidAsync(disputeGuid);
        if (dispute != null)
        {
            var disputeStatus = new DisputeStatus();
            var now = DateTime.UtcNow;

            var lastDisputeStatus = await UnitOfWork.DisputeStatusRepository.GetDisputeLastStatusAsync(disputeGuid);
            if (lastDisputeStatus != null)
            {
                disputeStatus.Status = request.Status ?? lastDisputeStatus.Status;
                disputeStatus.Stage = request.Stage ?? lastDisputeStatus.Stage;
                disputeStatus.Owner = lastDisputeStatus.Owner;
                disputeStatus.Process = request.Process ?? lastDisputeStatus.Process;
                disputeStatus.EvidenceOverride = lastDisputeStatus.EvidenceOverride;
                disputeStatus.StatusNote = lastDisputeStatus.StatusNote;
                disputeStatus.StatusSetBy = Constants.UndefinedUserId;
                disputeStatus.DurationSeconds = 0;

                var duration = now - lastDisputeStatus.StatusStartDate;
                lastDisputeStatus.DurationSeconds = (int)duration.TotalSeconds;
                lastDisputeStatus.IsActive = false;
                UnitOfWork.DisputeStatusRepository.Attach(lastDisputeStatus);

                disputeStatus.DisputeGuid = disputeGuid;
                disputeStatus.StatusStartDate = now;
                disputeStatus.IsActive = true;

                var result = await UnitOfWork.DisputeStatusRepository.InsertAsync(disputeStatus);

                if (disputeStatus.Status.Equals((byte)DisputeStatusName.Submitted))
                {
                    dispute.SubmittedDate = now.GetCmDateTime();
                    dispute.SubmittedBy = Constants.UndefinedUserId;

                    UnitOfWork.DisputeRepository.Attach(dispute);
                }

                var complete = await UnitOfWork.Complete();
                if (complete.CheckSuccess())
                {
                    HandleStatusTransition(lastDisputeStatus, disputeStatus, dispute);
                }

                if (request.Process != null)
                {
                    if (lastDisputeStatus.Process != request.Process)
                    {
                        var disputeProcessDetail = new Data.Model.DisputeProcessDetail
                        {
                            DisputeGuid = disputeGuid,
                            StartDisputeStatusId = result.DisputeStatusId,
                            AssociatedProcess = (byte)request.Process,
                            CreatedBy = Constants.UndefinedUserId,
                            CreatedDate = DateTime.UtcNow
                        };

                        await UnitOfWork.DisputeProcessDetailRepository.InsertAsync(disputeProcessDetail);
                        var completeResult = await UnitOfWork.Complete();
                        completeResult.AssertSuccess();
                    }
                }

                return MapperService.Map<DisputeStatus, ExternalUpdateDisputeStatusResponse>(result);
            }
        }

        return null;
    }

    public async Task<bool> DisputeExistsAsync(Guid disputeGuid)
    {
        var dispute = await UnitOfWork.DisputeRepository.GetDisputeByGuidAsync(disputeGuid);
        return dispute != null;
    }

    public async Task<bool> DisputeStatusExistsAsync(int disputeStatusId)
    {
        var disputeStatus = await UnitOfWork.DisputeStatusRepository.GetByIdAsync(disputeStatusId);
        return disputeStatus != null;
    }

    public async Task<bool> IfFirstStatus(Guid disputeGuid)
    {
        var disputeStatus = await UnitOfWork.DisputeStatusRepository.FindAllAsync(d => d.DisputeGuid == disputeGuid);

        if (disputeStatus == null)
        {
            return true;
        }

        if (disputeStatus.Count != 0)
        {
            return false;
        }

        return true;
    }

    public async Task<List<DisputeStatusResponse>> GetDisputeStatusesAsync(Guid disputeGuid)
    {
        var disputeStatuses =
            await UnitOfWork.DisputeStatusRepository.FindAllAsync(d => d.DisputeGuid == disputeGuid);

        if (disputeStatuses != null)
        {
            var disputeStatusesList =
                MapperService.Map<List<DisputeStatus>, List<DisputeStatusResponse>>(disputeStatuses.ToList());
            disputeStatusesList = disputeStatusesList.OrderByDescending(d => d.DisputeStatusId).ToList();
            return disputeStatusesList;
        }

        return new List<DisputeStatusResponse>();
    }

    public async Task<DisputeStatusResponse> GetDisputeLastStatusAsync(Guid disputeGuid)
    {
        var disputeStatus = await UnitOfWork.DisputeStatusRepository.GetDisputeLastStatusAsync(disputeGuid);
        if (disputeStatus != null)
        {
            return MapperService.Map<DisputeStatus, DisputeStatusResponse>(disputeStatus);
        }

        return null;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object id)
    {
        var disputeLastModified = await UnitOfWork.DisputeRepository.GetLastModifiedDate((Guid)id);
        return disputeLastModified;
    }

    public async Task<ICollection<DisputeUser>> GetDisputeUsersAsync(Guid disputeGuid)
    {
        var disputeUsers = await UnitOfWork.DisputeUserRepository
            .FindAllAsync(du => du.DisputeGuid == disputeGuid);

        return disputeUsers;
    }

    public async Task<Dispute> GetDisputeByFileNumber(int fileNumber)
    {
        var dispute = await UnitOfWork.DisputeRepository.GetDisputeByFileNumber(fileNumber);
        return dispute;
    }

    public bool StatusChangeAllowed(ExternalUpdateDisputeStatusRequest disputeStatus, DisputeStatusResponse lastDisputeStatus)
    {
        var isAllowed = lastDisputeStatus.Status switch
        {
            (byte)DisputeStatuses.WaitingForProofOfService when
                lastDisputeStatus.Stage == (byte)DisputeStage.ServingDocuments &&
                disputeStatus.Status == (byte)DisputeStatuses.OpenForSubmissions &&
                disputeStatus.Stage == (byte)DisputeStage.HearingPending => true,
            (byte)DisputeStatuses.WaitingForProofOfService when
            lastDisputeStatus.Stage == (byte)DisputeStage.ServingDocuments &&
            disputeStatus.Status == (byte)DisputeStatuses.ClosedForSubmissions &&
            disputeStatus.Stage == (byte)DisputeStage.HearingPending => true,
            (byte)DisputeStatuses.PaymentRequired when
                lastDisputeStatus.Stage == (byte)DisputeStage.ApplicationInProgress &&
                disputeStatus.Status == (byte)DisputeStatuses.Received &&
                disputeStatus.Stage == (byte)DisputeStage.ApplicationScreening => true,
            (byte)DisputeStatuses.FeeWaiverProofRequired when
                lastDisputeStatus.Stage == (byte)DisputeStage.ApplicationInProgress &&
                disputeStatus.Status == (byte)DisputeStatuses.Received &&
                disputeStatus.Stage == (byte)DisputeStage.ApplicationScreening => true,
            (byte)DisputeStatuses.OfficePaymentRequired when
                lastDisputeStatus.Stage == (byte)DisputeStage.ApplicationInProgress &&
                disputeStatus.Status == (byte)DisputeStatuses.Received &&
                disputeStatus.Stage == (byte)DisputeStage.ApplicationScreening => true,
            (byte)DisputeStatuses.OfficeUploadRequired when
                lastDisputeStatus.Stage == (byte)DisputeStage.ApplicationInProgress &&
                disputeStatus.Status == (byte)DisputeStatuses.PaymentRequired &&
                disputeStatus.Stage == (byte)DisputeStage.ApplicationInProgress => true,
            (byte)DisputeStatuses.Closed when
                lastDisputeStatus.Stage == (byte)DisputeStage.DecisionAndPostSupport &&
                disputeStatus.Status == (byte)DisputeStatuses.Received &&
                disputeStatus.Stage == (byte)DisputeStage.ApplicationScreening => true,
            (byte)DisputeStatuses.PaperApplicationUpdateRequired when
                lastDisputeStatus.Stage == (byte)DisputeStage.ApplicationInProgress &&
                disputeStatus.Status == (byte)DisputeStatuses.Received &&
                disputeStatus.Stage == (byte)DisputeStage.ApplicationScreening => true,
            (byte)DisputeStatuses.Received when lastDisputeStatus.Owner.GetValueOrDefault() == 0 &&
                                                lastDisputeStatus.Stage == (byte)DisputeStage.ApplicationScreening &&
                                                disputeStatus.Status == (byte)DisputeStatuses.ScreeningDecisionRequired &&
                                                disputeStatus.Stage == (byte)DisputeStage.ApplicationScreening => true,
            (byte)DisputeStatuses.Received when
                lastDisputeStatus.Stage == (byte)DisputeStage.ApplicationScreening &&
                disputeStatus.Status == (byte)DisputeStatuses.ProcessDecisionRequired &&
                disputeStatus.Stage == (byte)DisputeStage.ApplicationScreening => true,
            (byte)DisputeStatuses.OfficeUploadRequired when
            lastDisputeStatus.Stage == (byte)DisputeStage.ApplicationInProgress &&
            disputeStatus.Status == (byte)DisputeStatuses.Received &&
            disputeStatus.Stage == (byte)DisputeStage.ApplicationScreening => true,
            (byte)DisputeStatuses.Dismissed when
                lastDisputeStatus.Stage == (byte)DisputeStage.ServingDocuments &&
                disputeStatus.Status == (byte)DisputeStatuses.OpenForSubmissions &&
                disputeStatus.Stage == (byte)DisputeStage.HearingPending => true,
            (byte)DisputeStatuses.WaitingForProofOfService when
                lastDisputeStatus.Stage == (byte)DisputeStage.ServingDocuments &&
                disputeStatus.Status == (byte)DisputeStatuses.ProcessDecisionRequired &&
                disputeStatus.Stage == (byte)DisputeStage.ApplicationScreening => true,
            _ => false
        };

        return isAllowed;
    }

    public async Task<bool> IsDisputeUser(Guid disputeGuid, int userId)
    {
        var disputeUser = await UnitOfWork.DisputeUserRepository.GetDisputeUser(disputeGuid, userId);
        return disputeUser != null;
    }

    public async Task<List<DisputeUserGetResponse>> GetDisputeUsers(Guid disputeGuid)
    {
        var disputeUsers = await UnitOfWork
            .DisputeUserRepository
            .FindAllAsync(x => x.DisputeGuid == disputeGuid);
        var usersId = disputeUsers.Select(x => x.SystemUserId);
        var users = await UnitOfWork.SystemUserRepository.GetUsers(usersId);

        var mappedUsers = MapperService.Map<ICollection<DisputeUser>, ICollection<DisputeUserGetResponse>>(disputeUsers);

        foreach (var user in mappedUsers)
        {
            var u = users.FirstOrDefault(x => x.SystemUserId == user.SystemUserId);
            user.SystemUserRoleId = u.SystemUserRoleId;
            user.Username = u.Username;
            user.FullName = u.FullName;
        }

        return mappedUsers.ToList();
    }

    public async Task<bool> IsDisputeUserModified(int disputeUserId, DateTime unmodifiedSince)
    {
        var lastModified = await GetLastModifiedDisputeUserAsync(disputeUserId);

        if (lastModified?.Ticks > unmodifiedSince.Ticks)
        {
            return true;
        }

        return false;
    }

    public async Task<DisputeUser> GetDisputeUser(int disputeUserId)
    {
        var disputeUser = await UnitOfWork.DisputeUserRepository.GetNoTrackingByIdAsync(x => x.DisputeUserId == disputeUserId);
        return disputeUser;
    }

    public async Task<DisputeUserGetResponse> PatchDisputeUserAsync(DisputeUser disputeUser)
    {
        UnitOfWork.DisputeUserRepository.Attach(disputeUser);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            var mappedUser = MapperService.Map<DisputeUser, DisputeUserGetResponse>(disputeUser);
            var user = await UnitOfWork.SystemUserRepository.GetUserWithFullInfo(disputeUser.SystemUserId);
            mappedUser.Username = user.Username;
            mappedUser.FullName = user.FullName;
            return mappedUser;
        }

        return null;
    }

    private async Task<DateTime?> GetLastModifiedDisputeUserAsync(int disputeUserId)
    {
        var lastModifiedDate = await UnitOfWork.DisputeUserRepository.GetLastModifiedDate(disputeUserId);
        return lastModifiedDate;
    }

    private async Task<string> GetPrimaryApplicantAccessCode(Guid disputeGuid)
    {
        return await UnitOfWork.ClaimGroupParticipantRepository.GetPrimaryApplicantAccessCode(disputeGuid);
    }

    private async System.Threading.Tasks.Task UnlinkHearingFromDispute(Guid disputeGuid)
    {
        var disputeHearings = await UnitOfWork.DisputeHearingRepository.GetDisputeHearingsByDispute(disputeGuid);
        if (disputeHearings != null)
        {
            foreach (var disputeHearing in disputeHearings)
            {
                var hearing = await UnitOfWork.HearingRepository.GetByIdAsync(disputeHearing.HearingId);
                if (hearing != null)
                {
                    if (hearing.HearingStartDateTime > DateTime.UtcNow)
                    {
                        disputeHearing.IsDeleted = true;
                        UnitOfWork.DisputeHearingRepository.Update(disputeHearing);
                        var completeResult = await UnitOfWork.Complete();

                        if (completeResult.CheckSuccess())
                        {
                            await _hearingAuditLogService.CreateAsync(HearingAuditLogCase.DeleteDisputeHearing, null, disputeHearing);
                        }
                    }

                    if (hearing.NotificationFileDescriptionId.HasValue)
                    {
                        var fileDescription = await UnitOfWork.FileDescriptionRepository.GetByIdAsync(hearing.NotificationFileDescriptionId.Value);
                        if (fileDescription != null)
                        {
                            fileDescription.IsDeficient = true;
                            fileDescription.IsDeficientReason = ConstantStrings.DeficientReason;
                            UnitOfWork.FileDescriptionRepository.Attach(fileDescription);
                        }

                        hearing.NotificationFileDescriptionId = null;
                        UnitOfWork.HearingRepository.Attach(hearing);
                    }
                }
            }
        }
    }

    private void HandleStatusTransition(DisputeStatus fromDisputeStatus, DisputeStatus toDisputeStatus, Dispute dispute)
    {
        DisputeTransition transition = new ParticipatoryApplicationSubmitted(Bus);
        transition
            ////UseCase1
            ////UseCase19
            .SetNext(new ParticipatoryApplicationSubmitted2(Bus))
            .SetNext(new ParticipatoryApplicationSubmitted3(Bus))
            .SetNext(new ParticipatoryApplicationSubmitted4(Bus))
            ////UseCase3
            .SetNext(new DisputeAbandonedForNoPaymentWithEmail(Bus))
            .SetNext(new DisputeAbandonedForNoPaymentWithEmail2(Bus))
            .SetNext(new DisputeAbandonedForNoPaymentWithEmail3(Bus))
            ////UseCase4
            .SetNext(new ParticipatoryDisputePaymentWaitingForFeeWaiverProof(Bus))
            .SetNext(new ParticipatoryDisputePaymentWaitingForFeeWaiverProof2(Bus))
            .SetNext(new ParticipatoryDisputePaymentWaitingForFeeWaiverProof3(Bus))
            ////UseCase5
            ////UseCase21
            .SetNext(new ParticipatoryDisputeWaitingForOfficePayment(Bus))
            .SetNext(new ParticipatoryDisputeWaitingForOfficePayment2(Bus))
            .SetNext(new ParticipatoryDisputeWaitingForOfficePayment3(Bus))
            ////UseCase8
            .SetNext(new DisputeWithdrawn(Bus))
            .SetNext(new DisputeWithdrawn2(Bus))
            .SetNext(new DisputeWithdrawn3(Bus))
            .SetNext(new DisputeWithdrawn4(Bus))
            ////UseCase9
            .SetNext(new DisputeCancelled(Bus))
            ////UseCase10
            ////UseCase23
            .SetNext(new ParticipatoryUpdateSubmitted(Bus))
            ////UseCase11
            .SetNext(new DirectRequestApplicationSubmitted(Bus))
            .SetNext(new DirectRequestApplicationSubmitted2(Bus))
            .SetNext(new DirectRequestApplicationSubmitted3(Bus))
            .SetNext(new DirectRequestApplicationSubmitted4(Bus))
            ////UseCase12
            .SetNext(new DirectRequestOfficePaymentRequired(Bus))
            .SetNext(new DirectRequestOfficePaymentRequired2(Bus))
            .SetNext(new DirectRequestOfficePaymentRequired3(Bus))
            ////UseCase13
            .SetNext(new DirectRequestUpdateSubmitted(Bus))
            ////UseCase16
            .SetNext(new DisputeAbandonedForNoServiceWithEmail(Bus))
            ////UseCase18
            .SetNext(new AricParticipatoryApplicationSubmitted(Bus))
            .SetNext(new AricParticipatoryApplicationSubmitted2(Bus))
            .SetNext(new AricParticipatoryApplicationSubmitted3(Bus))
            .SetNext(new AricParticipatoryApplicationSubmitted4(Bus))
            ////UseCase20
            .SetNext(new AricParticipatoryDisputeWaitingForOfficePayment(Bus))
            .SetNext(new AricParticipatoryDisputeWaitingForOfficePayment2(Bus))
            .SetNext(new AricParticipatoryDisputeWaitingForOfficePayment3(Bus))
            ////UseCase22
            .SetNext(new AricParticipatoryUpdateSubmitted(Bus));

        transition.Message(fromDisputeStatus, toDisputeStatus, dispute);
    }
}