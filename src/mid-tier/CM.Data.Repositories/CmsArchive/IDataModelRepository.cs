using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.CmsArchive;
using CM.Data.Model;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.CmsArchive;

public interface IDataModelRepository : IRepository<DataModel>
{
    Task<DataModel> GetByFileNumber(string fileNumber, CmsArchiveSearchBase commonFilters);

    Task<DataModel> GetByReferenceNumber(string referenceNumber, CmsArchiveSearchBase commonFilters);

    Task<List<DataModel>> FindByQuery(string queryString, CmsArchiveSearchBase commonFilters);

    Task<int> FindByQueryTotalCount(string queryString, CmsArchiveSearchBase commonFilters);

    Task<List<string>> GetFileNumbers(List<string> requestIds);

    Task<List<DataModel>> GetDataByFileNumbers(List<string> requestIds, CmsArchiveSearchBase commonFilters);

    Task<List<DataModel>> GetRecordsByFileNumber(string fileNumber);

    Task<bool> IsExist(string fileNumber);

    Task<List<string>> GetJoinedRecords(string fileNumber);

    Task<List<DataModel>> GetNoTrackingRecords(string fileNumber);

    Task<DateTime?> GetLastModifiedDate(string fileNumber);

    Task<string> GetParentRecord(string fileNumber);
}