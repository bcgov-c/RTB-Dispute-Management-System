using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.Poll;
using CM.Business.Services.Poll;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers
{
    [Produces(Application.Json)]
    [Route("api/polls/poll")]
    public class PollController : BaseController
    {
        private readonly IMapper _mapper;
        private readonly IPollService _pollService;

        public PollController(IPollService pollService, IMapper mapper)
        {
            _pollService = pollService;
            _mapper = mapper;
        }

        [HttpPost]
        [AuthorizationRequired(new[] { RoleNames.ExtendedAdmin })]
        public async Task<IActionResult> Post([FromBody] PollRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var isUnique = await _pollService.IsUniqueByTitle(request.PollTitle);

            if (!isUnique)
            {
                return BadRequest(ApiReturnMessages.PollTitleExists);
            }

            var result = await _pollService.CreateAsync(request);
            EntityIdSetContext(result.PollId);
            return Ok(result);
        }

        [HttpPatch("{pollId:int}")]
        [ApplyConcurrencyCheck]
        [AuthorizationRequired(new[] { RoleNames.ExtendedAdmin })]
        public async Task<IActionResult> Patch(int pollId, [FromBody] JsonPatchDocumentExtension<PollPatchRequest> poll)
        {
            if (CheckModified(_pollService, pollId))
            {
                return StatusConflicted();
            }

            var originalPoll = await _pollService.GetNoTrackingAsync(pollId);
            if (originalPoll != null)
            {
                var pollToPatch = _mapper.Map<Poll, PollPatchRequest>(originalPoll);
                poll.ApplyTo(pollToPatch);

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var(exists, pollTitle) = poll.GetValue<string>("/poll_title");
                if (exists)
                {
                    if (pollTitle.Length < 5 || pollTitle.Length > 150)
                    {
                        return BadRequest(ApiReturnMessages.PollTitleLengthIssue);
                    }

                    var isUnique = await _pollService.IsUniqueByTitle(pollTitle);
                    if (!isUnique)
                    {
                        return BadRequest(ApiReturnMessages.PollTitleExists);
                    }
                }

                _mapper.Map(pollToPatch, originalPoll);

                var result = await _pollService.PatchAsync(originalPoll);

                if (result != null)
                {
                    EntityIdSetContext(pollId);
                    return Ok(_mapper.Map<Poll, Business.Entities.Models.Poll.PollResponse>(result));
                }
            }

            return NotFound();
        }

        [HttpDelete("{pollId:int}")]
        [ApplyConcurrencyCheck]
        [AuthorizationRequired(new[] { RoleNames.ExtendedAdmin })]
        public async Task<IActionResult> Delete(int pollId)
        {
            if (CheckModified(_pollService, pollId))
            {
                return StatusConflicted();
            }

            var childExists = await _pollService.IfChildElementExist(pollId);
            if (childExists)
            {
                return BadRequest(string.Format(ApiReturnMessages.PollChildReference, pollId));
            }

            var result = await _pollService.DeleteAsync(pollId);
            if (result)
            {
                EntityIdSetContext(pollId);
                return Ok(ApiReturnMessages.Deleted);
            }

            return NotFound();
        }

        [HttpGet("{pollId:int}")]
        [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.User, RoleNames.AccessCode, RoleNames.OfficePay })]
        public async Task<IActionResult> GetById(int pollId)
        {
            var poll = await _pollService.GetAsync(pollId);
            if (poll != null)
            {
                return Ok(poll);
            }

            return NotFound();
        }

        [HttpGet("/api/polls/polls")]
        [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.User, RoleNames.AccessCode, RoleNames.OfficePay })]
        public async Task<IActionResult> GetPolls(PollGetRequest request, int count, int index)
        {
            var polls = await _pollService.GetAsync(request, count, index);
            if (polls != null)
            {
                return Ok(polls);
            }

            return NotFound();
        }
    }
}
