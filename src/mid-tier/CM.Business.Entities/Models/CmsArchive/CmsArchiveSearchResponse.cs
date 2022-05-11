using System.Collections.Generic;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.CmsArchive;

public class CmsArchiveSearchResponse
{
    [JsonProperty("total_available_records")]
    public int TotalAvailableRecords { get; set; }

    [JsonProperty("cms_archive_search_results")]
    public List<CmsArchiveSearchResult> CmsArchiveSearchResults { get; set; }
}