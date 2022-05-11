using System;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.CustomDataObject;

public interface ICustomDataObjectRepository : IRepository<Model.CustomDataObject>
{
    Task<Model.CustomDataObject> GetCustomDataObjectByGuid(Guid disputeGuid, CustomObjectType objectType);

    Task<DateTime?> GetLastModifiedDate(int customObjectId);

    Task<Model.CustomDataObject> GetPreviousRecord(int customObjectId);
}