using System.Threading.Tasks;
using CM.Business.Entities.Models.Poll;
using CM.Business.Services.Base;

namespace CM.Business.Services.Poll
{
    public interface IPollService : IServiceBase
    {
        Task<PollResponse> CreateAsync(PollRequest pollRequest);

        Task<Data.Model.Poll> PatchAsync(Data.Model.Poll poll);

        Task<PollResponse> GetAsync(int id);

        Task<PollGetResponse> GetAsync(PollGetRequest request, int count, int index);

        Task<bool> DeleteAsync(int id);

        Task<bool> IsUniqueByTitle(string pollTitle);

        Task<Data.Model.Poll> GetNoTrackingAsync(int pollId);

        Task<bool> IfChildElementExist(int pollId);
    }
}
