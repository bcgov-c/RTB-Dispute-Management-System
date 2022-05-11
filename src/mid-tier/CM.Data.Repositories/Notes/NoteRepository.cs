using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.Notes;

public class NoteRepository : CmRepository<Note>, INoteRepository
{
    public NoteRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<DateTime?> GetLastModifiedDate(int noteId)
    {
        var dates = await Context.Notes
            .Where(n => n.NoteId == noteId)
            .Select(n => n.ModifiedDate)
            .ToListAsync();

        return dates?.FirstOrDefault();
    }

    public async Task<List<Note>> GetManyAsync(Guid disputeGuid, byte? noteLinkedTo, int index, int count)
    {
        var notes = await Context.Notes
            .Where(n => n.DisputeGuid == disputeGuid)
            .Where(x => !noteLinkedTo.HasValue || x.NoteLinkedTo.Equals(noteLinkedTo))
            .ApplyPaging(count, index)
            .ToListAsync();

        return notes;
    }

    public Task<Note> GetDisputeNotes(Guid disputeGuid)
    {
        throw new NotImplementedException();
    }
}