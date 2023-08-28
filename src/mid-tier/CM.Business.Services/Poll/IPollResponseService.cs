using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.PollResponse;
using CM.Business.Services.Base;

namespace CM.Business.Services.Poll
{
    public interface IPollResponseService : IServiceBase, IDisputeResolver
    {
        Task<PollRespResponse> CreateAsync(int pollId, PollRespRequest pollRequest);

        Task<Data.Model.PollResponse> PatchAsync(Data.Model.PollResponse pollResponse);

        Task<PollRespResponse> GetAsync(int id);

        Task<bool> DeleteAsync(int id);

        Task<Data.Model.PollResponse> GetNoTrackingAsync(int pollResponseId);

        Task<PollRespGetResponse> GetParticipantPollResponsesAsync(int participantId, int count, int index);

        Task<PollRespGetResponse> GetDisputePollResponsesAsync(Guid disputeGuid, int count, int index);

        Task<bool> IsExistedPoll(int pollId);
    }
}
