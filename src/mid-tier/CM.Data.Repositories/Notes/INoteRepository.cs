using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.Notes;

public interface INoteRepository : IRepository<Note>
{
    Task<DateTime?> GetLastModifiedDate(int noteId);

    Task<List<Note>> GetManyAsync(Guid disputeGuid, byte? noteLinkedTo, int index, int count);
}