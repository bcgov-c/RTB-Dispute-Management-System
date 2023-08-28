using System;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.PollResponse;
using CM.Business.Services.DisputeServices;
using CM.Business.Services.Files;
using CM.Business.Services.Parties;
using CM.Business.Services.Poll;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers
{
    [Produces(Application.Json)]
    [Route("api/polls/pollresponse")]
    public class PollResponseController : BaseController
    {
        private readonly IMapper _mapper;
        private readonly IPollResponseService _pollResponseService;
        private readonly IDisputeService _disputeService;
        private readonly IParticipantService _participantService;
        private readonly IFileService _fileService;

        public PollResponseController(
            IPollResponseService pollResponseService,
            IDisputeService disputeService,
            IParticipantService participantService,
            IFileService fileService,
            IMapper mapper)
        {
            _pollResponseService = pollResponseService;
            _disputeService = disputeService;
            _participantService = participantService;
            _fileService = fileService;
            _mapper = mapper;
        }

        [HttpPost("{pollId:int}")]
        [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser, RoleNames.ExtendedAccessCode })]
        public async Task<IActionResult> Post(int pollId, [FromBody] PollRespRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var isExistedPoll = await _pollResponseService.IsExistedPoll(pollId);
            if (!isExistedPoll)
            {
                return BadRequest(ApiReturnMessages.InvalidPoll);
            }

            var dispute = await _disputeService.DisputeExistsAsync(request.DisputeGuid);
            if (!dispute)
            {
                return BadRequest(ApiReturnMessages.InvalidDisputeGuid);
            }

            if (request.ParticipantId.HasValue)
            {
                var participantExists = await _participantService.IsActiveParticipantExists(request.ParticipantId.Value);
                if (!participantExists)
                {
                    return BadRequest(ApiReturnMessages.InvalidParticipant);
                }
            }

            if (request.AssociatedFileId.HasValue)
            {
                var fileAssociated = await _fileService.IsFileAssociatedToDispute(request.AssociatedFileId.Value, request.DisputeGuid);
                if (!fileAssociated)
                {
                    return BadRequest(ApiReturnMessages.FileNotAssociatedToDispute);
                }
            }

            var result = await _pollResponseService.CreateAsync(pollId, request);
            EntityIdSetContext(result.PollResponseId);
            return Ok(result);
        }

        [HttpPatch("{pollResponseId:int}")]
        [ApplyConcurrencyCheck]
        [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser, RoleNames.ExtendedAccessCode })]
        public async Task<IActionResult> Patch(int pollResponseId, [FromBody] JsonPatchDocumentExtension<PollRespPatchRequest> poll)
        {
            if (CheckModified(_pollResponseService, pollResponseId))
            {
                return StatusConflicted();
            }

            var originalPollResp = await _pollResponseService.GetNoTrackingAsync(pollResponseId);
            if (originalPollResp != null)
            {
                var pollRespToPatch = _mapper.Map<PollResponse, PollRespPatchRequest>(originalPollResp);
                poll.ApplyTo(pollRespToPatch);

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var(exists, fileId) = poll.GetValue<int?>("/associated_file_id");
                if (exists)
                {
                    var fileAssociated = await _fileService.IsFileAssociatedToDispute(fileId.Value, originalPollResp.DisputeGuid);
                    if (!fileAssociated)
                    {
                        return BadRequest(ApiReturnMessages.FileNotAssociatedToDispute);
                    }
                }

                _mapper.Map(pollRespToPatch, originalPollResp);

                var result = await _pollResponseService.PatchAsync(originalPollResp);

                if (result != null)
                {
                    EntityIdSetContext(pollResponseId);
                    return Ok(_mapper.Map<PollResponse, PollRespResponse>(result));
                }
            }

            return NotFound();
        }

        [HttpDelete("{pollResponseId:int}")]
        [ApplyConcurrencyCheck]
        [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser, RoleNames.ExtendedAccessCode })]
        public async Task<IActionResult> Delete(int pollResponseId)
        {
            if (CheckModified(_pollResponseService, pollResponseId))
            {
                return StatusConflicted();
            }

            var result = await _pollResponseService.DeleteAsync(pollResponseId);
            if (result)
            {
                EntityIdSetContext(pollResponseId);
                return Ok(ApiReturnMessages.Deleted);
            }

            return NotFound();
        }

        [HttpGet("{pollResponseId:int}")]
        [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser, RoleNames.ExtendedAccessCode })]
        public async Task<IActionResult> Get(int pollResponseId)
        {
            var pollResponse = await _pollResponseService.GetAsync(pollResponseId);
            if (pollResponse != null)
            {
                return Ok(pollResponse);
            }

            return NotFound();
        }

        [HttpGet("/api/polls/participantpollresponses/{participantId:int}")]
        [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser, RoleNames.ExtendedAccessCode })]
        public async Task<IActionResult> GetParticipantPollResponses(int participantId, int count, int index)
        {
            var pollResponses = await _pollResponseService.GetParticipantPollResponsesAsync(participantId, count, index);
            if (pollResponses != null)
            {
                return Ok(pollResponses);
            }

            return NotFound();
        }

        [HttpGet("/api/polls/disputepollresponses/{disputeGuid:Guid}")]
        [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser, RoleNames.ExtendedAccessCode })]
        public async Task<IActionResult> GetDisputePollResponses(Guid disputeGuid, int count, int index)
        {
            var pollResponses = await _pollResponseService.GetDisputePollResponsesAsync(disputeGuid, count, index);
            if (pollResponses != null)
            {
                return Ok(pollResponses);
            }

            return NotFound();
        }
    }
}
