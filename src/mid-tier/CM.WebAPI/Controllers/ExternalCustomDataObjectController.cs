using System;
using System.Threading.Tasks;
using CM.Business.Entities.Models.ExternalCustomDataObject;
using CM.Business.Services.ExternalCustomDataObject;
using CM.Business.Services.UserServices;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using CM.WebAPI.Jwt;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
public class ExternalCustomDataObjectController : BaseController
{
    private readonly IExternalCustomDataObjectService _externalCustomDataObjectService;
    private readonly IJwtUtils _jwtUtils;
    private readonly IUserService _userService;

    public ExternalCustomDataObjectController(IExternalCustomDataObjectService externalCustomDataObjectService, IUserService userService, IOptions<JwtSettings> appSettings)
    {
        _externalCustomDataObjectService = externalCustomDataObjectService;
        _userService = userService;
        _jwtUtils = new JwtUtils(appSettings);
    }

    [HttpPost("api/externalcustomdataobject")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> Post([FromBody] ExternalCustomDataObjectRequest externalCustomDataObjectRequest)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var newExternalCustomDataObject = await _externalCustomDataObjectService.CreateAsync(externalCustomDataObjectRequest);
        return Ok(newExternalCustomDataObject);
    }

    [HttpPost("api/externalcustomdataobject/{sessionToken}")]
    public async Task<IActionResult> Post(string sessionToken, [FromBody] ExternalCustomDataObjectRequest externalCustomDataObjectRequest)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var sessionGuid = _jwtUtils.ValidateToken(sessionToken);

        if (!sessionGuid.HasValue)
        {
            return Unauthorized();
        }

        var isExists = await _externalCustomDataObjectService.IsSessionExists(sessionGuid);

        if (!isExists)
        {
            var newExternalCustomDataObject = await _externalCustomDataObjectService.CreateAsync(sessionGuid, externalCustomDataObjectRequest);
            return Ok(newExternalCustomDataObject);
        }

        return Unauthorized();
    }

    [HttpPatch("api/externalcustomdataobject/{externalCustomObjectId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> Patch(int externalCustomObjectId,
        [FromBody] JsonPatchDocumentExtension<ExternalCustomObjectPatchRequest> externalCustomObjectRequest)
    {
        if (CheckModified(_externalCustomDataObjectService, externalCustomObjectId))
        {
            return StatusConflicted();
        }

        var externalCustomObjectToPatch = await _externalCustomDataObjectService.GetForPatchAsync(externalCustomObjectId);
        if (externalCustomObjectToPatch != null)
        {
            var(exists, value) = externalCustomObjectRequest.GetValue<int>("/owner_id");
            if (exists)
            {
                var userExists = await _userService.GetSystemUser(value);
                if (userExists is not { SystemUserRoleId: (int)Roles.StaffUser })
                {
                    return BadRequest(string.Format(ApiReturnMessages.InvalidExternalCustomDataObjectOwner));
                }
            }

            var(expiryExists, expiryValue) = externalCustomObjectRequest.GetValue<DateTime?>("/external_user_session_expiry");
            if (expiryExists)
            {
                if (expiryValue.HasValue && expiryValue.Value <= DateTime.UtcNow)
                {
                    return BadRequest(ApiReturnMessages.InvalidExpiryDate);
                }
            }

            try
            {
                externalCustomObjectRequest.ApplyTo(externalCustomObjectToPatch);
            }
            catch (Exception)
            {
                return null;
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _externalCustomDataObjectService.PatchAsync(externalCustomObjectId, externalCustomObjectToPatch);

            if (result != null)
            {
                return Ok(result);
            }
        }

        return NotFound();
    }

    [HttpPatch("api/externalcustomdataobject/{externalCustomObjectId:int}/externalsession/{sessionToken}")]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> Patch(string sessionToken, int externalCustomObjectId, [FromBody]JsonPatchDocumentExtension<ExternalCustomObjectPatchRequest> externalCustomObjectRequest)
    {
        if (CheckModified(_externalCustomDataObjectService, externalCustomObjectId))
        {
            return StatusConflicted();
        }

        var sessionGuid = await CanSessionAccessToExternalCustomDataObject(externalCustomObjectId, sessionToken);
        if (sessionGuid == null)
        {
            return Unauthorized();
        }

        var externalCustomObjectToPatch = await _externalCustomDataObjectService.GetForPatchAsync(externalCustomObjectId);
        if (externalCustomObjectToPatch != null)
        {
            var(exists, value) = externalCustomObjectRequest.GetValue<int>("/owner_id");
            if (exists)
            {
                var userExists = await _userService.GetSystemUser(value);
                if (userExists is not { SystemUserRoleId: (int)Roles.StaffUser })
                {
                    return BadRequest(string.Format(ApiReturnMessages.InvalidExternalCustomDataObjectOwner));
                }
            }

            try
            {
                externalCustomObjectRequest.ApplyTo(externalCustomObjectToPatch);
            }
            catch (Exception)
            {
                return null;
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _externalCustomDataObjectService.PatchAsync(externalCustomObjectId, externalCustomObjectToPatch);

            if (result != null)
            {
                return Ok(result);
            }
        }

        return NotFound();
    }

    [HttpDelete("api/externalcustomdataobject/{externalCustomObjectId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> Delete(int externalCustomObjectId)
    {
        if (CheckModified(_externalCustomDataObjectService, externalCustomObjectId))
        {
            return StatusConflicted();
        }

        var result = await _externalCustomDataObjectService.DeleteAsync(externalCustomObjectId);
        if (result)
        {
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }

    [HttpDelete("api/externalcustomdataobject/{externalCustomObjectId:int}/externalsession/{sessionToken}")]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> Delete(string sessionToken, int externalCustomObjectId)
    {
        if (CheckModified(_externalCustomDataObjectService, externalCustomObjectId))
        {
            return StatusConflicted();
        }

        var sessionGuid = await CanSessionAccessToExternalCustomDataObject(externalCustomObjectId, sessionToken);
        if (sessionGuid == null)
        {
            return Unauthorized();
        }

        var result = await _externalCustomDataObjectService.DeleteAsync(externalCustomObjectId);
        if (result)
        {
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }

    [HttpGet("api/externalcustomdataobject/{externalCustomObjectId:int}")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> Get(int externalCustomObjectId)
    {
        var externalCustomObject = await _externalCustomDataObjectService.GetExternalCustomObject(externalCustomObjectId);
        if (externalCustomObject != null)
        {
            return Ok(externalCustomObject);
        }

        return NotFound();
    }

    [HttpGet("api/externalcustomdataobjects")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> Get(ExternalCustomObjectGetRequest request)
    {
        var externalCustomObjects = await _externalCustomDataObjectService.GetExternalCustomObjects(request);
        if (externalCustomObjects != null)
        {
            return Ok(externalCustomObjects);
        }

        return NotFound();
    }

    [HttpPost("api/externalcustomdataobjects/refresh-token")]
    public async Task<IActionResult> Refresh(string token, string refreshToken)
    {
        try
        {
            var sessionGuid = _jwtUtils.GetPrincipalFromExpiredToken(token);

            if (sessionGuid == null)
            {
                throw new SecurityTokenException(ApiReturnMessages.InvalidSessionClaims);
            }

            await _externalCustomDataObjectService.GetRefreshToken(sessionGuid.GetValueOrDefault());

            // TODO: Need to revisit and enable
            /*
            if (savedRefreshToken != refreshToken)
            {
                throw new SecurityTokenException(ApiReturnMessages.InvalidRefreshToken);
            }
            */

            var newJwtToken = _jwtUtils.GenerateToken(sessionGuid.Value);
            var newRefreshToken = _jwtUtils.GenerateRefreshToken();
            await _externalCustomDataObjectService.SaveRefreshToken(sessionGuid.GetValueOrDefault(), newRefreshToken);

            return new ObjectResult(new { token = newJwtToken, refreshToken = newRefreshToken });
        }
        catch (SecurityTokenException e)
        {
            return new UnauthorizedObjectResult(e.Message);
        }
    }

    private async Task<Guid?> CanSessionAccessToExternalCustomDataObject(int externalCustomDataObjectId, string sessionToken)
    {
        var sessionGuid = _jwtUtils.ValidateToken(sessionToken);

        if (!sessionGuid.HasValue)
        {
            return null;
        }

        var isExists = await _externalCustomDataObjectService.CanSessionAccessToExternalCustomDataObject(externalCustomDataObjectId, sessionGuid);

        return !isExists ? null : sessionGuid;
    }
}