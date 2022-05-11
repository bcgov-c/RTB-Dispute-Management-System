using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.Files;

public class FileRepository : CmRepository<File>, IFileRepository
{
    public FileRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<List<File>> GetDisputeFiles(Guid disputeGuid)
    {
        var files = await Context.Files
            .Where(f => f.DisputeGuid == disputeGuid)
            .ToListAsync();

        return files;
    }

    public async Task<bool> CheckAddedByExistence(int fileId, int addedBy)
    {
        var file = await Context.Files.AsNoTracking().SingleOrDefaultAsync(x => x.FileId.Equals(fileId));
        var disputeGuid = file.DisputeGuid;
        var res = await Context.Participants.AnyAsync(x => x.DisputeGuid.Equals(disputeGuid) && x.ParticipantId.Equals(addedBy));

        return res;
    }

    public async Task<File> GetFile(int? fileId)
    {
        if (fileId == null)
        {
            return null;
        }

        var file = await Context.Files.FindAsync(fileId);

        return file;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(int fileId)
    {
        var dates = await Context.Files
            .Where(p => p.FileId == fileId)
            .Select(d => d.ModifiedDate)
            .ToListAsync();

        return dates?.FirstOrDefault();
    }

    public async Task<List<File>> GetFilesByCreatedDate(DateTime startDate, DateTime endDate)
    {
        var files = await Context.Files.Where(x => x.CreatedDate >= startDate && x.CreatedDate <= endDate).ToListAsync();
        return files;
    }

    public async Task<List<File>> GetEvidenceFilesByCreatedDate(DateTime startDate, DateTime endDate, List<File> files)
    {
        if (files is { Count: > 0 })
        {
            var evidenceFiles = await Context.LinkedFiles
                .Include(fd => fd.FileDescription)
                .AsEnumerable()
                .Where(x => files.Any(f => f.FileId == x.FileId)
                            && (x.FileDescription.DescriptionCategory == (byte)FileDescriptionCategories.OtherEvidenceNotAssociatedToClaims
                                || x.FileDescription.DescriptionCategory == (byte)FileDescriptionCategories.OtherEvidenceAssociatedToClaims
                                || x.FileDescription.DescriptionCategory == (byte)FileDescriptionCategories.Nine
                                || x.FileDescription.DescriptionCode == (byte)FileDescriptionCodes.MonetaryOrderWorksheet
                                || x.FileDescription.DescriptionCode == (byte)FileDescriptionCodes.TenancyAgreement))
                .Select(x => x.File)
                .ToListAsync();

            return evidenceFiles;
        }

        return new List<File>();
    }

    public async Task<List<File>> GetActiveFiles()
    {
        var files = await Context
            .Files
            .Include(x => x.Dispute)
            .Include(x => x.Dispute.DisputeStatuses)
            .Where(x => x.Dispute.DisputeStatuses.Any(ds => ds.IsActive)).ToListAsync();

        return files;
    }
}