using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.CustomConfigObject;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.CustomConfigObject;

public interface ICustomConfigObjectRepository : IRepository<Model.CustomConfigObject>
{
    Task<DateTime?> GetLastModifiedDate(int customObjectId);

    Task<List<Data.Model.CustomConfigObject>> GetPublicCustomObjects(CustomConfigObjectGetRequest request);

    Task<List<Data.Model.CustomConfigObject>> GetPrivateCustomObjects(CustomConfigObjectGetRequest request);

    Task<bool> IsDuplicateTitleExists(string objectTitle);
}