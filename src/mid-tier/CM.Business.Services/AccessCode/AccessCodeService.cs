using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.AccessCode;
using CM.Business.Entities.Models.AuditLog;
using CM.Business.Services.AuditLogs;
using CM.Business.Services.Base;
using CM.Business.Services.DisputeAccess;
using CM.Business.Services.TokenServices;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using CM.Messages.EmailGenerator.Events;
using EasyNetQ;

namespace CM.Business.Services.AccessCode;

public class AccessCodeService : CmServiceBase, IAccessCodeService
{
    private readonly IAuditLogService _auditLogService;

    private readonly IBus _bus;

    private readonly IDisputeAccessService _disputeAccessService;
    private readonly ITokenService _tokenService;

    public AccessCodeService(IMapper mapper, IUnitOfWork unitOfWork, IBus bus, ITokenService tokenService, IDisputeAccessService disputeAccessService, IAuditLogService auditLogService)
        : base(unitOfWork, mapper)
    {
        _tokenService = tokenService;
        _disputeAccessService = disputeAccessService;
        _auditLogService = auditLogService;
        _bus = bus;
    }

    public async Task<string> Authenticate(int userId, int participantId)
    {
        var user = await UnitOfWork.SystemUserRepository.GetByIdAsync(userId);
        if (user?.IsActive != null && user.IsActive.Value)
        {
            var systemUserId = user.SystemUserId;
            var role = await UnitOfWork.RoleRepository.GetByIdAsync((int)Roles.AccessCodeUser);
            var token = await _tokenService.GenerateToken(role.SessionDuration, systemUserId, participantId);
            return token.AuthToken;
        }

        return null;
    }

    public async Task<Participant> CheckAccessCodeExistence(string accesscode)
    {
        var participant = await UnitOfWork.ParticipantRepository.GetByAccessCode(accesscode);
        return participant;
    }

    public async Task<bool> CheckDisputeStatus(Guid disputeGuid)
    {
        var dispute = await UnitOfWork.DisputeRepository.GetDisputeByGuidAsync(disputeGuid);
        return await IsClosedDispute(dispute);
    }

    public async Task<DisputeAccessResponse> GetAccessCodeFileInfo(string token)
    {
        var fileInfo = new DisputeAccessResponse();

        var userToken = await UnitOfWork.TokenRepository.GetTokenAsync(token);
        Debug.Assert(userToken.ParticipantId != null, "userToken.ParticipantId != null");
        var participant = await UnitOfWork.ParticipantRepository.GetByIdAsync(userToken.ParticipantId.Value);
        if (participant != null)
        {
            var dispute = await UnitOfWork.DisputeRepository.GetDisputeByGuidAsync(participant.DisputeGuid);
            if (dispute != null)
            {
                fileInfo = await _disputeAccessService.GatherDisputeData(dispute, false);
            }

            fileInfo.TokenParticipantId = participant.ParticipantId;
        }

        return fileInfo;
    }

    public async Task<DisputeUser> GetAssociatedDisputeUser(Participant participant)
    {
        var disputeUser = await UnitOfWork.DisputeUserRepository.GetByParticipant(participant);
        if (disputeUser != null)
        {
            return disputeUser;
        }

        disputeUser = await CreateNewSystemUser(participant);
        return disputeUser;
    }

    public async Task<bool> TrySendAccessCodeRecoveryEmailAsync(int fileNumber, string email)
    {
        var dispute = await UnitOfWork.DisputeRepository.GetDisputeByFileNumber(fileNumber);

        if (dispute == null)
        {
            return false;
        }

        var participantList = await UnitOfWork.ParticipantRepository.GetDisputeParticipantsAsync(dispute.DisputeGuid);

        try
        {
            foreach (var participant in participantList)
            {
                if (participant.Email.CompareIgnoreCaseAndSpaces(email))
                {
                    var emailGenerateIntegrationEvent = new EmailGenerateIntegrationEvent
                    {
                        DisputeGuid = dispute.DisputeGuid,
                        MessageType = EmailMessageType.SystemEmail,
                        AssignedTemplateId = AssignedTemplate.AccessCodeRecovery,
                        ParticipantId = participant.ParticipantId
                    };

                    emailGenerateIntegrationEvent.Publish(_bus);
                }
            }

            return true;
        }
        catch (InvalidOperationException)
        {
            await AuditLogInfoAsync(dispute, email, "Participant not found");
        }

        return false;
    }

    public async Task<DisputeClosedResponse> GetClosedDisputeInfo(string accesscode)
    {
        var participant = await UnitOfWork.ParticipantRepository.GetByAccessCodeWithDispute(accesscode);
        var dispute = participant.Dispute;

        var claimGroups = new List<DisputeAccessClaimGroup>();
        var disputeClaimGroups = await UnitOfWork.ClaimGroupRepository.GetDisputeClaimGroups(dispute.DisputeGuid);
        if (disputeClaimGroups != null)
        {
            foreach (var item in disputeClaimGroups)
            {
                var participants = new List<DisputeAccessParticipant>();
                var claimGroupParticipants = await UnitOfWork.ClaimGroupParticipantRepository.GetByClaimGroupIdAsync(item.ClaimGroupId);
                foreach (var p in claimGroupParticipants)
                {
                    participants.Add(new DisputeAccessParticipant
                    {
                        ParticipantId = p.ParticipantId,
                        ParticipantStatus = p.Participant.ParticipantStatus,
                        GroupParticipantRole = p.GroupParticipantRole,
                        GroupPrimaryContactId = p.GroupPrimaryContactId,
                        AcceptedTou = p.Participant.AcceptedTou,
                        AcceptedTouDate = p.Participant.AcceptedTouDate,
                        Email = p.Participant.Email.ToEmailHint(),
                        NoEmail = p.Participant.NoEmail,
                        EmailVerified = p.Participant.EmailVerified,
                        PrimaryPhone = p.Participant.PrimaryPhone.ToPhoneHint(),
                        PrimaryPhoneVerified = p.Participant.PrimaryPhoneVerified,
                        PrimaryContactMethod = p.Participant.PrimaryContactMethod,
                        SecondaryPhone = p.Participant.SecondaryPhone.ToPhoneHint(),
                        SecondaryPhoneVerified = p.Participant.SecondaryPhoneVerified,
                        SecondaryContactMethod = p.Participant.SecondaryContactMethod,
                        Fax = p.Participant.Fax.ToPhoneHint(),
                        NameAbbreviation = p.Participant.NameAbbreviation,
                        AccessCode = p.Participant.AccessCode.ToAccessCodeHint()
                    });
                }

                claimGroups.Add(new DisputeAccessClaimGroup
                {
                    ClaimGroupId = item.ClaimGroupId,
                    Participants = participants
                });
            }
        }

        var disputeStatus = await UnitOfWork.DisputeStatusRepository.GetDisputeLastStatusAsync(dispute.DisputeGuid);
        var activeHearing = await UnitOfWork.HearingRepository.GetActiveHearings(dispute.DisputeGuid);

        var closedDispute = new DisputeClosedResponse
        {
            TokenParticipantId = participant.ParticipantId,
            DisputeGuid = participant.DisputeGuid,
            FileNumber = dispute.FileNumber,
            DisputeType = dispute.DisputeType,
            DisputeSubType = dispute.DisputeSubType,
            CrossAppFileNumber = dispute.CrossAppFileNumber,
            CreationMethod = dispute.CreationMethod,
            MigrationSourceOfTruth = dispute.MigrationSourceOfTruth,
            DisputeUrgency = dispute.DisputeUrgency,
            DisputeComplexity = dispute.DisputeComplexity,
            EvidenceOverride = disputeStatus.EvidenceOverride,
            CreatedDate = dispute.CreatedDate.ToCmDateTimeString(),
            ModifiedDate = dispute.ModifiedDate.ToCmDateTimeString(),
            DisputeLastModifiedDate = dispute.DisputeLastModified?.LastModifiedDate.ToCmDateTimeString(),
            DisputeStage = disputeStatus.Stage,
            DisputeStatus = disputeStatus.Status,
            SubmittedDate = dispute.SubmittedDate.ToCmDateTimeString(),
            DisputeProcess = disputeStatus.Process,
            Hearings = MapperService.Map<List<Hearing>, List<DisputeAccessHearing>>(activeHearing),
            ClaimGroups = claimGroups
        };

        return closedDispute;
    }

    public async Task<Dispute> GetDispute(Guid disputeGuid)
    {
        var dispute = await UnitOfWork.DisputeRepository.GetDisputeByGuidAsync(disputeGuid);
        return dispute;
    }

    public async Task<Hearing> GetHearing(Guid disputeGuid)
    {
        var hearing = await UnitOfWork.HearingRepository.GetLastHearing(disputeGuid);
        return hearing;
    }

    private async Task<bool> IsClosedDispute(Dispute dispute)
    {
        var closedStatuses = new[]
        {
            DisputeStatuses.SavedNotSubmitted,
            DisputeStatuses.UpdateRequired,
            DisputeStatuses.OfficeUploadRequired,
            DisputeStatuses.PaperApplicationUpdateRequired,
            DisputeStatuses.Withdrawn,
            DisputeStatuses.CancelledByRtb,
            DisputeStatuses.AbandonedNoPayment,
            DisputeStatuses.AbandonedApplicantInaction,
            DisputeStatuses.Deleted
        };

        var isClosed = false;
        var latestStatus = await UnitOfWork.DisputeStatusRepository.GetDisputeLastStatusAsync(dispute.DisputeGuid);

        var disputeStatus = (DisputeStatuses)latestStatus.Status;

        if (closedStatuses.Contains(disputeStatus))
        {
            isClosed = true;
        }

        return isClosed;
    }

    private async Task<DisputeUser> CreateNewSystemUser(Participant participant)
    {
        var newUser = new SystemUser
        {
            Username = participant.ParticipantId + participant.AccessCode,
            FullName = participant.ParticipantType == (int)ParticipantType.Business ? participant.BusinessName : participant.FirstName + " " + participant.LastName,
            SystemUserRoleId = (int)Roles.AccessCodeUser,
            Password = null,
            AdminAccess = false,
            IsActive = true,
            AccountEmail = participant.Email,
            UserGuid = Guid.NewGuid()
        };

        await UnitOfWork.SystemUserRepository.InsertAsync(newUser);
        var res = await UnitOfWork.Complete();
        if (res.CheckSuccess())
        {
            var newDisputeUser = new DisputeUser
            {
                SystemUserId = newUser.SystemUserId,
                ParticipantId = participant.ParticipantId,
                DisputeGuid = participant.DisputeGuid, IsActive = true
            };

            var disputeUser = await UnitOfWork.DisputeUserRepository.InsertAsync(newDisputeUser);
            var result = await UnitOfWork.Complete();
            if (result.CheckSuccess())
            {
                return disputeUser;
            }
        }

        return null;
    }

    private async System.Threading.Tasks.Task AuditLogInfoAsync(Dispute dispute, string email, string reason)
    {
        var auditLogInfo = new AuditLogRequest
        {
            ApiName = "api/accesscoderecovery",
            ApiCallType = "POST",
            ApiCallData = System.Text.Json.JsonSerializer.Serialize(new { email, dispute.FileNumber }),
            ChangeDate = DateTime.UtcNow,
            ApiErrorResponse = reason,
            ApiResponse = "OK",
            DisputeGuid = dispute.DisputeGuid
        };

        await _auditLogService.InsertAsync(auditLogInfo);
    }
}