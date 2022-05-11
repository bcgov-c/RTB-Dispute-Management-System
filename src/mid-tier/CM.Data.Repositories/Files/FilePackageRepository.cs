using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.Files;

public class FilePackageRepository : CmRepository<FilePackage>, IFilePackageRepository
{
    public FilePackageRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<bool> CheckFilePackageExistenceAsync(int id)
    {
        var res = await Context.FilePackages.AnyAsync(c => c.FilePackageId == id);

        return res;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var filePackage = await Context.FilePackages.FindAsync(id);
        if (filePackage != null)
        {
            filePackage.IsDeleted = true;
            Context.FilePackages.Attach(filePackage);
            Context.Entry(filePackage).State = EntityState.Modified;
            return true;
        }

        return false;
    }

    public async Task<List<FilePackage>> GetDisputeFilePackagesAsync(Guid disputeGuid, int count, int index)
    {
        var filePackages = await Context.FilePackages
            .Where(c => c.DisputeGuid == disputeGuid)
            .Include(fp => fp.FilePackageServices)
            .ApplyPaging(count, index)
            .ToListAsync();

        return filePackages;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(int filePackageId)
    {
        var dates = await Context.FilePackages
            .Where(p => p.FilePackageId == filePackageId)
            .Select(d => d.ModifiedDate)
            .ToListAsync();

        return dates?.FirstOrDefault();
    }

    public async Task<List<FilePackage>> GetParticipantFilePackages(int participantId, Guid disputeGuid)
    {
        var claimGroupParticipant = await Context.ClaimGroupParticipants.FirstOrDefaultAsync(x => x.ParticipantId == participantId);
        var claimGroupParticipants = await Context.ClaimGroupParticipants
            .Where(x => x.DisputeGuid == disputeGuid && x.GroupParticipantRole != claimGroupParticipant.GroupParticipantRole)
            .ToListAsync();
        var partyIds = claimGroupParticipants.Select(x => x.ParticipantId).ToList();

        var filePackages = await Context.FilePackages
            .Where(x => x.DisputeGuid == disputeGuid && partyIds.Contains(x.CreatedById.Value)).ToListAsync();

        return filePackages;
    }
}