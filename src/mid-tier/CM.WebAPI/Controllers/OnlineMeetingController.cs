using System;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.OnlineMeeting;
using CM.Business.Services.DisputeServices;
using CM.Business.Services.OnlineMeeting;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers
{
    [Produces(Application.Json)]
    [Route("api/linking")]
    public class OnlineMeetingController : BaseController
    {
        private readonly IMapper _mapper;
        private readonly IOnlineMeetingService _onlineMeetingService;
        private readonly IDisputeService _disputeService;

        public OnlineMeetingController(IMapper mapper, IOnlineMeetingService onlineMeetingService, IDisputeService disputeService)
        {
            _mapper = mapper;
            _onlineMeetingService = onlineMeetingService;
            _disputeService = disputeService;
        }

        [HttpPost("onlinemeeting")]
        [AuthorizationRequired(new[] { RoleNames.Admin })]
        public async Task<IActionResult> Post([FromBody] OnlineMeetingPostRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var newOnlineMeeting = await _onlineMeetingService.CreateAsync(request);
            EntityIdSetContext(newOnlineMeeting.OnlineMeetingId);

            return Ok(newOnlineMeeting);
        }

        [HttpPatch("onlinemeeting/{onlineMeetingId:int}")]
        [AuthorizationRequired(new[] { RoleNames.Admin })]
        [ApplyConcurrencyCheck]
        public async Task<IActionResult> Patch(int onlineMeetingId, [FromBody] JsonPatchDocumentExtension<DisputeLinkPatchRequest> request)
        {
            if (CheckModified(_onlineMeetingService, onlineMeetingId))
            {
                return StatusConflicted();
            }

            var onlineMeeting = await _onlineMeetingService.GetNoTrackingAsync(onlineMeetingId);
            var onlineMeetingToPatch = _mapper.Map<OnlineMeeting, DisputeLinkPatchRequest>(onlineMeeting);
            if (onlineMeetingToPatch != null)
            {
                request.ApplyTo(onlineMeetingToPatch);
                var valid = TryValidateModel(onlineMeetingToPatch);
                if (!ModelState.IsValid || !valid)
                {
                    return BadRequest(ModelState);
                }

                var result = await _onlineMeetingService.PatchDisputeLinkAsync(onlineMeetingId, onlineMeetingToPatch);

                if (result != null)
                {
                    EntityIdSetContext(onlineMeetingId);
                    return Ok(result);
                }
            }

            return NotFound();
        }

        [HttpDelete("onlinemeeting/{onlineMeetingId:int}")]
        [AuthorizationRequired(new[] { RoleNames.Admin })]
        [ApplyConcurrencyCheck]
        public async Task<IActionResult> Delete(int onlineMeetingId)
        {
            if (CheckModified(_onlineMeetingService, onlineMeetingId))
            {
                return StatusConflicted();
            }

            var result = await _onlineMeetingService.DeleteAsync(onlineMeetingId);
            if (result)
            {
                EntityIdSetContext(onlineMeetingId);
                return Ok(ApiReturnMessages.Deleted);
            }

            return NotFound();
        }

        [HttpGet("onlinemeeting/{onlineMeetingId:int}")]
        [AuthorizationRequired(new[] { RoleNames.Admin })]
        public async Task<IActionResult> GetById(int onlineMeetingId)
        {
            var onlineMeeting = await _onlineMeetingService.GetByIdAsync(onlineMeetingId);
            if (onlineMeeting != null)
            {
                return Ok(onlineMeeting);
            }

            return NotFound();
        }

        [HttpPost("disputelink")]
        [AuthorizationRequired(new[] { RoleNames.Admin })]
        public async Task<IActionResult> PostDisputeLink([FromBody] DisputeLinkPostRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var dispute = await _disputeService.GetDisputeNoTrackAsync(request.DisputeGuid);
            if (dispute == null)
            {
                return BadRequest(string.Format(ApiReturnMessages.DisputeDoesNotExist, request.DisputeGuid));
            }

            var existedDisputeLink = await _onlineMeetingService
                .GetDisputeLinkByDisputeAsync(request.DisputeGuid, null);
            if (existedDisputeLink != null && existedDisputeLink.Count > 0)
            {
                var existsStatus1 = existedDisputeLink.Any(x => x.DisputeLinkStatus == DisputeLinkStatus.Active);
                if (existsStatus1)
                {
                    return BadRequest(ApiReturnMessages.DisputeLinkExist);
                }
            }

            var onlineMeeting = await _onlineMeetingService.GetNoTrackingAsync(request.OnlineMeetingId);
            if (onlineMeeting == null)
            {
                return BadRequest(ApiReturnMessages.OnlineMeetingNotExists);
            }

            var existed = await _onlineMeetingService
                .IsExistedDisputeLink(request.DisputeLinkRole, request.OnlineMeetingId);
            if (request.DisputeLinkRole == DisputeLinkRole.Primary && existed)
            {
                return BadRequest(ApiReturnMessages.PrimaryDisputeLinkExists);
            }
            else if (request.DisputeLinkRole > DisputeLinkRole.Primary && !existed)
            {
                return BadRequest(ApiReturnMessages.PrimaryDisputeLinkMustExists);
            }

            DisputeSetContext(request.DisputeGuid);
            var newDisputeLink = await _onlineMeetingService.CreateDisputeLinkAsync(request);
            EntityIdSetContext(newDisputeLink.DisputeLinkId);

            return Ok(newDisputeLink);
        }

        [HttpPatch("disputelink/{disputeLinkId:int}")]
        [AuthorizationRequired(new[] { RoleNames.Admin })]
        [ApplyConcurrencyCheck]
        public async Task<IActionResult> PatchDisputeLink(int disputeLinkId, [FromBody] JsonPatchDocumentExtension<DisputeLinkPatchRequest> request)
        {
            if (CheckModified(_onlineMeetingService, disputeLinkId))
            {
                return StatusConflicted();
            }

            var disputeLink = await _onlineMeetingService.GetNoTrackingDisputeLinkAsync(disputeLinkId);
            var disputeLinkToPatch = _mapper.Map<DisputeLink, DisputeLinkPatchRequest>(disputeLink);
            if (disputeLinkToPatch != null)
            {
                var disputeLinkRole = request.GetValue<DisputeLinkRole?>("/dispute_link_role");
                if (disputeLinkRole.Exists && disputeLinkRole.Value == disputeLink.DisputeLinkRole)
                {
                    return BadRequest(ApiReturnMessages.SameDisputeLinkRole);
                }

                var disputeLinkStatus = request.GetValue<int?>("/dispute_link_status");
                if (disputeLinkStatus.Exists && disputeLinkStatus.Value == (int)DisputeLinkStatus.Active)
                {
                    return BadRequest(ApiReturnMessages.WrongDisputeLinkStatus);
                }

                request.ApplyTo(disputeLinkToPatch);
                var valid = TryValidateModel(disputeLinkToPatch);
                if (!ModelState.IsValid || !valid)
                {
                    return BadRequest(ModelState);
                }

                await DisputeResolveAndSetContext(_onlineMeetingService, disputeLinkId);

                var result = await _onlineMeetingService.PatchDisputeLinkAsync(disputeLinkId, disputeLinkToPatch);

                if (result != null)
                {
                    EntityIdSetContext(disputeLinkId);
                    return Ok(result);
                }
            }

            return NotFound();
        }

        [HttpDelete("disputelink/{disputeLinkId:int}")]
        [AuthorizationRequired(new[] { RoleNames.Admin })]
        [ApplyConcurrencyCheck]
        public async Task<IActionResult> DeleteDisputeLink(int disputeLinkId)
        {
            if (CheckModified(_onlineMeetingService, disputeLinkId))
            {
                return StatusConflicted();
            }

            var isActiveDisputeLink = await _onlineMeetingService
                .GetNoTrackingDisputeLinkAsync(disputeLinkId);
            if (isActiveDisputeLink.DisputeLinkStatus != DisputeLinkStatus.Active)
            {
                return BadRequest(ApiReturnMessages.InvalidDisputeLink);
            }

            var result = await _onlineMeetingService.DeleteDisputeLinkAsync(disputeLinkId);
            if (result)
            {
                EntityIdSetContext(disputeLinkId);
                return Ok(ApiReturnMessages.Deleted);
            }

            return NotFound();
        }

        [HttpGet("disputelinks/{disputeGuid:Guid}")]
        [AuthorizationRequired(new[] { RoleNames.Admin })]
        public async Task<IActionResult> GetDisputeLinkById(Guid disputeGuid, [FromQuery] DisputeLinkGetRequest request)
        {
            var disputeLinks = await _onlineMeetingService.GetDisputeLinkByDisputeAsync(disputeGuid, request);
            if (disputeLinks != null)
            {
                return Ok(disputeLinks);
            }

            return NotFound();
        }
    }
}
