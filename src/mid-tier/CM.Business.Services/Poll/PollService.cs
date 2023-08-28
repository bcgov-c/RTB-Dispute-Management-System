using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.Poll;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.Poll
{
    public class PollService : CmServiceBase, IPollService
    {
        public PollService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
        {
        }

        public async Task<Entities.Models.Poll.PollResponse> CreateAsync(PollRequest pollRequest)
        {
            var newPoll = MapperService.Map<PollRequest, Data.Model.Poll>(pollRequest);

            var pollResult = await UnitOfWork.PollRepository.InsertAsync(newPoll);
            var result = await UnitOfWork.Complete();
            if (result.CheckSuccess())
            {
                return MapperService.Map<Data.Model.Poll, Entities.Models.Poll.PollResponse>(pollResult);
            }

            return null;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var poll = await UnitOfWork.PollRepository.GetByIdAsync(id);
            if (poll != null)
            {
                poll.IsDeleted = true;
                UnitOfWork.PollRepository.Attach(poll);
                var result = await UnitOfWork.Complete();
                return result.CheckSuccess();
            }

            return false;
        }

        public async Task<PollResponse> GetAsync(int id)
        {
            var poll = await UnitOfWork.PollRepository.GetByIdAsync(id);
            if (poll != null)
            {
                return MapperService.Map<Data.Model.Poll, Entities.Models.Poll.PollResponse>(poll);
            }

            return null;
        }

        public async Task<PollGetResponse> GetAsync(PollGetRequest request, int count, int index)
        {
            if (count == 0)
            {
                count = Pagination.DefaultPageSize;
            }

            var pollResponse = new PollGetResponse();

            var polls = await UnitOfWork.PollRepository.GetPolls(request);
            if (polls != null)
            {
                pollResponse.TotalCount = polls.Count;
                pollResponse.Polls.AddRange(MapperService
                        .Map<List<Data.Model.Poll>, List<Entities.Models.Poll.PollResponse>>(polls
                                                                        .ApplyPaging(count, index)));
            }

            return pollResponse;
        }

        public async Task<DateTime?> GetLastModifiedDateAsync(object id)
        {
            var lastModifiedDate = await UnitOfWork.PollRepository.GetLastModifiedDate((int)id);
            return lastModifiedDate;
        }

        public async Task<Data.Model.Poll> GetNoTrackingAsync(int pollId)
        {
            var poll = await UnitOfWork.PollRepository.GetNoTrackingByIdAsync(x => x.PollId == pollId);
            return poll;
        }

        public async Task<bool> IfChildElementExist(int pollId)
        {
            var isChildsExists = await UnitOfWork.PollRepository.IsChildsExists(pollId);
            return isChildsExists;
        }

        public async Task<bool> IsUniqueByTitle(string pollTitle)
        {
            var isExists = await UnitOfWork.PollRepository.IsExists(pollTitle);
            return !isExists;
        }

        public async Task<Data.Model.Poll> PatchAsync(Data.Model.Poll poll)
        {
            UnitOfWork.PollRepository.Attach(poll);
            var result = await UnitOfWork.Complete();

            if (result.CheckSuccess())
            {
                return poll;
            }

            return null;
        }
    }
}
