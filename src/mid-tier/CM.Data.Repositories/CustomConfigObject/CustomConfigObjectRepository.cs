using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Business.Entities.Models.CustomConfigObject;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.CustomConfigObject;

public class CustomConfigObjectRepository : CmRepository<Model.CustomConfigObject>, ICustomConfigObjectRepository
{
    public CustomConfigObjectRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<DateTime?> GetLastModifiedDate(int customConfigObjectId)
    {
        var dates = await Context.CustomConfigObjects
            .Where(c => c.CustomConfigObjectId == customConfigObjectId)
            .Select(d => d.ModifiedDate)
            .ToListAsync();

        return dates?.FirstOrDefault();
    }

    public async Task<List<Model.CustomConfigObject>> GetPrivateCustomObjects(CustomConfigObjectGetRequest request)
    {
        var predicate = PredicateBuilder.True<Model.CustomConfigObject>();

        predicate = predicate.And(x => x.IsPublic == false);

        if (request.RequestActiveOnly)
        {
            predicate = predicate.And(x => x.IsActive);
        }

        if (request.RequestObjectTypes is { Length: > 0 })
        {
            predicate = predicate.And(x => request.RequestObjectTypes.Contains(x.ObjectType));
        }

        if (request.RequestObjectStatuses is { Length: > 0 })
        {
            predicate = predicate.And(x => request.RequestObjectStatuses.Contains(x.ObjectStatus));
        }

        if (request.RequestObjectStorageTypes is { Length: > 0 })
        {
            predicate = predicate.And(x => request.RequestObjectStorageTypes.Contains(x.ObjectStorageType));
        }

        var customConfigObjects = await Context.CustomConfigObjects
            .Where(predicate)
            .ToListAsync();

        return customConfigObjects;
    }

    public async Task<List<Model.CustomConfigObject>> GetPublicCustomObjects(CustomConfigObjectGetRequest request)
    {
        var predicate = PredicateBuilder.True<Model.CustomConfigObject>();

        predicate = predicate.And(x => x.IsPublic);

        if (request.RequestActiveOnly)
        {
            predicate = predicate.And(x => x.IsActive);
        }

        if (request.RequestObjectTypes is { Length: > 0 })
        {
            predicate = predicate.And(x => request.RequestObjectTypes.Contains(x.ObjectType));
        }

        if (request.RequestObjectStatuses is { Length: > 0 })
        {
            predicate = predicate.And(x => request.RequestObjectStatuses.Contains(x.ObjectStatus));
        }

        if (request.RequestObjectStorageTypes is { Length: > 0 })
        {
            predicate = predicate.And(x => request.RequestObjectStorageTypes.Contains(x.ObjectStorageType));
        }

        var customConfigObjects = await Context.CustomConfigObjects
            .Where(predicate)
            .ToListAsync();

        return customConfigObjects;
    }

    public async Task<bool> IsDuplicateTitleExists(string objectTitle)
    {
        var isExists = await Context.CustomConfigObjects.AnyAsync(x => x.ObjectTitle == objectTitle);
        return isExists;
    }
}