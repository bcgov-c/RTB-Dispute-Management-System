using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.Files;

public class FileDescriptionRepository : CmRepository<FileDescription>, IFileDescriptionRepository
{
    public FileDescriptionRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<List<FileDescription>> GetDisputeFileDescriptionsAsync(Guid disputeGuid)
    {
        var fileDescriptions = await Context.FileDescriptions
            .Where(f => f.DisputeGuid == disputeGuid)
            .ToListAsync();

        return fileDescriptions;
    }

    public async Task<List<FileDescription>> GetFileDescriptionsForEmailAsync(Guid disputeGuid)
    {
        var fileDescriptions = await Context.FileDescriptions
            .Where(f => f.DisputeGuid == disputeGuid &&
                        (f.FileMethod == (byte)FileMethod.UploadLater ||
                         f.FileMethod == (byte)FileMethod.Method103 ||
                         f.FileMethod == (byte)FileMethod.DropOf))
            .ToListAsync();

        return fileDescriptions;
    }

    public async Task<List<FileDescription>> GetDisputeUnlinkedFileDescriptionsAsync(Guid disputeGuid)
    {
        var fileDescriptions = await Context.FileDescriptions
            .Where(f => f.DisputeGuid == disputeGuid)
            .ToListAsync();
        return fileDescriptions;
    }

    public async Task<int> GetFileDescriptionsCountAsync(Guid disputeGuid)
    {
        var count = await Context.FileDescriptions.CountAsync(f => f.DisputeGuid == disputeGuid);
        return count;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(int fileDescriptionId)
    {
        var dates = await Context.FileDescriptions
            .Where(p => p.FileDescriptionId == fileDescriptionId)
            .Select(d => d.ModifiedDate)
            .ToListAsync();

        return dates?.FirstOrDefault();
    }

    public async Task<FileDescription> GetFileDescription(Guid disputeGuid, int? fileDescriptionId)
    {
        var fileDescription = await Context.FileDescriptions
            .FirstOrDefaultAsync(f => f.DisputeGuid == disputeGuid && f.FileDescriptionId == fileDescriptionId);
        return fileDescription;
    }
}