using System.Threading.Tasks;
using CM.Business.Services.AccessCode;
using CM.Business.Services.Parties;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using CM.WebAPI.WebApiHelpers;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
public class AccessCodeController : Controller
{
    private readonly IAccessCodeService _accessCodeService;
    private readonly IParticipantService _participantService;

    public AccessCodeController(IAccessCodeService accessCodeService, IParticipantService participantService)
    {
        _accessCodeService = accessCodeService;
        _participantService = participantService;
    }

    [HttpPost("api/accesscodelogin/{accesscode}")]
    public async Task<IActionResult> Post(string accesscode)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var participant = await _accessCodeService.CheckAccessCodeExistence(accesscode);
        if (participant == null)
        {
            return BadRequest(ApiReturnMessages.IncorrectAccessCode);
        }

        var disputeUser = await _accessCodeService.GetAssociatedDisputeUser(participant);

        if (disputeUser.SystemUser.IsActive != null && !disputeUser.SystemUser.IsActive.Value)
        {
            return Unauthorized();
        }

        var accessCodeParticipant = await _participantService.GetByAccessCode(accesscode);
        if (accessCodeParticipant is { ParticipantStatus: (byte)ParticipantStatus.Deleted or (byte)ParticipantStatus.Removed })
        {
            return BadRequest(ApiReturnMessages.ParticipantRemoved);
        }

        var isDisputeClosed = await _accessCodeService.CheckDisputeStatus(participant.DisputeGuid);

        if (isDisputeClosed)
        {
            var closedDispute = await _accessCodeService.GetClosedDisputeInfo(accesscode);
            return Ok(closedDispute);
        }

        var token = await _accessCodeService.Authenticate(disputeUser.SystemUserId, participant.ParticipantId);
        if (token != null)
        {
            HttpContext.Response.Headers.Add(ApiHeader.Token, token);

            return Ok(token);
        }

        return Unauthorized();
    }

    [HttpGet("api/accesscodefileinfo/")]
    [AuthorizationRequired(new[] { RoleNames.ExtendedAccessCode })]
    public async Task<IActionResult> Get()
    {
        var token = ControllerContext.HttpContext.Request.GetToken();
        var fileInfo = await _accessCodeService.GetAccessCodeFileInfo(token);
        return Ok(fileInfo);
    }
}