using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Business.Entities.Models.CmsArchive;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using CM.Data.Repositories.CmsArchive.Helper;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.CmsArchive;

public class DataModelRepository : CmRepository<DataModel>, IDataModelRepository
{
    public DataModelRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<DataModel> GetByFileNumber(string fileNumber, CmsArchiveSearchBase commonFilters)
    {
        var entity = await Context.CMSData
            .Where(e => e.Searchable_Record == 1 && e.File_Number == fileNumber)
            .OrderByDescending(x => x.ETL_DataRow_ID)
            .FirstOrDefaultAsync();

        var result = CmsSearchHelper.ApplyCommonFiltersOnData(entity, commonFilters);
        return result;
    }

    public async Task<DataModel> GetByReferenceNumber(string referenceNumber, CmsArchiveSearchBase commonFilters)
    {
        var entity = await Context.CMSData
            .Where(e => e.Searchable_Record == 1 && e.Reference_Number.Equals(referenceNumber))
            .OrderByDescending(x => x.ETL_DataRow_ID)
            .FirstOrDefaultAsync();

        var result = CmsSearchHelper.ApplyCommonFiltersOnData(entity, commonFilters);
        return result;
    }

    public async Task<List<DataModel>> FindByQuery(string queryString, CmsArchiveSearchBase commonFilters)
    {
        var result = await Context.CMSData.FromSqlRaw(queryString).ToListAsync();
        var searchResults = await CmsSearchHelper.ApplyCommonFilters(result, commonFilters).ToListAsync();
        return searchResults;
    }

    public async Task<int> FindByQueryTotalCount(string queryString, CmsArchiveSearchBase commonFilters)
    {
        var result = await Context.CMSData.FromSqlRaw(queryString).ToListAsync();
        var searchResults = await CmsSearchHelper.ApplyCommonFilters(result, commonFilters).ToListAsync();
        return searchResults.Count;
    }

    public async Task<List<string>> GetFileNumbers(List<string> requestIds)
    {
        var fileNumbers = await Context.CMSData.Where(x => requestIds.Contains(x.Request_ID) && x.Searchable_Record == 1).Select(x => x.File_Number).Distinct().ToListAsync();

        return fileNumbers;
    }

    public async Task<List<DataModel>> GetDataByFileNumbers(List<string> requestIds, CmsArchiveSearchBase commonFilters)
    {
        var selectedData = await Context.CMSData.Where(x => requestIds.Contains(x.Request_ID) && x.Searchable_Record == 1).ToListAsync();
        var result = selectedData.DistinctBy(x => x.File_Number).ToList();

        result = await CmsSearchHelper.ApplyCommonFilters(result, commonFilters).ToListAsync();

        return result;
    }

    public async Task<List<DataModel>> GetRecordsByFileNumber(string fileNumber)
    {
        var records = await Context.CMSData.Where(r => r.File_Number == fileNumber).ToListAsync();

        return records;
    }

    public async Task<bool> IsExist(string fileNumber)
    {
        var exist = await Context.CMSData.AnyAsync(x => x.File_Number == fileNumber);
        return exist;
    }

    public async Task<List<string>> GetJoinedRecords(string fileNumber)
    {
        var joinedRecordFileNumbers = await Context.CMSData.Where(x => x.Joiner_Type == (byte)JoinerType.Child && x.Parent_File_Number == fileNumber).Select(x => x.File_Number).ToListAsync();
        return joinedRecordFileNumbers;
    }

    public async Task<List<DataModel>> GetNoTrackingRecords(string fileNumber)
    {
        var result = await Context.CMSData.AsNoTracking().Where(x => x.File_Number == fileNumber).ToListAsync();
        return result;
    }

    public async Task<DateTime?> GetLastModifiedDate(string fileNumber)
    {
        var dates = await Context.CMSData
            .Where(c => c.File_Number == fileNumber)
            .Select(d => d.Last_Modified_Date)
            .ToListAsync();

        return dates?.FirstOrDefault();
    }

    public async Task<string> GetParentRecord(string fileNumber)
    {
        var record = await Context.CMSData.FirstOrDefaultAsync(x => x.File_Number == fileNumber);
        var parentFileNumber = record.Parent_File_Number;
        return parentFileNumber;
    }
}