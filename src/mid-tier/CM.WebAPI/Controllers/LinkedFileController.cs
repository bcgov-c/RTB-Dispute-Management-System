using System;
using System.Threading.Tasks;
using CM.Business.Entities.Models.Files;
using CM.Business.Services.Files;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api/linkfile")]
public class LinkedFileController : BaseController
{
    private readonly ILinkedFileService _linkFileService;

    public LinkedFileController(ILinkedFileService linkFileService)
    {
        _linkFileService = linkFileService;
    }

    [HttpPost("{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser, RoleNames.ExtendedAccessCode, RoleNames.OfficePay })]
    public async Task<IActionResult> Post(Guid disputeGuid, [FromBody]LinkedFileRequest linkFile)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        DisputeSetContext(disputeGuid);
        var newLinkFile = await _linkFileService.CreateAsync(disputeGuid, linkFile);
        EntityIdSetContext(newLinkFile.LinkedFileId);
        return Ok(newLinkFile);
    }

    [HttpDelete("{linkFileId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser })]
    public async Task<IActionResult> Delete(int linkFileId)
    {
        if (CheckModified(_linkFileService, linkFileId))
        {
            return StatusConflicted();
        }

        await DisputeResolveAndSetContext(_linkFileService, linkFileId);
        var result = await _linkFileService.DeleteAsync(linkFileId);
        if (result)
        {
            EntityIdSetContext(linkFileId);
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }

    [HttpGet("/api/disputelinkfiles/{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser })]
    public async Task<IActionResult> GetDisputeLinkFiles(Guid disputeGuid, int count, int index)
    {
        var linkFileList = await _linkFileService.GetByDisputeAsync(disputeGuid, count, index);
        return Ok(linkFileList);
    }
}