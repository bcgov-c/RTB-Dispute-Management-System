using System;
using System.Threading.Tasks;
using CM.Business.Entities.Models.CustomDataObject;
using CM.Business.Services.CustomDataObject;
using CM.Business.Services.DisputeServices;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using CM.WebAPI.WebApiHelpers;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
public class CustomDataObjectController : BaseController
{
    private readonly ICustomDataObjectService _customDataObjectService;

    private readonly IDisputeService _disputeService;

    public CustomDataObjectController(ICustomDataObjectService customDataObjectService, IDisputeService disputeService)
    {
        _customDataObjectService = customDataObjectService;
        _disputeService = disputeService;
    }

    [HttpPost("api/customobject/{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser, RoleNames.ExtendedAccessCode, RoleNames.OfficePay })]
    public async Task<IActionResult> Post(Guid disputeGuid, [FromBody] CustomDataObjectRequest customDataObjectRequest)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var isExists = await _disputeService.DisputeExistsAsync(disputeGuid);
        if (!isExists)
        {
            return BadRequest(string.Format(ApiReturnMessages.DisputeDoesNotExist, disputeGuid));
        }

        DisputeSetContext(disputeGuid);
        var newCustomDataObject = await _customDataObjectService.CreateAsync(disputeGuid, customDataObjectRequest);
        EntityIdSetContext(newCustomDataObject.CustomDataObjectId);
        return Ok(newCustomDataObject);
    }

    [HttpPatch("api/customobject/{customObjectId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser, RoleNames.ExtendedAccessCode, RoleNames.OfficePay })]
    public async Task<IActionResult> Patch(int customObjectId, [FromBody]JsonPatchDocumentExtension<CustomObjectPatchRequest> customObjectRequest)
    {
        if (CheckModified(_customDataObjectService, customObjectId))
        {
            return StatusConflicted();
        }

        var customObjectIsActive = await _customDataObjectService.IsActiveCustomObject(customObjectId);
        if (!customObjectIsActive)
        {
            return BadRequest(ApiReturnMessages.CustomObjectIsNotActive);
        }

        var customObjectToPatch = await _customDataObjectService.GetForPatchAsync(customObjectId);
        if (customObjectToPatch != null)
        {
            try
            {
                customObjectRequest.ApplyTo(customObjectToPatch);
            }
            catch (Exception)
            {
                return null;
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            await DisputeResolveAndSetContext(_customDataObjectService, customObjectId);
            var result = await _customDataObjectService.PatchAsync(customObjectId, customObjectToPatch);

            if (result != null)
            {
                EntityIdSetContext(customObjectId);
                return Ok(result);
            }
        }

        return NotFound();
    }

    [HttpDelete("api/customobject/{customObjectId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser, RoleNames.ExtendedAccessCode, RoleNames.OfficePay })]
    public async Task<IActionResult> Delete(int customObjectId)
    {
        if (CheckModified(_customDataObjectService, customObjectId))
        {
            return StatusConflicted();
        }

        await DisputeResolveAndSetContext(_customDataObjectService, customObjectId);
        var result = await _customDataObjectService.DeleteAsync(customObjectId);
        if (result)
        {
            EntityIdSetContext(customObjectId);
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }

    [HttpGet("api/customobject/{customObjectId:int}")]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser, RoleNames.ExtendedAccessCode, RoleNames.OfficePay })]
    public async Task<IActionResult> Get(int customObjectId)
    {
        var customObject = await _customDataObjectService.GetCustomObject(customObjectId);
        if (customObject != null)
        {
            return Ok(customObject);
        }

        return NotFound();
    }

    [HttpGet("api/customobjects/{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser, RoleNames.ExtendedAccessCode, RoleNames.OfficePay })]
    public async Task<IActionResult> GetAllByDispute(Guid disputeGuid, [FromQuery]CustomObjectGetRequest request)
    {
        var customObjects = await _customDataObjectService.GetCustomObjects(disputeGuid, request);
        return Ok(customObjects);
    }
}