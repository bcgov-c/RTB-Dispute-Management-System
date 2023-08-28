using System;
using System.Threading.Tasks;
using CM.Business.Entities.Models.Note;
using CM.Business.Services.Notes;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api/note")]
[AuthorizationRequired(new[] { RoleNames.Admin })]
public class NoteController : BaseController
{
    private readonly INoteService _noteService;

    public NoteController(INoteService noteService)
    {
        _noteService = noteService;
    }

    [HttpPost("{disputeGuid:Guid}")]
    public async Task<IActionResult> Post(Guid disputeGuid, [FromBody]NotePostRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (request.NoteLinkId.HasValue)
        {
            var isLinkedObjectExists = await _noteService.CheckLinkedObjectExistence(request.NoteLinkedTo.ToEnum<NoteLinkedTo>(), request.NoteLinkId.Value);

            if (!isLinkedObjectExists)
            {
                return BadRequest(string.Format(ApiReturnMessages.LinkedObjectNotExistsOrInactive, _noteService.GetLinkedObjectName(request.NoteLinkedTo.ToEnum<NoteLinkedTo>()), request.NoteLinkId.Value));
            }
        }

        DisputeSetContext(disputeGuid);
        var newNotice = await _noteService.CreateAsync(disputeGuid, request);
        EntityIdSetContext(newNotice.NoteId);
        return Ok(newNotice);
    }

    [HttpPatch("{noteId:int}")]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> Patch(int noteId, [FromBody]JsonPatchDocumentExtension<NotePatchRequest> note)
    {
        if (CheckModified(_noteService, noteId))
        {
            return StatusConflicted();
        }

        var noteToPatch = await _noteService.GetForPatchAsync(noteId);
        if (noteToPatch != null)
        {
            note.ApplyTo(noteToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            await DisputeResolveAndSetContext(_noteService, noteId);
            var result = await _noteService.PatchAsync(noteId, noteToPatch);

            if (result != null)
            {
                EntityIdSetContext(noteId);
                return Ok(result);
            }
        }

        return NotFound();
    }

    [HttpDelete("{noteId:int}")]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> Delete(int noteId)
    {
        if (CheckModified(_noteService, noteId))
        {
            return StatusConflicted();
        }

        await DisputeResolveAndSetContext(_noteService, noteId);
        var result = await _noteService.DeleteAsync(noteId);
        if (result)
        {
            EntityIdSetContext(noteId);
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }

    [HttpGet("{noteId:int}")]
    public async Task<IActionResult> GetById(int noteId)
    {
        var notice = await _noteService.GetByIdAsync(noteId);
        if (notice != null)
        {
            return Ok(notice);
        }

        return NotFound();
    }

    [HttpGet("/api/disputenotes/{disputeGuid:Guid}")]
    public async Task<IActionResult> GetByDisputeGuid(Guid disputeGuid, byte? noteLinkedTo, int index, int count)
    {
        var notes = await _noteService.GetByDisputeGuidAsync(disputeGuid, noteLinkedTo, index, count);
        if (notes != null)
        {
            return Ok(notes);
        }

        return NotFound();
    }
}