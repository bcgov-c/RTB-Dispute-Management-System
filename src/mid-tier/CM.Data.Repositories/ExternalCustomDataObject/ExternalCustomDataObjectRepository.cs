using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.ExternalCustomDataObject;

public class ExternalCustomDataObjectRepository : CmRepository<Model.ExternalCustomDataObject>,
    IExternalCustomDataObjectRepository
{
    public ExternalCustomDataObjectRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<DateTime?> GetLastModifiedDate(int externalCustomObjectId)
    {
        var dates = await Context.ExternalCustomDataObjects
            .Where(c => c.ExternalCustomDataObjectId == externalCustomObjectId)
            .Select(d => d.ModifiedDate)
            .ToListAsync();

        return dates.FirstOrDefault();
    }

    public async Task<List<Model.ExternalCustomDataObject>> GetByPredicate(Expression<Func<Model.ExternalCustomDataObject, bool>> expression, int count, int index, CustomObjectSortField sortBy)
    {
        var externalCustomDataObjects = Context
            .ExternalCustomDataObjects
            .Where(expression);

        externalCustomDataObjects = sortBy switch
        {
            CustomObjectSortField.CreatedNewestFirst => externalCustomDataObjects.OrderByDescending(x => x.CreatedDate),
            CustomObjectSortField.CreatedOldestFirst => externalCustomDataObjects.OrderBy(x => x.CreatedDate),
            CustomObjectSortField.ModifiedNewestFirst => externalCustomDataObjects.OrderByDescending(x => x.ModifiedDate),
            CustomObjectSortField.ModifiedOldestFirst => externalCustomDataObjects.OrderBy(x => x.ModifiedDate),
            _ => externalCustomDataObjects.OrderByDescending(x => x.ModifiedDate)
        };

        externalCustomDataObjects = externalCustomDataObjects
            .ApplyPaging(count, index);

        return await externalCustomDataObjects.ToListAsync();
    }

    public async Task<int> GetByPredicateTotalCount(Expression<Func<Model.ExternalCustomDataObject, bool>> expression)
    {
        var totalCount = await Context.ExternalCustomDataObjects
            .CountAsync(expression);

        return totalCount;
    }

    public async Task<Model.ExternalCustomDataObject> GetBySessionGuidAsync(Guid? sessionGuid)
    {
        return await Context.ExternalCustomDataObjects.SingleOrDefaultAsync(c => c.SessionGuid == sessionGuid);
    }

    public async Task<Model.ExternalCustomDataObject> GetBySessionGuidAsync(Guid? sessionGuid, int externalCustomDataObjectId)
    {
        return await Context
            .ExternalCustomDataObjects
            .SingleOrDefaultAsync(c => c.SessionGuid == sessionGuid && c.ExternalCustomDataObjectId == externalCustomDataObjectId);
    }
}