using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.AccessCode;
using CM.Business.Entities.Models.EmailMessage;
using CM.Business.Entities.Models.OfficeUser;
using CM.Business.Entities.Models.Parties;
using CM.Business.Services.Base;
using CM.Business.Services.DisputeAccess;
using CM.Business.Services.Files;
using CM.Business.Services.SystemSettingsService;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using CM.Messages.EmailGenerator.Events;
using EasyNetQ;

namespace CM.Business.Services.OfficeUser;

public class OfficeUserService : CmServiceBase, IOfficeUserService
{
    private const string StatusNote = "Manual application submitted through office form";
    private const decimal AmountDue = 100;
    private readonly IDisputeAccessService _disputeAccessService;

    public OfficeUserService(IMapper mapper, IUnitOfWork unitOfWork, IBus bus, IDisputeAccessService disputeAccessService, ISystemSettingsService systemSettingsService, ICommonFileService commonFileService, IFileService fileService)
        : base(unitOfWork, mapper)
    {
        Bus = bus;
        SystemSettingsService = systemSettingsService;
        CommonFileService = commonFileService;
        FileService = fileService;
        _disputeAccessService = disputeAccessService;
    }

    private ISystemSettingsService SystemSettingsService { get; }

    private ICommonFileService CommonFileService { get; }

    private IFileService FileService { get; }

    private IBus Bus { get; }

    public async Task<DisputeAccessResponse> GetDisputeDetails(OfficeUserGetDisputeRequest request)
    {
        switch (request.SearchMethod)
        {
            case (byte)ExternalUpdateSearchMethod.FileNumber:
            {
                var externalUpdateDispute = await GetByFileNumber(request);
                return externalUpdateDispute;
            }

            case (byte)ExternalUpdateSearchMethod.AccessCode:
            {
                var externalUpdateDispute = await GetByAccessCode(request);
                return externalUpdateDispute;
            }

            default:
                return null;
        }
    }

    public async Task<OfficeUserPostDisputeResponse> CreateDispute(OfficeUserPostDisputeRequest request)
    {
        var nameAbbreviationLength = 10;
        var dispute = MapperService.Map<OfficeUserPostDisputeRequest, Dispute>(request);
        dispute.DisputeGuid = Guid.NewGuid();
        dispute.CreationMethod = request.CreationMethod ?? (byte?)DisputeCreationMethod.Manual;
        dispute.CreatedBy = Constants.UndefinedUserId;
        dispute.CreatedDate = DateTime.UtcNow;
        dispute.ModifiedBy = Constants.UndefinedUserId;
        dispute.OwnerSystemUserId = await UnitOfWork.SystemUserRepository.GetArbitratorUserId();

        dispute.TenancyGeozoneId = (byte?)TenancyGeoZone.Unknown;
        var disputeResult = await UnitOfWork.DisputeRepository.InsertAsync(dispute);
        await UnitOfWork.Complete();

        disputeResult.FileNumber = Convert.ToInt32($"{(int)TenancyGeoZone.Unknown}{disputeResult.DisputeId}");
        UnitOfWork.DisputeRepository.Update(disputeResult);
        await UnitOfWork.Complete();

        var disputeStatus = new DisputeStatus
        {
            DisputeGuid = disputeResult.DisputeGuid,
            Process = request.Process,
            Stage = (byte?)DisputeStage.ApplicationInProgress,
            Status = (byte)DisputeStatuses.OfficeUploadRequired,
            StatusNote = StatusNote,
            Owner = null,
            StatusStartDate = DateTime.UtcNow,
            IsActive = true
        };

        var disputeStatusResult = await UnitOfWork.DisputeStatusRepository.InsertAsync(disputeStatus);
        await UnitOfWork.Complete();

        var disputeProcessDetail = new Data.Model.DisputeProcessDetail
        {
            DisputeGuid = disputeResult.DisputeGuid,
            StartDisputeStatusId = disputeStatusResult.DisputeStatusId,
            AssociatedProcess = request.Process,
            CreatedBy = Constants.UndefinedUserId,
            CreatedDate = DateTime.UtcNow
        };

        await UnitOfWork.DisputeProcessDetailRepository.InsertAsync(disputeProcessDetail);
        await UnitOfWork.Complete();

        var participant = MapperService.Map<OfficeUserPostDisputeRequest, Participant>(request);
        participant.DisputeGuid = disputeResult.DisputeGuid;
        participant.AccessCode = await GenerateAccessCode();
        var nameAbbr = await GetNameAbbreviationAsync(participant, disputeResult.DisputeGuid);
        participant.NameAbbreviation = nameAbbr.Truncate(nameAbbreviationLength);
        participant.CreatedBy = Constants.UndefinedUserId;
        participant.ModifiedBy = Constants.UndefinedUserId;
        participant.AcceptedTouDate = DateTime.UtcNow;
        participant.IsDeleted = false;

        participant.EmailVerified = false;
        participant.EmailVerifyCode = StringHelper.GetRandomCode();

        if (!string.IsNullOrEmpty(request.PrimaryPhone))
        {
            participant.PrimaryPhoneVerified = false;
            participant.PrimaryPhoneVerifyCode = StringHelper.GetRandomCode();
        }

        var participantResult = await UnitOfWork.ParticipantRepository.InsertAsync(participant);
        await UnitOfWork.Complete();

        var claimGroup = new ClaimGroup
        {
            DisputeGuid = disputeResult.DisputeGuid,
            CreatedBy = Constants.UndefinedUserId,
            ModifiedBy = Constants.UndefinedUserId,
            IsDeleted = false
        };

        var claimGroupResult = await UnitOfWork.ClaimGroupRepository.InsertAsync(claimGroup);
        await UnitOfWork.Complete();

        var claimGroupParticipant = new ClaimGroupParticipant
        {
            DisputeGuid = disputeResult.DisputeGuid,
            ParticipantId = participantResult.ParticipantId,
            ClaimGroupId = claimGroupResult.ClaimGroupId,
            GroupParticipantRole = (byte)ParticipantRole.Applicant,
            GroupPrimaryContactId = participantResult.ParticipantId,
            CreatedBy = Constants.UndefinedUserId,
            ModifiedBy = Constants.UndefinedUserId,
            IsDeleted = false
        };

        await UnitOfWork.ClaimGroupParticipantRepository.InsertAsync(claimGroupParticipant);
        await UnitOfWork.Complete();

        var participantResponse = MapperService.Map<Participant, OfficeUserPostDisputeParticipantResponse>(participantResult);
        participantResponse.GroupParticipantRole = claimGroupParticipant.GroupParticipantRole;
        participantResponse.GroupPrimaryContactId = claimGroupParticipant.GroupPrimaryContactId;
        var claimGroupResponse = MapperService.Map<ClaimGroup, OfficeUserPostDisputeClaimGroup>(claimGroupResult);
        claimGroupResponse.Participants.Add(participantResponse);

        var disputeFee = new DisputeFee
        {
            DisputeGuid = disputeResult.DisputeGuid,
            IsActive = true,
            FeeType = (byte?)DisputeFeeType.Intake,
            PayorId = participantResult.ParticipantId,
            IsPaid = false,
            AmountDue = request.AmountDue ?? AmountDue,
            CreatedBy = Constants.UndefinedUserId,
            ModifiedBy = Constants.UndefinedUserId,
            IsDeleted = false,
            DueDate = DateTime.UtcNow.AddDays(3)
        };

        await UnitOfWork.DisputeFeeRepository.InsertAsync(disputeFee);
        await UnitOfWork.Complete();

        var response = MapperService.Map<Dispute, OfficeUserPostDisputeResponse>(disputeResult);
        response.ClaimGroups = new List<OfficeUserPostDisputeClaimGroup> { claimGroupResponse };
        return response;
    }

    public async Task<OfficeUserDisputeFee> CreatePaymentTransaction(int disputeFeeId, OfficeUserPostTransactionRequest request)
    {
        var newPaymentTransaction = MapperService.Map<OfficeUserPostTransactionRequest, PaymentTransaction>(request);
        newPaymentTransaction.DisputeFeeId = disputeFeeId;
        newPaymentTransaction.IsDeleted = false;

        var disputeFee = await UnitOfWork.DisputeFeeRepository.GetByIdAsync(disputeFeeId);
        if (request.PaymentStatus == (int)PaymentStatus.ApprovedOrPaid)
        {
            disputeFee.IsPaid = true;
            disputeFee.DatePaid = DateTime.UtcNow;
            disputeFee.MethodPaid = request.TransactionMethod;
            disputeFee.AmountPaid = request.TransactionAmount;
        }

        if (request.PaymentStatus != (int)PaymentStatus.ApprovedOrPaid)
        {
            disputeFee.IsPaid = false;
            disputeFee.DatePaid = null;
            disputeFee.AmountPaid = null;
            disputeFee.MethodPaid = null;
        }

        UnitOfWork.DisputeFeeRepository.Attach(disputeFee);
        await UnitOfWork.PaymentTransactionRepository.InsertAsync(newPaymentTransaction);
        await UnitOfWork.Complete();

        if (disputeFee.IsPaid == true)
        {
            var message = new EmailGenerateIntegrationEvent
            {
                DisputeGuid = disputeFee.DisputeGuid,
                MessageType = EmailMessageType.Notification,
                AssignedTemplateId = AssignedTemplate.PaymentSubmitted
            };

            if (disputeFee.PayorId != null)
            {
                message.ParticipantId = (int)disputeFee.PayorId;
            }

            message.Publish(Bus);
        }

        var disputeFeeResponse = await UnitOfWork.DisputeFeeRepository.GetWithTransactions(disputeFeeId);
        return MapperService.Map<DisputeFee, OfficeUserDisputeFee>(disputeFeeResponse);
    }

    public async Task<Dispute> PatchDispute(Dispute request)
    {
        UnitOfWork.DisputeRepository.Attach(request);
        var result = await UnitOfWork.Complete();

        if (result.CheckSuccess())
        {
            return request;
        }

        return null;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object id)
    {
        var disputeLastModified = await UnitOfWork.DisputeRepository.GetLastModifiedDate((Guid)id);
        return disputeLastModified;
    }

    public async Task<OfficeUserPostNoticeResponse> CreateNotice(Guid disputeGuid, OfficeUserPostNoticeRequest request)
    {
        var lastVersionNumber = await UnitOfWork.NoticeRepository.GetLastVersionNumberAsync(disputeGuid) ?? 0;

        var newNotice = MapperService.Map<OfficeUserPostNoticeRequest, Data.Model.Notice>(request);
        newNotice.NoticeTitle = "Office Amendment Notice";
        newNotice.NoticeType = (byte)NoticeTypes.UploadedAmendmentNotice;
        newNotice.NoticeDeliveryMethod = (byte)NoticeDeliveryMethods.UserSubmitted;
        newNotice.DisputeGuid = disputeGuid;
        newNotice.NoticeVersion = ++lastVersionNumber;
        newNotice.IsDeleted = false;
        var result = await UnitOfWork.NoticeRepository.InsertAsync(newNotice);
        var res = await UnitOfWork.Complete();
        if (res.CheckSuccess())
        {
            await AddRespondentNoticeServices(result.DisputeGuid, result.NoticeId);
        }

        return MapperService.Map<Data.Model.Notice, OfficeUserPostNoticeResponse>(result);
    }

    public async Task<PickupMessageGetResponse> GetPickupMessage(int emailMessageId)
    {
        var emailMessage = await UnitOfWork.EmailMessageRepository.GetWithEmailAttachmentsAsync(emailMessageId);

        var pickupMessage = MapperService.Map<EmailMessage, PickupMessageGetResponse>(emailMessage);

        foreach (var attachment in pickupMessage.EmailAttachments)
        {
            if (attachment.CommonFileId.HasValue)
            {
                var commonFile = await CommonFileService.GetAsync(attachment.CommonFileId.Value);
                if (commonFile != null)
                {
                    attachment.CommonFileGuid = commonFile.CommonFileGuid;
                    attachment.FileUrl = await GetFileUrl(commonFile.CommonFileGuid, commonFile.FileName, true);
                    attachment.FileMimeType = commonFile.FileMimeType;
                    attachment.FileName = commonFile.FileName;
                    attachment.FileSize = commonFile.FileSize;
                    attachment.FileType = commonFile.FileType;
                    attachment.FileGuid = null;
                }
            }
            else
            {
                var file = await FileService.GetAsync(attachment.FileId.Value);
                if (file != null)
                {
                    attachment.FileGuid = file.FileGuid;
                    attachment.FileUrl = await GetFileUrl(file.FileGuid, file.FileName, false);
                    attachment.FileMimeType = file.FileMimeType;
                    attachment.FileName = file.FileName;
                    attachment.FileSize = file.FileSize;
                    attachment.FileType = file.FileType;
                    attachment.CommonFileGuid = null;
                }
            }
        }

        return pickupMessage;
    }

    private async Task<string> GetFileUrl(Guid fileGuid, string fileName, bool isCommonFile)
    {
        var rootPath = await SystemSettingsService.GetValueAsync<string>(isCommonFile ? SettingKeys.CommonFileRepositoryBaseUrl : SettingKeys.FileRepositoryBaseUrl);

        return $"{rootPath}/{fileGuid}/{fileName}";
    }

    private async Task<string> GetNameAbbreviationAsync(Participant participantRequest, Guid disputeGuid)
    {
        var nameAbbreviation = string.Empty;

        switch (participantRequest.ParticipantType)
        {
            case (int)ParticipantType.Business:
                nameAbbreviation = StringExtensions.GetAbbreviation(participantRequest.BusinessName);
                break;
            case (int)ParticipantType.Individual:
            case (int)ParticipantType.AgentOrLawyer:
            case (int)ParticipantType.AdvocateOrAssistant:
                nameAbbreviation = StringExtensions.GetAbbreviation(participantRequest.FirstName, participantRequest.LastName);
                break;
        }

        var partiesCount = await UnitOfWork.ParticipantRepository.GetSameAbbreviationsCount(disputeGuid, nameAbbreviation);

        if (partiesCount > 0)
        {
            nameAbbreviation += (partiesCount + 1).ToString();
        }

        return nameAbbreviation;
    }

    private async System.Threading.Tasks.Task AddRespondentNoticeServices(Guid disputeGuid, int noticeId)
    {
        var participants = await UnitOfWork.ClaimGroupParticipantRepository.GetActiveRespondentParticipants(disputeGuid);

        if (participants.Count > 0)
        {
            foreach (var participantId in participants)
            {
                var noticeService = new Data.Model.NoticeService
                {
                    NoticeId = noticeId,
                    ParticipantId = participantId,
                    IsServed = null,
                    IsDeleted = false
                };
                await UnitOfWork.NoticeServiceRepository.InsertAsync(noticeService);
                var completeResult = await UnitOfWork.Complete();
                completeResult.AssertSuccess();
            }
        }
    }

    private async Task<DisputeAccessResponse> GetByFileNumber(OfficeUserGetDisputeRequest request)
    {
        var dispute = await UnitOfWork.DisputeRepository.GetDisputeByFileNumberWithStatus(request.FileNumber);
        if (dispute != null)
        {
            var externalUpdateDispute = await _disputeAccessService.GatherDisputeData(dispute, true, true);
            return externalUpdateDispute;
        }

        return null;
    }

    private async Task<DisputeAccessResponse> GetByAccessCode(OfficeUserGetDisputeRequest request)
    {
        var participant = await UnitOfWork.ParticipantRepository.GetByAccessCode(request.AccessCode);
        if (participant != null)
        {
            var dispute = await UnitOfWork.DisputeRepository.GetDisputeWithStatusByGuidAsync(participant.DisputeGuid);
            var externalUpdateDispute = await _disputeAccessService.GatherDisputeData(dispute, true, true);
            externalUpdateDispute.TokenParticipantId = participant.ParticipantId;
            return externalUpdateDispute;
        }

        return null;
    }

    private async Task<string> GenerateAccessCode()
    {
        var badWords = UnitOfWork.ExcludeWordRepository.GetAllWords();
        var evidenceCode = await GetAccessCode(Constants.AccessCodeLength, badWords);
        return evidenceCode;
    }

    private async Task<string> GetAccessCode(int length, IEnumerable<string> badWords)
    {
        const string symbols = "234679ACDEFGHJKLMNPQRTUVWXTabcdefhikmnprstuvwxyz";
        var builder = new StringBuilder();
        using (var rng = RandomNumberGenerator.Create())
        {
            var uintBuffer = new byte[sizeof(uint)];

            while (length-- > 0)
            {
                rng.GetBytes(uintBuffer);
                var num = BitConverter.ToUInt32(uintBuffer, 0);
                builder.Append(symbols[(int)(num % (uint)symbols.Length)]);
            }
        }

        var words = badWords.ToList();
        var evidenceCode = builder.ToString();

        var exists = await UnitOfWork.ParticipantRepository.CheckIfAccessCodeExists(evidenceCode);
        if (exists)
        {
            await GetAccessCode(Constants.AccessCodeLength, words);
        }

        if (words.Any(evidenceCode.ToLower().Contains))
        {
            await GetAccessCode(Constants.AccessCodeLength, words);
        }

        return evidenceCode;
    }
}