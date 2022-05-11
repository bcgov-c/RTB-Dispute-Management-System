using System.Threading.Tasks;
using CM.Business.Entities.Models.AutoText;
using CM.Business.Services.AutoText;
using CM.Business.Services.UserServices;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using CM.WebAPI.WebApiHelpers;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Route("api/autotext")]
[Produces(Application.Json)]
[AuthorizationRequired(new[] { RoleNames.Admin })]
public class AutoTextController : BaseController
{
    private readonly IAutoTextService _autoTextService;
    private readonly IUserService _userService;

    public AutoTextController(IAutoTextService autoTextService, IUserService userService)
    {
        _autoTextService = autoTextService;
        _userService = userService;
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody]AutoTextPostRequest autoText)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (autoText.TextOwner != null)
        {
            var owner = await _userService.GetSystemUser((int)autoText.TextOwner);
            if (owner == null)
            {
                return BadRequest(string.Format(ApiReturnMessages.UserDoesNotExist, autoText.TextOwner));
            }
        }

        var result = await _autoTextService.CreateAsync(autoText);
        EntityIdSetContext(result.AutoTextId);
        return Ok(result);
    }

    [HttpDelete("{autoTextId:int}")]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> Delete(int autoTextId)
    {
        if (CheckModified(_autoTextService, autoTextId))
        {
            return StatusConflicted();
        }

        var result = await _autoTextService.DeleteAsync(autoTextId);
        if (result)
        {
            EntityIdSetContext(autoTextId);
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }

    [HttpPatch("{autoTextId:int}")]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> Patch(int autoTextId, [FromBody]JsonPatchDocumentExtension<AutoTextPatchRequest> autoText)
    {
        if (CheckModified(_autoTextService, autoText))
        {
            return StatusConflicted();
        }

        var autoTextToPatch = await _autoTextService.GetForPatchAsync(autoTextId);
        if (autoTextToPatch != null)
        {
            autoText.ApplyTo(autoTextToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _autoTextService.PatchAsync(autoTextId, autoTextToPatch);

            if (result != null)
            {
                EntityIdSetContext(autoTextId);
                return Ok(result);
            }
        }

        return NotFound();
    }

    [HttpGet("{autoTextId:int}")]
    public async Task<IActionResult> GetById(int autoTextId)
    {
        var autoText = await _autoTextService.GetByIdAsync(autoTextId);
        if (autoText != null)
        {
            return Ok(autoText);
        }

        return NotFound();
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(AutoTextGetRequest request)
    {
        var autoTexts = await _autoTextService.GetAllAsync(request);
        if (autoTexts != null)
        {
            return Ok(autoTexts);
        }

        return NotFound();
    }
}