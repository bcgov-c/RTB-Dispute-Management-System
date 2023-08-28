using System;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.CmsArchive;
using CM.Business.Entities.Models.Notice;
using CM.Business.Entities.Models.ParticipantIdentity;
using CM.Business.Services.ParticipantIdentityService;
using CM.Business.Services.Parties;
using CM.Business.Services.UserServices;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers
{
    [Produces(Application.Json)]
    [Route("api/participants/participantidentity")]
    public class ParticipantIdentityController : BaseController
    {
        private readonly IMapper _mapper;
        private readonly IParticipantService _participantService;
        private readonly IParticipantIdentityService _participantIdentityService;
        private readonly IUserService _userService;

        public ParticipantIdentityController(
            IMapper mapper,
            IParticipantService participantService,
            IParticipantIdentityService participantIdentityService,
            IUserService userService)
        {
            _mapper = mapper;
            _participantService = participantService;
            _participantIdentityService = participantIdentityService;
            _userService = userService;
        }

        [HttpPost]
        [AuthorizationRequired(new[] { RoleNames.Admin })]
        public async Task<IActionResult> Post([FromBody] ParticipantIdentityPostRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var participant = await _participantService.GetAsync(request.ParticipantId);
            if (participant == null)
            {
                return BadRequest(string.Format(ApiReturnMessages.ParticipantDoesNotExist, request.ParticipantId));
            }

            var identityParticipant = await _participantService.GetAsync(request.IdentityParticipantId);
            if (identityParticipant == null)
            {
                return BadRequest(string.Format(ApiReturnMessages.IdentityParticipantDoesNotExist, request.IdentityParticipantId));
            }

            if (participant.DisputeGuid == identityParticipant.DisputeGuid)
            {
                return BadRequest(ApiReturnMessages.SameDisputeAssociation);
            }

            if (request.IdentitySystemUserId.HasValue)
            {
                var user = await _userService.GetSystemUser(request.IdentitySystemUserId.Value);
                if (user == null || user.SystemUserRoleId != (int)Roles.ExternalUser)
                {
                    return BadRequest(ApiReturnMessages.InvalidUser);
                }
            }

            var newParticipantIdentity = await _participantIdentityService.CreateAsync(request);
            EntityIdSetContext(newParticipantIdentity.ParticipantIdentityId);
            return Ok(newParticipantIdentity);
        }

        [HttpPatch("{particpantIdentityId:int}")]
        [AuthorizationRequired(new[] { RoleNames.Admin })]
        [ApplyConcurrencyCheck]
        public async Task<IActionResult> Patch(int particpantIdentityId, [FromBody] JsonPatchDocumentExtension<ParticipantIdentityPatchRequest> request)
        {
            if (CheckModified(_participantIdentityService, particpantIdentityId))
            {
                return StatusConflicted();
            }

            var originalIdentity = await _participantIdentityService.GetNoTrackingNoticeAsync(particpantIdentityId);
            if (originalIdentity != null)
            {
                var identityToPatch = _mapper.Map<ParticipantIdentity, ParticipantIdentityPatchRequest>(originalIdentity);
                request.ApplyTo(identityToPatch);

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var identityParticipantId = request.GetValue<int>("/identity_participant_id");
                if (identityParticipantId.Exists)
                {
                    var identityParticipant = await _participantService.GetAsync(identityParticipantId.Value);
                    if (identityParticipant == null)
                    {
                        return BadRequest(string.Format(ApiReturnMessages.IdentityParticipantDoesNotExist, identityParticipantId));
                    }

                    if (originalIdentity.DisputeGuid == identityParticipant.DisputeGuid)
                    {
                        return BadRequest(ApiReturnMessages.SameDisputeAssociation);
                    }
                }

                var userId = request.GetValue<int>("/identity_system_user_id");
                if (userId.Exists)
                {
                    var user = await _userService.GetSystemUser(userId.Value);
                    if (user == null || user.SystemUserRoleId != (int)Roles.ExternalUser)
                    {
                        return BadRequest(ApiReturnMessages.InvalidUser);
                    }
                }

                _mapper.Map(identityToPatch, originalIdentity);
                var result = await _participantIdentityService.PatchAsync(originalIdentity);

                if (result != null)
                {
                    EntityIdSetContext(particpantIdentityId);
                    return Ok(result);
                }
            }

            return NotFound();
        }

        [HttpDelete("{particpantIdentityId:int}")]
        [AuthorizationRequired(new[] { RoleNames.Admin })]
        [ApplyConcurrencyCheck]
        public async Task<IActionResult> Delete(int particpantIdentityId)
        {
            if (CheckModified(_participantIdentityService, particpantIdentityId))
            {
                return StatusConflicted();
            }

            await DisputeResolveAndSetContext(_participantIdentityService, particpantIdentityId);
            var result = await _participantIdentityService.DeleteAsync(particpantIdentityId);
            if (result)
            {
                EntityIdSetContext(particpantIdentityId);
                return Ok(ApiReturnMessages.Deleted);
            }

            return NotFound();
        }

        [HttpGet("{particpantIdentityId:int}")]
        [AuthorizationRequired(new[] { RoleNames.Admin })]
        public async Task<IActionResult> GetById(int particpantIdentityId)
        {
            var participantIdentity = await _participantIdentityService.GetByIdAsync(particpantIdentityId);
            if (participantIdentity != null)
            {
                return Ok(participantIdentity);
            }

            return NotFound();
        }

        [HttpGet("/api/participants/disputeparticipantidentities/{disputeGuid:Guid}")]
        [AuthorizationRequired(new[] { RoleNames.Admin })]
        public async Task<IActionResult> GetByDisputeGuid(Guid disputeGuid, int count, int index)
        {
            var participantIdentities = await _participantIdentityService.GetByDisputeGuidAsync(disputeGuid, count, index);
            if (participantIdentities != null)
            {
                return Ok(participantIdentities);
            }

            return NotFound();
        }

        [HttpGet("/api/participants/disputeparticipantidentities/{participantId:int}")]
        [AuthorizationRequired(new[] { RoleNames.Admin })]
        public async Task<IActionResult> GetByParticipant(int participantId, int count, int index)
        {
            var participantIdentities = await _participantIdentityService.GetByParticipantAsync(participantId, count, index);
            if (participantIdentities != null)
            {
                return Ok(participantIdentities);
            }

            return NotFound();
        }
    }
}
