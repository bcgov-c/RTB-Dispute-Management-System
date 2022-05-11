using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.ExternalCustomDataObject;

public interface IExternalCustomDataObjectRepository : IRepository<Model.ExternalCustomDataObject>
{
    Task<DateTime?> GetLastModifiedDate(int customObjectId);

    Task<List<Model.ExternalCustomDataObject>> GetByPredicate(
        Expression<Func<Model.ExternalCustomDataObject, bool>> expression, int count, int index, CustomObjectSortField sortBy);

    Task<Model.ExternalCustomDataObject> GetBySessionGuidAsync(Guid? sessionGuid);

    Task<Model.ExternalCustomDataObject> GetBySessionGuidAsync(Guid? sessionGuid, int externalCustomDataObjectId);

    Task<int> GetByPredicateTotalCount(Expression<Func<Model.ExternalCustomDataObject, bool>> predicate);
}