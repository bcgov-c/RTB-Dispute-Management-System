using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.PollResponse;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.Poll;

public class PollResponseService : CmServiceBase, IPollResponseService
{
    public PollResponseService(IMapper mapper, IUnitOfWork unitOfWork)
    : base(unitOfWork, mapper)
    {
    }

    public async Task<PollRespResponse> CreateAsync(int pollId, PollRespRequest pollRespRequest)
    {
        var newPollResponse = MapperService.Map<PollRespRequest, PollResponse>(pollRespRequest);
        newPollResponse.PollId = pollId;

        var pollResponseResult = await UnitOfWork.PollResponseRepository.InsertAsync(newPollResponse);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<PollResponse, PollRespResponse>(pollResponseResult);
        }

        return null;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var pollResponse = await UnitOfWork.PollResponseRepository.GetByIdAsync(id);
        if (pollResponse != null)
        {
            pollResponse.IsDeleted = true;
            UnitOfWork.PollResponseRepository.Attach(pollResponse);
            var result = await UnitOfWork.Complete();
            return result.CheckSuccess();
        }

        return false;
    }

    public async Task<PollRespResponse> GetAsync(int id)
    {
        var pollResponse = await UnitOfWork.PollResponseRepository.GetByIdAsync(id);
        if (pollResponse != null)
        {
            return MapperService.Map<PollResponse, PollRespResponse>(pollResponse);
        }

        return null;
    }

    public async Task<PollRespGetResponse> GetDisputePollResponsesAsync(Guid disputeGuid, int count, int index)
    {
        if (count == 0)
        {
            count = Pagination.DefaultPageSize;
        }

        var pollRespResponse = new PollRespGetResponse();

        var pollResponses = await UnitOfWork.PollResponseRepository.FindAllAsync(x => x.DisputeGuid == disputeGuid);
        if (pollResponses != null)
        {
            pollRespResponse.TotalCount = pollResponses.Count;
            pollRespResponse.PollResponses.AddRange(MapperService
                    .Map<List<PollResponse>, List<PollRespResponse>>(pollResponses
                                                                    .ApplyPaging(count, index)));
        }

        return pollRespResponse;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object id)
    {
        var lastModifiedDate = await UnitOfWork.PollResponseRepository.GetLastModifiedDate((int)id);
        return lastModifiedDate;
    }

    public async Task<PollResponse> GetNoTrackingAsync(int pollResponseId)
    {
        var pollResp = await UnitOfWork.PollResponseRepository
            .GetNoTrackingByIdAsync(x => x.PollResponseId == pollResponseId);
        return pollResp;
    }

    public async Task<PollRespGetResponse> GetParticipantPollResponsesAsync(int participantId, int count, int index)
    {
        if (count == 0)
        {
            count = Pagination.DefaultPageSize;
        }

        var pollRespResponse = new PollRespGetResponse();

        var pollResponses = await UnitOfWork.PollResponseRepository.FindAllAsync(x => x.ParticipantId == participantId);
        if (pollResponses != null)
        {
            pollRespResponse.TotalCount = pollResponses.Count;
            pollRespResponse.PollResponses.AddRange(MapperService
                    .Map<List<PollResponse>, List<PollRespResponse>>(pollResponses
                                                                    .ApplyPaging(count, index)));
        }

        return pollRespResponse;
    }

    public async Task<bool> IsExistedPoll(int pollId)
    {
        var isPollExists = await UnitOfWork.PollRepository.IsPollExists(pollId);
        return isPollExists;
    }

    public async Task<PollResponse> PatchAsync(PollResponse pollResponse)
    {
        UnitOfWork.PollResponseRepository.Attach(pollResponse);
        var result = await UnitOfWork.Complete();

        if (result.CheckSuccess())
        {
            return pollResponse;
        }

        return null;
    }

    public async Task<Guid> ResolveDisputeGuid(int id)
    {
        var entity = await UnitOfWork.PollResponseRepository.GetNoTrackingByIdAsync(x => x.PollResponseId == id);
        return entity?.DisputeGuid ?? Guid.Empty;
    }
}
