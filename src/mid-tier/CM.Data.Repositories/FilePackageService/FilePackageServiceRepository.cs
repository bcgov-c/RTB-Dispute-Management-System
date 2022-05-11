using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.FilePackageService;

public class FilePackageServiceRepository : CmRepository<Model.FilePackageService>, IFilePackageServiceRepository
{
    public FilePackageServiceRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<bool> CheckFilePackageServiceExistenceAsync(int filePackageServiceId)
    {
        var res = await Context.FilePackageServices.AnyAsync(c => c.FilePackageServiceId == filePackageServiceId);

        return res;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(int filePackageServiceId)
    {
        var dates = await Context.FilePackageServices
            .Where(p => p.FilePackageServiceId == filePackageServiceId)
            .Select(d => d.ModifiedDate)
            .ToListAsync();

        return dates?.FirstOrDefault();
    }

    public async Task<List<Model.FilePackageService>> GetServicesWithPackages(Guid disputeGuid, bool isServed)
    {
        var filePackageServices = await Context
            .FilePackageServices
            .Where(x => x.FilePackage.DisputeGuid == disputeGuid && x.IsServed == isServed)
            .ToListAsync();

        return filePackageServices;
    }

    public async Task<bool> DeleteAsync(int filePackageServiceId)
    {
        var filePackageService = await Context.FilePackageServices.FindAsync(filePackageServiceId);
        if (filePackageService != null)
        {
            filePackageService.IsDeleted = true;
            Context.FilePackageServices.Attach(filePackageService);
            Context.Entry(filePackageService).State = EntityState.Modified;
            return true;
        }

        return false;
    }
}