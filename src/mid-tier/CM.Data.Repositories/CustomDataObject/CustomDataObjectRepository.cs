using System;
using System.Linq;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.CustomDataObject;

public class CustomDataObjectRepository : CmRepository<Model.CustomDataObject>, ICustomDataObjectRepository
{
    public CustomDataObjectRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<Model.CustomDataObject> GetCustomDataObjectByGuid(Guid disputeGuid, CustomObjectType objectType)
    {
        var customDataObject = await Context.CustomDataObjects.FirstOrDefaultAsync(x => x.DisputeGuid == disputeGuid && x.IsActive == true && x.ObjectType == objectType);
        return customDataObject;
    }

    public async Task<DateTime?> GetLastModifiedDate(int customObjectId)
    {
        var dates = await Context.CustomDataObjects
            .Where(c => c.CustomDataObjectId == customObjectId)
            .Select(d => d.ModifiedDate)
            .ToListAsync();

        return dates?.FirstOrDefault();
    }

    public async Task<Model.CustomDataObject> GetPreviousRecord(int customObjectId)
    {
        var customObject = await Context.CustomDataObjects
            .Where(x => x.CustomDataObjectId < customObjectId)
            .OrderByDescending(x => x.CustomDataObjectId)
            .FirstOrDefaultAsync();

        return customObject;
    }
}