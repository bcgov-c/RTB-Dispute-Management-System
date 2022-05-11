using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.AccessCode;
using CM.Business.Services.DisputeFlag;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.DisputeAccess;

public class DisputeAccessService : CmServiceBase, IDisputeAccessService
{
    private readonly IDisputeFlagService _disputeFlagService;

    public DisputeAccessService(IUnitOfWork unitOfWork, IMapper mapper, IDisputeFlagService disputeFlagService)
        : base(unitOfWork, mapper)
    {
        _disputeFlagService = disputeFlagService;
    }

    public async Task<DisputeAccessResponse> GatherDisputeData(Dispute dispute, bool includeNonDeliveredOutcomeDocs = true)
    {
        var disputeAccessResponse = MapperService.Map<Dispute, DisputeAccessResponse>(dispute);
        var externalUpdateClaimGroup = new DisputeAccessClaimGroup();

        var currentNotice = await UnitOfWork.NoticeRepository.GetCurrentNotice(dispute.DisputeGuid);
        if (currentNotice != null)
        {
            disputeAccessResponse.CurrentNoticeId = currentNotice.NoticeId;
            disputeAccessResponse.NoticeAssociatedTo = currentNotice.NoticeAssociatedTo;
        }

        var disputeLastStatus = await UnitOfWork.DisputeStatusRepository.GetDisputeLastStatusAsync(dispute.DisputeGuid);
        if (disputeLastStatus != null)
        {
            disputeAccessResponse.DisputeStatus = disputeLastStatus.Status;
            disputeAccessResponse.DisputeStage = disputeLastStatus.Stage;
            disputeAccessResponse.DisputeProcess = disputeLastStatus.Process;
            disputeAccessResponse.EvidenceOverride = disputeLastStatus.EvidenceOverride;
        }

        var lastHearing = await UnitOfWork.HearingRepository.GetLastHearing(dispute.DisputeGuid);
        if (lastHearing != null)
        {
            disputeAccessResponse.HearingStartDateTime = lastHearing.HearingStartDateTime.ToCmDateTimeString();
            disputeAccessResponse.LocalStartDateTime = lastHearing.LocalStartDateTime.ToCmDateTimeString();
            disputeAccessResponse.HearingId = lastHearing.HearingId;
            var lastDisputeHearing = await UnitOfWork.DisputeHearingRepository.GetLatestDisputeHearing(dispute.DisputeGuid, lastHearing.HearingId);
            disputeAccessResponse.DisputeHearingId = lastDisputeHearing.DisputeHearingId;
            disputeAccessResponse.DisputeHearingRole = lastDisputeHearing.DisputeHearingRole;
            disputeAccessResponse.SharedHearingLinkType = lastDisputeHearing.SharedHearingLinkType;

            var hearingParticipations = await UnitOfWork.HearingParticipationRepository.GetHearingParticipationListAsync(lastHearing.HearingId);
            if (hearingParticipations != null)
            {
                var externalUpdateHearingParticipations = MapperService.Map<List<HearingParticipation>, List<DisputeAccessHearingParticipation>>(hearingParticipations);
                disputeAccessResponse.HearingParticipations.AddRange(externalUpdateHearingParticipations);
            }
        }

        var claimGroups = await UnitOfWork.ClaimGroupRepository.GetDisputeClaimGroups(dispute.DisputeGuid);
        if (claimGroups != null)
        {
            foreach (var claimGroup in claimGroups)
            {
                externalUpdateClaimGroup.ClaimGroupId = claimGroup.ClaimGroupId;
                var claimGroupParticipants =
                    await UnitOfWork.ClaimGroupParticipantRepository
                        .GetByClaimGroupIdAsync(claimGroup.ClaimGroupId);

                if (claimGroupParticipants != null)
                {
                    foreach (var claimGroupParticipant in claimGroupParticipants)
                    {
                        var participant =
                            await UnitOfWork.ParticipantRepository
                                .GetByIdAsync(claimGroupParticipant.ParticipantId);

                        var externalUpdateParticipant =
                            MapperService.Map<Participant, DisputeAccessParticipant>(participant);
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

            disputeAccessResponse.ClaimGroups.Add(externalUpdateClaimGroup);
        }

        var claims = await UnitOfWork.ClaimRepository.GetDisputeClaimsForDisputeAccess(dispute.DisputeGuid);
        if (claims != null)
        {
            var externalUpdateClaims = MapperService.Map<List<Claim>, List<DisputeAccessClaim>>(claims);
            disputeAccessResponse.Claims.AddRange(externalUpdateClaims);
        }

        var disputeFees = await UnitOfWork.DisputeFeeRepository.GetByDisputeGuid(dispute.DisputeGuid);
        if (disputeFees != null)
        {
            var externalUpdateDisputeFees = MapperService.Map<List<DisputeFee>, List<DisputeAccessDisputeFee>>(disputeFees);
            foreach (var disputeFee in externalUpdateDisputeFees)
            {
                var paymentTransactions =
                    await UnitOfWork.PaymentTransactionRepository
                        .FindAllAsync(p => p.DisputeFeeId == disputeFee.DisputeFeeId);

                MapperService.Map<List<PaymentTransaction>, List<DisputeAccessPaymentTransaction>>(paymentTransactions.ToList());
            }

            disputeAccessResponse.DisputeFees.AddRange(externalUpdateDisputeFees);
        }

        var notices = await UnitOfWork.NoticeRepository.GetNoticesForDisputeAccess(dispute.DisputeGuid);
        foreach (var notice in notices)
        {
            var noticeServices = await notice.NoticeServices.ToListAsync();
            disputeAccessResponse.NoticeServices
                .AddRange(MapperService.Map<List<Data.Model.NoticeService>, List<DisputeAccessNoticeService>>(noticeServices));
        }

        var unlinkedFileDescriptions = await UnitOfWork.FileDescriptionRepository.GetDisputeUnlinkedFileDescriptionsAsync(dispute.DisputeGuid);
        disputeAccessResponse.UnlinkedFileDescriptions
            .AddRange(MapperService.Map<List<FileDescription>, List<DisputeAccessFileDescription>>(unlinkedFileDescriptions));

        if (unlinkedFileDescriptions != null)
        {
            foreach (var fileDescription in disputeAccessResponse.UnlinkedFileDescriptions)
            {
                var linkedFiles = await UnitOfWork.LinkedFileRepository.GetLinkedFilesByFileDescription(fileDescription.FileDescriptionId);
                fileDescription.LinkedFiles = MapperService.Map<List<LinkedFile>, List<DisputeAccessLinkedFile>>(linkedFiles);
            }
        }

        var outcomeDocGroups = await UnitOfWork.OutcomeDocGroupRepository.GetByDisputeGuidWithDocuments(dispute.DisputeGuid, includeNonDeliveredOutcomeDocs);

        var outcomeDocGroupResponse = new List<DisputeOutcomeDocGroupResponse>();

        if (outcomeDocGroups != null)
        {
            foreach (var outcomeDocGroup in outcomeDocGroups)
            {
                var outcomeDocGroupResponseItem = MapperService.Map<OutcomeDocGroup, DisputeOutcomeDocGroupResponse>(outcomeDocGroup);
                var associatedRoleGroup = await UnitOfWork.InternalUserRoleRepository.GetByUserId(outcomeDocGroupResponseItem.AssociatedId.Value);
                outcomeDocGroupResponseItem.AssociatedRoleGroupId = associatedRoleGroup.RoleGroupId;
                outcomeDocGroupResponse.Add(outcomeDocGroupResponseItem);
            }
        }

        disputeAccessResponse.OutcomeDocGroups = outcomeDocGroupResponse;

        var outcomeDocRequests = await UnitOfWork.OutcomeDocRequestRepository.GetOutcomeDocRequests(dispute.DisputeGuid);

        var outcomeDocRequestsResponse = MapperService.Map<List<Data.Model.OutcomeDocRequest>, List<DisputeOutcomeDocRequestsResponse>>(outcomeDocRequests);

        disputeAccessResponse.OutcomeDocRequests = outcomeDocRequestsResponse;

        var emailMessages = await UnitOfWork.EmailMessageRepository.FindAllAsync(x => x.DisputeGuid == dispute.DisputeGuid && x.MessageType >= (byte)EmailMessageType.Pickup);
        var pickupMessagesResponse = MapperService.Map<List<EmailMessage>, List<PickupMessage>>(emailMessages.ToList());
        disputeAccessResponse.PickupMessages = pickupMessagesResponse;

        var disputeFlags = await _disputeFlagService.GetLinkedFlags(dispute.DisputeGuid);
        disputeAccessResponse.LinkedDisputeFlags = disputeFlags;

        return disputeAccessResponse;
    }
}