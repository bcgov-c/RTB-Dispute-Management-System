﻿using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.Parties;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using CM.UserResolverService;
using Polly;

namespace CM.Business.Services.Parties;

public class ParticipantService : CmServiceBase, IParticipantService
{
    private const byte NameAbbreviationLength = 10;

    public ParticipantService(IMapper mapper, IUnitOfWork unitOfWork, IUserResolver userResolver)
        : base(unitOfWork, mapper)
    {
        UserResolver = userResolver;
    }

    private IUserResolver UserResolver { get; }

    public async Task<Guid> ResolveDisputeGuid(int id)
    {
        var entity = await UnitOfWork.ParticipantRepository.GetNoTrackingByIdAsync(x => x.ParticipantId == id);
        return entity?.DisputeGuid ?? Guid.Empty;
    }

    public async Task<List<ParticipantResponse>> CreateManyAsync(Guid disputeGuid, IEnumerable<ParticipantRequest> participants)
    {
        var createdParticipants = new List<Participant>();

        foreach (var participantRequest in participants)
        {
            var newParticipant = MapperService.Map<ParticipantRequest, Participant>(participantRequest);
            newParticipant.DisputeGuid = disputeGuid;
            newParticipant.SystemUserId = UserResolver.GetUserId();
            newParticipant.AccessCode = await GenerateAccessCode();
            newParticipant.IsDeleted = false;

            var nameAbbr = await GetNameAbbreviationAsync(participantRequest, disputeGuid);
            newParticipant.NameAbbreviation = nameAbbr.Truncate(NameAbbreviationLength);

            newParticipant.EmailVerified = false;
            newParticipant.EmailVerifyCode = StringHelper.GetRandomCode();

            if (!string.IsNullOrEmpty(participantRequest.PrimaryPhone))
            {
                newParticipant.PrimaryPhoneVerified = false;
                newParticipant.PrimaryPhoneVerifyCode = StringHelper.GetRandomCode();
            }

            if (!string.IsNullOrEmpty(participantRequest.SecondaryPhone))
            {
                newParticipant.SecondaryPhoneVerified = false;
                newParticipant.SecondaryPhoneVerifyCode = StringHelper.GetRandomCode();
            }

            var result = await UnitOfWork.ParticipantRepository.InsertAsync(newParticipant);
            var completeResult = await UnitOfWork.Complete();
            completeResult.AssertSuccess();

            createdParticipants.Add(result);
        }

        return MapperService.Map<List<Participant>, List<ParticipantResponse>>(createdParticipants);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var participant = await UnitOfWork.ParticipantRepository.GetByIdAsync(id);
        if (participant != null)
        {
            await UnitOfWork.ParticipantRepository.DeleteAsync(id);
            await SetDisputeUserInactive(id);

            var marked = await MarkForDeleteChildEntities(id, participant.DisputeGuid);

            if (marked)
            {
                var completeResult = await UnitOfWork.Complete();

                return completeResult.CheckSuccess();
            }

            return false;
        }

        return false;
    }

    public async Task<int> RelatedEntity(int id)
    {
        var claimGroupParticipant = await UnitOfWork.ClaimGroupParticipantRepository.CheckParticipantRelation(id);
        if (claimGroupParticipant != null)
        {
            return claimGroupParticipant.ClaimGroupId;
        }

        return -1;
    }

    public async Task<Participant> PatchAsync(Participant participant, PartyPatchType patchType = PartyPatchType.Null, bool abbrUpdate = false)
    {
        var party = await UnitOfWork.ParticipantRepository.GetNoTrackingByIdAsync(x => x.ParticipantId == participant.ParticipantId);

        if (party.Email != participant.Email && !string.IsNullOrEmpty(participant.Email))
        {
            participant.EmailVerified = false;
            participant.EmailVerifyCode = StringHelper.GetRandomCode();
        }

        if (party.PrimaryPhone.GetNumbers() != participant.PrimaryPhone.GetNumbers() && !string.IsNullOrEmpty(participant.PrimaryPhone))
        {
            participant.PrimaryPhoneVerified = false;
            participant.PrimaryPhoneVerifyCode = StringHelper.GetRandomCode();
        }

        if (party.SecondaryPhone.GetNumbers() != participant.SecondaryPhone.GetNumbers() && !string.IsNullOrEmpty(participant.SecondaryPhone))
        {
            participant.SecondaryPhoneVerified = false;
            participant.SecondaryPhoneVerifyCode = StringHelper.GetRandomCode();
        }

        if (abbrUpdate)
        {
            var nameAbbr = await GetNameAbbreviationAsync(participant);
            participant.NameAbbreviation = nameAbbr.Truncate(NameAbbreviationLength);
        }

        UnitOfWork.ParticipantRepository.Attach(participant);

        switch (patchType)
        {
            case PartyPatchType.SoftDelete:
                await MarkForDeleteChildEntities(participant.ParticipantId, participant.DisputeGuid);

                break;
            case PartyPatchType.SoftUndelete:
                await MarkForRestoreChildEntities(participant);

                break;
        }

        var result = await UnitOfWork.Complete();

        if (result.CheckSuccess())
        {
            return participant;
        }

        return null;
    }

    public async Task<ParticipantResponse> GetAsync(int id)
    {
        var participant = await UnitOfWork.ParticipantRepository.GetByIdAsync(id);
        if (participant != null)
        {
            return MapperService.Map<Participant, ParticipantResponse>(participant);
        }

        return null;
    }

    public async Task<List<ParticipantResponse>> GetAllAsync(Guid disputeGuid)
    {
        var participants = await UnitOfWork.ParticipantRepository.GetDisputeParticipantsAsync(disputeGuid);
        if (participants != null)
        {
            return MapperService.Map<List<Participant>, List<ParticipantResponse>>(participants);
        }

        return new List<ParticipantResponse>();
    }

    public async Task<Participant> GetNoTrackingParticipantAsync(int id)
    {
        var participant = await UnitOfWork.ParticipantRepository.GetNoTrackingByIdAsync(p => p.ParticipantId == id);
        return participant;
    }

    public async Task<Participant> GetByIdAsync(int id)
    {
        var participant = await UnitOfWork.ParticipantRepository.GetByIdAsync(id);
        return participant;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object participantId)
    {
        var lastModifiedDate = await UnitOfWork.ParticipantRepository.GetLastModifiedDateAsync((int)participantId);
        return lastModifiedDate;
    }

    public async Task<ParticipantResponse> GetByAccessCode(string accessCode)
    {
        var participant = await UnitOfWork.ParticipantRepository.GetByAccessCode(accessCode);
        if (participant != null)
        {
            return MapperService.Map<Participant, ParticipantResponse>(participant);
        }

        return null;
    }

    public async Task<bool> ParticipantExists(int participantId)
    {
        var participant = await UnitOfWork.ParticipantRepository.GetByIdAsync(participantId);
        if (participant != null)
        {
            return true;
        }

        return false;
    }

    public async Task<(ParticipantEmailErrorCodes Result, string Value)> GetParticipantEmail(Guid disputeGuid, int? participantId)
    {
        var participant = await UnitOfWork.ParticipantRepository.GetByIdAsync(participantId.GetValueOrDefault());

        if (participant != null)
        {
            if (participant.DisputeGuid != disputeGuid)
            {
                return (ParticipantEmailErrorCodes.ProvidedParticipantIsNotAssociatedToDispute, string.Empty);
            }

            if (!participant.Email.IsValidEmail())
            {
                return (ParticipantEmailErrorCodes.ProvidedParticipantDoesNotHaveEmail, string.Empty);
            }

            return (ParticipantEmailErrorCodes.EmailFound, participant.Email);
        }

        return (ParticipantEmailErrorCodes.ParticipantNotFound, string.Empty);
    }

    public async Task<bool> ParticipantExists(int? participantId)
    {
        if (participantId != null)
        {
            var participant = await UnitOfWork.ParticipantRepository.GetByIdAsync((int)participantId);
            if (participant != null)
            {
                return true;
            }
        }

        return false;
    }

    public async Task<bool> IsPrimaryApplicant(int participantId)
    {
        var primaryApplicant = await UnitOfWork.ParticipantRepository.GetPrimaryApplicantByIdAsync(participantId);
        return primaryApplicant != null;
    }

    public async Task<bool> IsActiveParticipantExists(int participantId)
    {
        var exists = await UnitOfWork.ParticipantRepository.IsActiveParticipantExists(participantId);
        return exists;
    }

    public bool NeedAbbrUpdate(ParticipantRequest participantToPatch, Participant originalParty)
    {
        if (participantToPatch.ParticipantType != originalParty.ParticipantType)
        {
            if (participantToPatch.ParticipantType == (byte)ParticipantType.Business)
            {
                return StringHelper.IsDifferentInitials($"{originalParty.FirstName} {originalParty.LastName}", participantToPatch.BusinessName);
            }
            else
            {
                if (originalParty.ParticipantType == (byte)ParticipantType.Business)
                {
                    return StringHelper.IsDifferentInitials($"{participantToPatch.FirstName} {participantToPatch.LastName}", originalParty.BusinessName);
                }
                else
                {
                    return StringHelper.IsDifferentInitials($"{participantToPatch.FirstName} {participantToPatch.LastName}", $"{originalParty.FirstName} {originalParty.LastName}");
                }
            }
        }
        else if ((participantToPatch.ParticipantType != (byte)ParticipantType.Business &&
                    (participantToPatch.FirstName[0] != originalParty.FirstName[0] ||
                    participantToPatch.LastName[0] != originalParty.LastName[0])) ||
                    (participantToPatch.ParticipantType == (byte)ParticipantType.Business &&
                    StringHelper.IsDifferentInitials(participantToPatch.BusinessName, originalParty.BusinessName)))
        {
            return true;
        }

        return false;
    }

    #region private

    private async Task<string> GetNameAbbreviationAsync(ParticipantRequest participantRequest, Guid disputeGuid)
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

    private async Task<string> GetNameAbbreviationAsync(Participant participantRequest)
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

        var partiesCount = await UnitOfWork.ParticipantRepository.GetSameAbbreviationsCount(participantRequest.DisputeGuid, nameAbbreviation);

        if (partiesCount > 0)
        {
            nameAbbreviation += (partiesCount + 1).ToString();
        }

        return nameAbbreviation;
    }

    private async System.Threading.Tasks.Task SetDisputeUserInactive(int id)
    {
        var participant = await UnitOfWork.ParticipantRepository.GetByIdAsync(id);
        var disputeUser = await UnitOfWork.DisputeUserRepository.GetByParticipant(participant);
        if (disputeUser != null)
        {
            disputeUser.IsActive = false;
            UnitOfWork.DisputeUserRepository.Attach(disputeUser);
        }
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

    private async Task<bool> MarkForDeleteChildEntities(int id, Guid disputeGuid)
    {
        try
        {
            var filePackageServices = await UnitOfWork.FilePackageServiceRepository.FindAllAsync(x => x.ParticipantId == id);
            var fileDescriptions1 = filePackageServices.Where(x => x.ProofFileDescriptionId != null).Select(x => x.ProofFileDescriptionId);

            var noticeServices = await UnitOfWork.NoticeServiceRepository.FindAllAsync(x => x.ParticipantId == id);
            var fileDescriptions2 = noticeServices.Where(x => x.ProofFileDescriptionId != null).Select(x => x.ProofFileDescriptionId);

            var fileDescriptions = fileDescriptions1.Union(fileDescriptions2).Distinct();

            foreach (var filePackageService in filePackageServices)
            {
                filePackageService.IsDeleted = true;
                UnitOfWork.FilePackageServiceRepository.Attach(filePackageService);

                await UnitOfWork.ServiceAuditLogRepository.InsertAsync(
                new Data.Model.ServiceAuditLog
                {
                    DisputeGuid = disputeGuid,
                    ServiceType = ServiceType.FilePackage,
                    ServiceChangeType = ServiceChangeType.DeleteRecord,
                    ParticipantId = id,
                    FilePackageServiceId = filePackageService.FilePackageServiceId,
                    OtherParticipantRole = filePackageService.OtherParticipantRole,
                    IsServed = filePackageService.IsServed,
                    ServiceMethod = filePackageService.ServiceMethod != null ? (ServiceMethod)filePackageService.ServiceMethod : null,
                    ReceivedDate = filePackageService.ReceivedDate,
                    ServiceDateUsed = filePackageService.ServiceDateUsed,
                    ServiceDate = filePackageService.ServiceDate,
                    ServiceBy = filePackageService.ServedBy,
                    ServiceComment = filePackageService.ServiceComment,
                    ValidationStatus = filePackageService.ValidationStatus,
                    ServiceDescription = filePackageService.ServiceDescription,
                    OtherProofFileDescriptionId = filePackageService.OtherProofFileDescriptionId
                });
            }

            foreach (var noticeService in noticeServices)
            {
                noticeService.IsDeleted = true;
                UnitOfWork.NoticeServiceRepository.Attach(noticeService);

                await UnitOfWork.ServiceAuditLogRepository.InsertAsync(
                new Data.Model.ServiceAuditLog
                {
                    DisputeGuid = disputeGuid,
                    ServiceType = ServiceType.Notice,
                    ServiceChangeType = ServiceChangeType.DeleteRecord,
                    ParticipantId = id,
                    NoticeServiceId = noticeService.NoticeServiceId,
                    OtherParticipantRole = noticeService.OtherParticipantRole,
                    IsServed = noticeService.IsServed,
                    ServiceMethod = noticeService.ServiceMethod != null ? (ServiceMethod)noticeService.ServiceMethod : null,
                    ReceivedDate = noticeService.ReceivedDate,
                    ServiceDateUsed = noticeService.ServiceDateUsed,
                    ServiceDate = noticeService.ServiceDate,
                    ServiceBy = noticeService.ServedBy,
                    ServiceComment = noticeService.ServiceComment,
                    ValidationStatus = noticeService.ValidationStatus,
                    ServiceDescription = noticeService.ServiceDescription,
                    OtherProofFileDescriptionId = noticeService.OtherProofFileDescriptionId
                });
            }

            foreach (var fileDescriptionId in fileDescriptions)
            {
                Debug.Assert(fileDescriptionId != null, nameof(fileDescriptionId) + " != null");
                var fileDescription = await UnitOfWork.FileDescriptionRepository.GetByIdAsync(fileDescriptionId.Value);
                fileDescription.IsDeficient = true;
                fileDescription.IsDeficientReason = $"Service record removed by system because Participant ID {id} was deleted on {DateTime.Now.ToPstDateTime()} PST";
                UnitOfWork.FileDescriptionRepository.Attach(fileDescription);
            }
        }
        catch (Exception)
        {
            return false;
        }

        return true;
    }

    private async System.Threading.Tasks.Task MarkForRestoreChildEntities(Participant participant)
    {
        var notices = new List<Data.Model.Notice>();

        var claimGroupParticipant = await UnitOfWork.ClaimGroupParticipantRepository.GetNoTrackingByIdAsync(x => x.ParticipantId == participant.ParticipantId);

        notices = claimGroupParticipant.GroupParticipantRole switch
        {
            (byte)GroupParticipantRole.Respondent =>
                await UnitOfWork.NoticeRepository.GetParticipantNotices(participant.ParticipantId, (byte)ParticipantRole.Applicant),
            (byte)GroupParticipantRole.Applicant =>
                await UnitOfWork.NoticeRepository.GetParticipantNotices(participant.ParticipantId, (byte)ParticipantRole.Respondent),
            _ => notices
        };

        foreach (var notice in notices)
        {
            var newNoticeService = new Data.Model.NoticeService
            {
                NoticeId = notice.NoticeId,
                ParticipantId = participant.ParticipantId,
                IsDeleted = false,
                IsServed = null
            };
            await UnitOfWork.NoticeServiceRepository.InsertAsync(newNoticeService);
        }

        var filePackages = await UnitOfWork.FilePackageRepository.GetParticipantFilePackages(participant.ParticipantId, participant.DisputeGuid);

        foreach (var filePackage in filePackages)
        {
            var newFilePackageService = new Data.Model.FilePackageService
            {
                FilePackageId = filePackage.FilePackageId,
                ParticipantId = participant.ParticipantId,
                IsDeleted = false
            };
            await UnitOfWork.FilePackageServiceRepository.InsertAsync(newFilePackageService);
        }

        await UnitOfWork.Complete();
    }

    #endregion
}