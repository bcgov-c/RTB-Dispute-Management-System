using System.Collections.Generic;
using System.Linq;
using CM.Business.Entities.Models.CmsArchive;
using CM.Data.Model;

namespace CM.Data.Repositories.CmsArchive.Helper;

public static class CmsSearchHelper
{
    public static DataModel ApplyCommonFiltersOnData(DataModel data, CmsArchiveSearchBase filters)
    {
        var isData = true;

        if (filters != null && data != null)
        {
            if (!filters.SubmittedDateGreaterThan.Equals(null))
            {
                isData = data.Submitted_Date >= filters.SubmittedDateGreaterThan;
            }

            if (!filters.SubmittedDateLessThan.Equals(null))
            {
                isData = data.Submitted_Date < filters.SubmittedDateLessThan;
            }

            if (!filters.CreatedDateGreaterThan.Equals(null))
            {
                isData = data.Created_Date >= filters.CreatedDateGreaterThan;
            }

            if (!filters.CreatedDateLessThan.Equals(null))
            {
                isData = data.Created_Date < filters.CreatedDateLessThan;
            }

            if (!filters.LastModifiedDateGreaterThan.Equals(null))
            {
                isData = data.Last_Modified_Date >= filters.LastModifiedDateGreaterThan;
            }

            if (!filters.LastModifiedDateLessThan.Equals(null))
            {
                isData = data.Last_Modified_Date < filters.LastModifiedDateLessThan;
            }

            if (!filters.DisputeStatusEquals.Equals(null))
            {
                isData = data.Dispute_Status == filters.DisputeStatusEquals;
            }
        }

        if (isData)
        {
            return data;
        }

        return null;
    }

    public static IEnumerable<DataModel> ApplyCommonFilters(List<DataModel> dataList, CmsArchiveSearchBase filters)
    {
        if (filters != null && dataList != null)
        {
            if (!filters.SubmittedDateGreaterThan.Equals(null))
            {
                dataList = dataList.Where(x => x.Submitted_Date >= filters.SubmittedDateGreaterThan).ToList();
            }

            if (!filters.SubmittedDateLessThan.Equals(null))
            {
                dataList = dataList.Where(x => x.Submitted_Date < filters.SubmittedDateLessThan).ToList();
            }

            if (!filters.CreatedDateGreaterThan.Equals(null))
            {
                dataList = dataList.Where(x => x.Created_Date >= filters.CreatedDateGreaterThan).ToList();
            }

            if (!filters.CreatedDateLessThan.Equals(null))
            {
                dataList = dataList.Where(x => x.Created_Date < filters.CreatedDateLessThan).ToList();
            }

            if (!filters.LastModifiedDateGreaterThan.Equals(null))
            {
                dataList = dataList.Where(x => x.Last_Modified_Date >= filters.LastModifiedDateGreaterThan).ToList();
            }

            if (!filters.LastModifiedDateLessThan.Equals(null))
            {
                dataList = dataList.Where(x => x.Last_Modified_Date < filters.LastModifiedDateLessThan).ToList();
            }

            if (!filters.DisputeStatusEquals.Equals(null))
            {
                dataList = dataList.Where(x => x.Dispute_Status == filters.DisputeStatusEquals).ToList();
            }
        }

        return dataList;
    }
}