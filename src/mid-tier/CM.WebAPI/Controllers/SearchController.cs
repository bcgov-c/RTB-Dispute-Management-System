using System.Threading.Tasks;
using CM.Business.Entities.Models.Search;
using CM.Business.Services.Search;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using CM.WebAPI.WebApiHelpers;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api/search")]
public class SearchController : Controller
{
    private readonly ISearchService _searchService;

    public SearchController(ISearchService searchService)
    {
        _searchService = searchService;
    }

    [AuthorizationRequired(new[] { RoleNames.Admin })]
    [HttpGet("disputefilenumber")]
    public async Task<IActionResult> SearchByFileNumber(FileNumberSearchRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var searchResult = await _searchService.GetByFileNumber(request);
        return Ok(searchResult);
    }

    [AuthorizationRequired(new[] { RoleNames.Admin })]
    [HttpGet("disputeinfo")]
    public async Task<IActionResult> SearchByDisputeInfo(DisputeInfoSearchRequest request, int count, int index)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var searchResult = await _searchService.GetByDisputeInfo(request, count, index);
        return Ok(searchResult);
    }

    [AuthorizationRequired(new[] { RoleNames.Admin })]
    [HttpGet("accesscode")]
    public async Task<IActionResult> SearchByAccessCode(AccessCodeSearchRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var searchResult = await _searchService.GetByAccessCode(request);
        return Ok(searchResult);
    }

    [AuthorizationRequired(new[] { RoleNames.Admin })]
    [HttpGet("participants")]
    public async Task<IActionResult> SearchByParticipant(ParticipantSearchRequest request, int count, int index)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var searchResult = await _searchService.GetByParticipant(request, count, index);
        if (searchResult != null)
        {
            return Ok(searchResult);
        }

        return Ok();
    }

    [AuthorizationRequired(new[] { RoleNames.Admin })]
    [HttpGet("disputestatus")]
    public async Task<IActionResult> SearchByDisputeStatus(DisputeStatusSearchRequest request, int count, int index)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var searchResult = await _searchService.GetByDisputeStatus(request, count, index);
        if (searchResult != null)
        {
            return Ok(searchResult);
        }

        return Ok();
    }

    [AuthorizationRequired(new[] { RoleNames.Admin })]
    [HttpGet("hearing")]
    public async Task<IActionResult> SearchByHearing(HearingSearchRequest request, int count, int index)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var searchResult = await _searchService.GetByHearing(request, count, index);
        if (searchResult != null)
        {
            return Ok(searchResult);
        }

        return Ok();
    }

    [AuthorizationRequired(new[] { RoleNames.Admin })]
    [HttpGet("crossapplication")]
    public async Task<IActionResult> SearchByCrossApp(CrossApplicationSearchRequest request, int count, int index)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var searchResult = await _searchService.GetByCrossApplication(request, count, index);
        if (searchResult != null)
        {
            return Ok(searchResult);
        }

        return Ok();
    }

    [AuthorizationRequired(new[] { RoleNames.Admin })]
    [HttpGet("claims")]
    public async Task<IActionResult> SearchByClaims(ClaimsSearchRequest request, int count, int index)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (request.ClaimCodes.Length < 1)
        {
            return BadRequest(ApiReturnMessages.IncorrectClaimCode);
        }

        var searchResult = await _searchService.GetByClaims(request, count, index);
        if (searchResult != null)
        {
            return Ok(searchResult);
        }

        return Ok();
    }

    [HttpGet("filenumbervalidation/{filenumber:int}")]
    public async Task<IActionResult> ValidateFileNumber(int filenumber)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (filenumber.ToString().Length != 8 && filenumber.ToString().Length != 9)
        {
            return BadRequest(ApiReturnMessages.InvalidFilenumberCount);
        }

        var token = Request.GetToken();
        var result = await _searchService.ValidateFileNumber(filenumber, token);
        return Ok(result);
    }

    [AuthorizationRequired(new[] { RoleNames.Admin })]
    [HttpGet("disputemessageowners")]
    public async Task<IActionResult> SearchDisputeMessageOwners(DisputeMessageOwnerSearchRequest request, int count, int index)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (request.CreatedBy == null)
        {
            return BadRequest(ApiReturnMessages.CreatedByRequired);
        }

        var isValidCreatedBy = await _searchService.ValidateCreatedBy(request.CreatedBy);
        if (isValidCreatedBy != -1)
        {
            return BadRequest(string.Format(ApiReturnMessages.UserNotAdmin, isValidCreatedBy));
        }

        var searchResult = await _searchService.GetDisputeMessageOwners(request, count, index);
        if (searchResult != null)
        {
            return Ok(searchResult);
        }

        return Ok();
    }

    [AuthorizationRequired(new[] { RoleNames.Admin })]
    [HttpGet("disputestatusowners")]
    public async Task<IActionResult> SearchDisputeStatusOwners(DisputeStatusOwnerSearchRequest request, int count, int index)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (request.OwnedBy == null)
        {
            return BadRequest(ApiReturnMessages.OwnedByRequired);
        }
        else
        {
            var isValidOwnedBy = await _searchService.ValidateCreatedBy(request.OwnedBy);
            if (isValidOwnedBy != -1)
            {
                return BadRequest(string.Format(ApiReturnMessages.UserNotAdmin, isValidOwnedBy));
            }
        }

        var searchResult = await _searchService.GetDisputeStatusOwners(request, count, index);
        if (searchResult != null)
        {
            return Ok(searchResult);
        }

        return Ok();
    }

    [AuthorizationRequired(new[] { RoleNames.Admin })]
    [HttpGet("disputenoteowners")]
    public async Task<IActionResult> SearchDisputeNoteOwners(DisputeNoteOwnerSearchRequest request, int count, int index)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (request.OwnedBy == null)
        {
            return BadRequest(ApiReturnMessages.OwnedByRequired);
        }
        else
        {
            var isValidOwnedBy = await _searchService.ValidateCreatedBy(request.OwnedBy);
            if (isValidOwnedBy != -1)
            {
                return BadRequest(string.Format(ApiReturnMessages.UserNotAdmin, isValidOwnedBy));
            }
        }

        var searchResult = await _searchService.GetDisputeNoteOwners(request, count, index);
        if (searchResult != null)
        {
            return Ok(searchResult);
        }

        return NotFound();
    }

    [AuthorizationRequired(new[] { RoleNames.Admin })]
    [HttpGet("disputedocumentowners")]
    public async Task<IActionResult> SearchDisputeDocumentOwners(DisputeDocumentOwnerSearchRequest request, int count, int index)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (request.OwnedBy == null)
        {
            return BadRequest(ApiReturnMessages.OwnedByRequired);
        }
        else
        {
            var isValidOwnedBy = await _searchService.ValidateCreatedBy(request.OwnedBy);
            if (isValidOwnedBy != -1)
            {
                return BadRequest(string.Format(ApiReturnMessages.UserNotAdmin, isValidOwnedBy));
            }
        }

        var searchResult = await _searchService.GetDisputeDocumentOwners(request, count, index);
        if (searchResult != null)
        {
            return Ok(searchResult);
        }

        return Ok();
    }
}