using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.HearingAuditLog;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using CM.UserResolverService;

namespace CM.Business.Services.Hearings;

public class HearingAuditLogService : CmServiceBase, IHearingAuditLogService
{
    public HearingAuditLogService(IMapper mapper, IUnitOfWork unitOfWork, IUserResolver userResolver)
        : base(unitOfWork, mapper)
    {
        UserResolver = userResolver;
    }

    private IUserResolver UserResolver { get; }

    public async Task<bool> CreateAsync(HearingAuditLogCase logCase, Hearing hearingResult, Data.Model.DisputeHearing disputeHearingResult, bool withComplete = true)
    {
        var hearingAuditLog = await GetRequestModelAsync(logCase, hearingResult, disputeHearingResult);
        hearingAuditLog.CreatedDate = DateTime.UtcNow;

        await UnitOfWork.HearingAuditLogRepository.InsertAsync(hearingAuditLog);

        if (!withComplete)
        {
            return true;
        }

        var result = await UnitOfWork.Complete();

        return result.CheckSuccess();
    }

    public async Task<HearingAuditLogGetResponse> GetHearingAuditLogs(HearingAuditLogGetRequest request, int count, int index)
    {
        if (count == 0)
        {
            count = Pagination.DefaultPageSize;
        }

        var hearingAuditLogResponse = new HearingAuditLogGetResponse();

        var result = await UnitOfWork.HearingAuditLogRepository.GetHearingAuditLogs(request);
        var hearingAuditLogs = await result.ApplyPagingArrayStyleAsync(count, index);
        hearingAuditLogResponse.HearingAuditLogs = MapperService.Map<List<HearingAuditLog>, List<HearingAuditLogResponse>>(hearingAuditLogs);
        hearingAuditLogResponse.TotalAvailableRecords = result.Count;

        return hearingAuditLogResponse;
    }

    private async Task<HearingAuditLog> GetRequestModelAsync(HearingAuditLogCase logCase, Hearing hearingResult, Data.Model.DisputeHearing disputeHearingResult)
    {
        var hearingAuditLog = new HearingAuditLog();
        var userId = UserResolver.GetUserId();

        if (disputeHearingResult is { HearingId: > 0 })
        {
            hearingResult = await UnitOfWork.HearingRepository.GetByIdAsync(disputeHearingResult.HearingId);
        }

        hearingAuditLog = logCase switch
        {
            HearingAuditLogCase.CreateHearingFromSchedule => new HearingAuditLog
            {
                HearingChangeType = HearingChangeType.CreateHearing,
                HearingId = hearingResult.HearingId,
                HearingType = hearingResult.HearingType,
                HearingSubType = hearingResult.HearingSubType,
                HearingPriority = hearingResult.HearingPriority,
                ConferenceBridgeId = hearingResult.ConferenceBridgeId,
                HearingOwner = hearingResult.HearingOwner.GetValueOrDefault(),
                HearingStartDateTime = hearingResult.HearingStartDateTime,
                HearingEndDateTime = hearingResult.HearingEndDateTime,
                LocalStartDateTime = hearingResult.LocalStartDateTime,
                LocalEndDateTime = hearingResult.LocalEndDateTime,
                CreatedBy = Constants.UndefinedUserId
            },
            HearingAuditLogCase.CreateHearing => new HearingAuditLog
            {
                HearingChangeType = HearingChangeType.CreateHearing,
                HearingId = hearingResult.HearingId,
                HearingType = hearingResult.HearingType,
                HearingSubType = hearingResult.HearingSubType,
                HearingPriority = hearingResult.HearingPriority,
                ConferenceBridgeId = hearingResult.ConferenceBridgeId,
                HearingOwner = hearingResult.HearingOwner.GetValueOrDefault(),
                HearingStartDateTime = hearingResult.HearingStartDateTime,
                HearingEndDateTime = hearingResult.HearingEndDateTime,
                LocalStartDateTime = hearingResult.LocalStartDateTime,
                LocalEndDateTime = hearingResult.LocalEndDateTime,
                CreatedBy = userId
            },
            HearingAuditLogCase.ChangeHearingOwner => new HearingAuditLog
            {
                HearingChangeType = HearingChangeType.ChangeOwner,
                HearingId = hearingResult.HearingId,
                HearingType = hearingResult.HearingType,
                HearingSubType = hearingResult.HearingSubType,
                HearingPriority = hearingResult.HearingPriority,
                ConferenceBridgeId = hearingResult.ConferenceBridgeId,
                HearingOwner = hearingResult.HearingOwner.GetValueOrDefault(),
                HearingStartDateTime = hearingResult.HearingStartDateTime,
                HearingEndDateTime = hearingResult.HearingEndDateTime,
                LocalStartDateTime = hearingResult.LocalStartDateTime,
                LocalEndDateTime = hearingResult.LocalEndDateTime,
                CreatedBy = userId
            },
            HearingAuditLogCase.ChangeHearing => new HearingAuditLog
            {
                HearingChangeType = HearingChangeType.ChangeHearingInfo,
                HearingId = hearingResult.HearingId,
                HearingType = hearingResult.HearingType,
                HearingSubType = hearingResult.HearingSubType,
                HearingPriority = hearingResult.HearingPriority,
                ConferenceBridgeId = hearingResult.ConferenceBridgeId,
                HearingOwner = hearingResult.HearingOwner.GetValueOrDefault(),
                HearingStartDateTime = hearingResult.HearingStartDateTime,
                HearingEndDateTime = hearingResult.HearingEndDateTime,
                LocalStartDateTime = hearingResult.LocalStartDateTime,
                LocalEndDateTime = hearingResult.LocalEndDateTime,
                CreatedBy = userId
            },
            HearingAuditLogCase.DeleteHearing => new HearingAuditLog
            {
                HearingChangeType = HearingChangeType.DeleteHearing,
                HearingId = hearingResult.HearingId,
                HearingType = hearingResult.HearingType,
                HearingSubType = hearingResult.HearingSubType,
                HearingPriority = hearingResult.HearingPriority,
                ConferenceBridgeId = hearingResult.ConferenceBridgeId,
                HearingOwner = hearingResult.HearingOwner.GetValueOrDefault(),
                HearingStartDateTime = hearingResult.HearingStartDateTime,
                HearingEndDateTime = hearingResult.HearingEndDateTime,
                LocalStartDateTime = hearingResult.LocalStartDateTime,
                LocalEndDateTime = hearingResult.LocalEndDateTime,
                CreatedBy = userId
            },
            HearingAuditLogCase.HearingReservation => new HearingAuditLog
            {
                HearingChangeType = HearingChangeType.HearingReservation,
                HearingId = hearingResult.HearingId,
                HearingType = hearingResult.HearingType,
                HearingSubType = hearingResult.HearingSubType,
                HearingPriority = hearingResult.HearingPriority,
                ConferenceBridgeId = hearingResult.ConferenceBridgeId,
                HearingOwner = hearingResult.HearingOwner.GetValueOrDefault(),
                HearingStartDateTime = hearingResult.HearingStartDateTime,
                HearingEndDateTime = hearingResult.HearingEndDateTime,
                LocalStartDateTime = hearingResult.LocalStartDateTime,
                LocalEndDateTime = hearingResult.LocalEndDateTime,
                CreatedBy = userId
            },
            HearingAuditLogCase.HearingBook => new HearingAuditLog
            {
                HearingChangeType = HearingChangeType.HearingBook,
                HearingId = hearingResult.HearingId,
                HearingType = hearingResult.HearingType,
                HearingSubType = hearingResult.HearingSubType,
                HearingPriority = hearingResult.HearingPriority,
                ConferenceBridgeId = hearingResult.ConferenceBridgeId,
                HearingOwner = hearingResult.HearingOwner.GetValueOrDefault(),
                HearingStartDateTime = hearingResult.HearingStartDateTime,
                HearingEndDateTime = hearingResult.HearingEndDateTime,
                LocalStartDateTime = hearingResult.LocalStartDateTime,
                LocalEndDateTime = hearingResult.LocalEndDateTime,
                CreatedBy = userId
            },
            HearingAuditLogCase.HoldHearing => new HearingAuditLog
            {
                HearingChangeType = HearingChangeType.HoldHearing,
                HearingId = hearingResult.HearingId,
                HearingType = hearingResult.HearingType,
                HearingSubType = hearingResult.HearingSubType,
                HearingPriority = hearingResult.HearingPriority,
                ConferenceBridgeId = hearingResult.ConferenceBridgeId,
                HearingOwner = hearingResult.HearingOwner.GetValueOrDefault(),
                HearingStartDateTime = hearingResult.HearingStartDateTime,
                HearingEndDateTime = hearingResult.HearingEndDateTime,
                LocalStartDateTime = hearingResult.LocalStartDateTime,
                LocalEndDateTime = hearingResult.LocalEndDateTime,
                CreatedBy = userId
            },
            HearingAuditLogCase.HearingCancel => new HearingAuditLog
            {
                HearingChangeType = HearingChangeType.HearingCancel,
                HearingId = hearingResult.HearingId,
                HearingType = hearingResult.HearingType,
                HearingSubType = hearingResult.HearingSubType,
                HearingPriority = hearingResult.HearingPriority,
                ConferenceBridgeId = hearingResult.ConferenceBridgeId,
                HearingOwner = hearingResult.HearingOwner.GetValueOrDefault(),
                HearingStartDateTime = hearingResult.HearingStartDateTime,
                HearingEndDateTime = hearingResult.HearingEndDateTime,
                LocalStartDateTime = hearingResult.LocalStartDateTime,
                LocalEndDateTime = hearingResult.LocalEndDateTime,
                CreatedBy = userId
            },
            HearingAuditLogCase.CreateDisputeHearing => new HearingAuditLog
            {
                HearingChangeType = HearingChangeType.AddDisputeLink,
                HearingId = hearingResult.HearingId,
                HearingType = hearingResult.HearingType,
                HearingSubType = hearingResult.HearingSubType,
                HearingPriority = hearingResult.HearingPriority,
                ConferenceBridgeId = hearingResult.ConferenceBridgeId,
                HearingOwner = hearingResult.HearingOwner.GetValueOrDefault(),
                HearingStartDateTime = hearingResult.HearingStartDateTime,
                HearingEndDateTime = hearingResult.HearingEndDateTime,
                LocalStartDateTime = hearingResult.LocalStartDateTime,
                LocalEndDateTime = hearingResult.LocalEndDateTime,
                DisputeHearingRole = disputeHearingResult.DisputeHearingRole,
                DisputeGuid = disputeHearingResult.DisputeGuid,
                SharedHearingLinkType = disputeHearingResult.SharedHearingLinkType,
                CreatedBy = userId
            },
            HearingAuditLogCase.ChangeDisputeHearing => new HearingAuditLog
            {
                HearingChangeType = HearingChangeType.ModifyDisputeLink,
                HearingId = hearingResult.HearingId,
                HearingType = hearingResult.HearingType,
                HearingSubType = hearingResult.HearingSubType,
                HearingPriority = hearingResult.HearingPriority,
                ConferenceBridgeId = hearingResult.ConferenceBridgeId,
                HearingOwner = hearingResult.HearingOwner.GetValueOrDefault(),
                HearingStartDateTime = hearingResult.HearingStartDateTime,
                HearingEndDateTime = hearingResult.HearingEndDateTime,
                LocalStartDateTime = hearingResult.LocalStartDateTime,
                LocalEndDateTime = hearingResult.LocalEndDateTime,
                DisputeHearingRole = disputeHearingResult.DisputeHearingRole,
                DisputeGuid = disputeHearingResult.DisputeGuid,
                SharedHearingLinkType = disputeHearingResult.SharedHearingLinkType,
                CreatedBy = userId
            },
            HearingAuditLogCase.DeleteDisputeHearing => new HearingAuditLog
            {
                HearingChangeType = HearingChangeType.DeleteDisputeLink,
                HearingId = hearingResult.HearingId,
                HearingType = hearingResult.HearingType,
                HearingSubType = hearingResult.HearingSubType,
                HearingPriority = hearingResult.HearingPriority,
                ConferenceBridgeId = hearingResult.ConferenceBridgeId,
                HearingOwner = hearingResult.HearingOwner.GetValueOrDefault(),
                HearingStartDateTime = hearingResult.HearingStartDateTime,
                HearingEndDateTime = hearingResult.HearingEndDateTime,
                LocalStartDateTime = hearingResult.LocalStartDateTime,
                LocalEndDateTime = hearingResult.LocalEndDateTime,
                DisputeHearingRole = disputeHearingResult.DisputeHearingRole,
                DisputeGuid = disputeHearingResult.DisputeGuid,
                SharedHearingLinkType = disputeHearingResult.SharedHearingLinkType,
                CreatedBy = userId
            },
            _ => hearingAuditLog
        };

        return hearingAuditLog;
    }
}