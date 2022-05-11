using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.ConferenceBridge;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.ConferenceBridge;

public class ConferenceBridgeService : CmServiceBase, IConferenceBridgeService
{
    public ConferenceBridgeService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<ConferenceBridgeResponse> CreateAsync(ConferenceBridgeRequest request)
    {
        var newConferenceBridge = MapperService.Map<ConferenceBridgeRequest, Data.Model.ConferenceBridge>(request);
        newConferenceBridge.IsDeleted = false;

        var conferenceBridgeResult = await UnitOfWork.ConferenceBridgeRepository.InsertAsync(newConferenceBridge);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<Data.Model.ConferenceBridge, ConferenceBridgeResponse>(conferenceBridgeResult);
        }

        return null;
    }

    public async Task<ConferenceBridgeResponse> PatchAsync(int conferenceBridgeId, ConferenceBridgeRequest conferenceBridgeRequest)
    {
        var conferenceBridgeToPatch = await UnitOfWork.ConferenceBridgeRepository.GetNoTrackingByIdAsync(c => c.ConferenceBridgeId == conferenceBridgeId);
        MapperService.Map(conferenceBridgeRequest, conferenceBridgeToPatch);

        UnitOfWork.ConferenceBridgeRepository.Attach(conferenceBridgeToPatch);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<Data.Model.ConferenceBridge, ConferenceBridgeResponse>(conferenceBridgeToPatch);
        }

        return null;
    }

    public async Task<ConferenceBridgeRequest> GetForPatchAsync(int conferenceBridgeId)
    {
        var conferenceBridge = await UnitOfWork.ConferenceBridgeRepository.GetNoTrackingByIdAsync(
            c => c.ConferenceBridgeId == conferenceBridgeId);
        return MapperService.Map<Data.Model.ConferenceBridge, ConferenceBridgeRequest>(conferenceBridge);
    }

    public async Task<ConferenceBridgeResponse> GetByIdAsync(int conferenceBridgeId)
    {
        var conferenceBridge = await UnitOfWork.ConferenceBridgeRepository.GetByIdAsync(conferenceBridgeId);
        if (conferenceBridge != null)
        {
            return MapperService.Map<Data.Model.ConferenceBridge, ConferenceBridgeResponse>(conferenceBridge);
        }

        return null;
    }

    public async Task<bool> ModeratorCodeExists(string moderatorCode)
    {
        var isExist = await UnitOfWork.ConferenceBridgeRepository.IsModeratorCodeExist(moderatorCode);
        return isExist;
    }

    public async Task<bool> ParticipantCodeExists(string participantCode)
    {
        var isExist = await UnitOfWork.ConferenceBridgeRepository.IsParticipantCodeExist(participantCode);
        return isExist;
    }

    public async Task<bool> TimeIsOverlap(int ownerId, DateTime? startTime, DateTime? endTime)
    {
        var conferenceBridges = await UnitOfWork.ConferenceBridgeRepository.GetAllByOwnerAsync(ownerId);

        return conferenceBridges.Any(
            conferenceBridge => endTime <= conferenceBridge.PreferredStartTime || startTime >= conferenceBridge.PreferredEndTime);
    }

    public async Task<bool> ConferenceBridgeExists(int conferenceBridgeId)
    {
        var conferenceBridge = await UnitOfWork.ConferenceBridgeRepository.GetByIdAsync(conferenceBridgeId);
        if (conferenceBridge != null)
        {
            return true;
        }

        return false;
    }

    public async Task<bool> ConferenceBridgeIsBooked(int conferenceBridgeId, DateTime startTime, DateTime endTime)
    {
        var conferenceBridge = await UnitOfWork.ConferenceBridgeRepository.GetByIdAsync(conferenceBridgeId);

        if (conferenceBridge != null)
        {
            if (conferenceBridge.PreferredStartTime == null && conferenceBridge.PreferredEndTime == null)
            {
                return false;
            }

            if (endTime <= conferenceBridge.PreferredStartTime || startTime >= conferenceBridge.PreferredEndTime)
            {
                return false;
            }
        }

        return false;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object id)
    {
        var lastModifiedDate = await UnitOfWork.ConferenceBridgeRepository.GetLastModifiedDate((int)id);
        return lastModifiedDate;
    }

    public async Task<List<ConferenceBridgeResponse>> GetAllBridges()
    {
        var allBridges = await UnitOfWork.ConferenceBridgeRepository.GetAllAsync();

        return MapperService.Map<ICollection<Data.Model.ConferenceBridge>, List<ConferenceBridgeResponse>>(allBridges);
    }
}