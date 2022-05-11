using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.SubstitutedService;

public class SubstitutedServiceRepository : CmRepository<Model.SubstitutedService>, ISubstitutedServiceRepository
{
    public SubstitutedServiceRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<DateTime?> GetLastModifiedDate(int id)
    {
        var dates = await Context.SubstitutedServices
            .Where(n => n.SubstitutedServiceId == id)
            .Select(n => n.ModifiedDate)
            .ToListAsync();

        return dates?.FirstOrDefault();
    }

    public async Task<List<Model.SubstitutedService>> GetSubmittedSubServices(DateTime utcStart, DateTime utcEnd)
    {
        var submittedSubServices = await Context
            .SubstitutedServices
            .Where(x => (x.RequestSource == 1 || x.RequestSource == 2)
                        && x.CreatedDate >= utcStart && x.CreatedDate < utcEnd)
            .ToListAsync();

        return submittedSubServices;
    }
}