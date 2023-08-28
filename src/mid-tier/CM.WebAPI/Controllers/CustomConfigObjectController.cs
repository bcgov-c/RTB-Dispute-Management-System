using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.CustomConfigObject;
using CM.Business.Services.CustomConfigObject;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
public class CustomConfigObjectController : BaseController
{
    private readonly ICustomConfigObjectService _customConfigObjectService;
    private readonly IMapper _mapper;

    public CustomConfigObjectController(ICustomConfigObjectService customConfigObjectService, IMapper mapper)
    {
        _customConfigObjectService = customConfigObjectService;
        _mapper = mapper;
    }

    [HttpPost("api/customconfigobject")]
    [AuthorizationRequired(new[] { RoleNames.ExtendedAdmin })]
    public async Task<IActionResult> Post([FromBody] CustomConfigObjectPostRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (!string.IsNullOrEmpty(request.ObjectTitle))
        {
            var isDuplicateTitleExists = await _customConfigObjectService.IsDuplicateTitleExists(request.ObjectTitle);
            if (isDuplicateTitleExists)
            {
                return BadRequest(ApiReturnMessages.DuplicatedTitleForCustomConfigObject);
            }
        }

        if (request.ObjectStorageType == (byte)CustomObjectStorageType.Json && string.IsNullOrEmpty(request.ObjectJson))
        {
            return BadRequest(ApiReturnMessages.ObjectJsonRequired);
        }

        if (request.ObjectStorageType == (byte)CustomObjectStorageType.Jsonb && string.IsNullOrEmpty(request.ObjectJsonB))
        {
            return BadRequest(ApiReturnMessages.ObjectJsonBRequired);
        }

        if (request.ObjectStorageType == (byte)CustomObjectStorageType.Text && string.IsNullOrEmpty(request.ObjectText))
        {
            return BadRequest(ApiReturnMessages.ObjectTextRequired);
        }

        var newCustomConfigObject = await _customConfigObjectService.CreateAsync(request);
        EntityIdSetContext(newCustomConfigObject.CustomConfigObjectId);
        return Ok(newCustomConfigObject);
    }

    [HttpPatch("api/customconfigobject/{customConfigObjectId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.ExtendedAdmin })]
    public async Task<IActionResult> Patch(int customConfigObjectId, [FromBody] JsonPatchDocumentExtension<CustomConfigObjectPatchRequest> request)
    {
        if (CheckModified(_customConfigObjectService, customConfigObjectId))
        {
            return StatusConflicted();
        }

        var customConfigObject = await _customConfigObjectService.GetForPatchAsync(customConfigObjectId);
        var customConfigObjectToPatch = _mapper.Map<CustomConfigObjectResponse, CustomConfigObjectPatchRequest>(customConfigObject);
        if (customConfigObjectToPatch != null)
        {
            request.ApplyTo(customConfigObjectToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var objectTitle = request.GetValue<string>("/object_title");
            if (objectTitle.Exists && !string.IsNullOrEmpty(objectTitle.Value))
            {
                var isDuplicateTitleExists = await _customConfigObjectService.IsDuplicateTitleExists(objectTitle.Value);
                if (isDuplicateTitleExists)
                {
                    return BadRequest(ApiReturnMessages.DuplicatedTitleForCustomConfigObject);
                }
            }

            var objectJson = request.GetValue<string>("/object_json");
            if (objectJson.Exists && !string.IsNullOrEmpty(objectJson.Value))
            {
                if (customConfigObject.ObjectStorageType != (byte)CustomObjectStorageType.Json)
                {
                    return BadRequest(ApiReturnMessages.OnlyJsonAccepted);
                }
            }

            var objectJsonB = request.GetValue<string>("/object_jsonb");
            if (objectJsonB.Exists && !string.IsNullOrEmpty(objectJsonB.Value))
            {
                if (customConfigObject.ObjectStorageType != (byte)CustomObjectStorageType.Jsonb)
                {
                    return BadRequest(ApiReturnMessages.OnlyJsonBAccepted);
                }
            }

            var objectText = request.GetValue<string>("/object_text");
            if (objectText.Exists && !string.IsNullOrEmpty(objectText.Value))
            {
                if (customConfigObject.ObjectStorageType != (byte)CustomObjectStorageType.Text)
                {
                    return BadRequest(ApiReturnMessages.OnlyTextAccepted);
                }
            }

            var result = await _customConfigObjectService.PatchAsync(customConfigObjectId, customConfigObjectToPatch);

            if (result != null)
            {
                EntityIdSetContext(customConfigObjectId);
                return Ok(result);
            }
        }

        return NotFound();
    }

    [HttpDelete("api/customconfigobject/{customConfigObjectId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.ExtendedAdmin })]
    public async Task<IActionResult> Delete(int customConfigObjectId)
    {
        if (CheckModified(_customConfigObjectService, customConfigObjectId))
        {
            return StatusConflicted();
        }

        var result = await _customConfigObjectService.DeleteAsync(customConfigObjectId);
        if (result)
        {
            EntityIdSetContext(customConfigObjectId);
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }

    [HttpGet("api/customconfigobject/{customConfigObjectId:int}")]
    [AuthorizationRequired(new[] { RoleNames.ExtendedAdmin })]
    public async Task<IActionResult> Get(int customConfigObjectId)
    {
        var customObject = await _customConfigObjectService.GetCustomObject(customConfigObjectId);
        if (customObject != null)
        {
            return Ok(customObject);
        }

        return NotFound();
    }

    [HttpGet("api/publiccustomconfigobjects/")]
    public async Task<IActionResult> GetPublicCustomObjects([FromQuery] CustomConfigObjectGetRequest request)
    {
        var customConfigObjects = await _customConfigObjectService.GetPublicCustomObjects(request);
        return Ok(customConfigObjects);
    }

    [HttpGet("api/privatecustomconfigobjects/")]
    [AuthorizationRequired(new[] { RoleNames.ExtendedAdmin })]
    public async Task<IActionResult> GetPrivateCustomObjects([FromQuery] CustomConfigObjectGetRequest request)
    {
        var customConfigObjects = await _customConfigObjectService.GetPrivateCustomObjects(request);
        return Ok(customConfigObjects);
    }
}