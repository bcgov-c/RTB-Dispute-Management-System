using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.FilePackageService;

public interface IFilePackageServiceRepository : IRepository<Model.FilePackageService>
{
    Task<DateTime?> GetLastModifiedDateAsync(int filePackageServiceId);

    Task<bool> CheckFilePackageServiceExistenceAsync(int filePackageServiceId);

    Task<List<Data.Model.FilePackageService>> GetServicesWithPackages(Guid disputeGuid, bool isServed);
}