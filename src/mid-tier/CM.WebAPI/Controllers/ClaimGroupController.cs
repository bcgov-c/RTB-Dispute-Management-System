using System;
using System.Threading.Tasks;
using CM.Business.Services.DisputeServices;
using CM.Business.Services.Parties;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api/parties")]
public class ClaimGroupController : BaseController
{
    private readonly IClaimGroupService _claimGroupService;
    private readonly IDisputeService _disputeService;

    public ClaimGroupController(IClaimGroupService claimGroupService, IDisputeService disputeService)
    {
        _claimGroupService = claimGroupService;
        _disputeService = disputeService;
    }

    [HttpPost("claimgroup/{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser })]
    public async Task<IActionResult> Post(Guid disputeGuid)
    {
        var disputeExists = await _disputeService.DisputeExistsAsync(disputeGuid);
        if (!disputeExists)
        {
            return BadRequest(string.Format(ApiReturnMessages.DisputeDoesNotExist, disputeGuid));
        }

        var claimGroupExists = await _claimGroupService.ClaimGroupExists(disputeGuid);
        if (claimGroupExists)
        {
            return BadRequest(string.Format(ApiReturnMessages.ClaimGroupAlreadyExist, disputeGuid));
        }

        DisputeSetContext(disputeGuid);
        var result = await _claimGroupService.Create(disputeGuid);
        EntityIdSetContext(result.ClaimGroupId);
        return Ok(result);
    }
}