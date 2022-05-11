// ReSharper disable InconsistentNaming

using Newtonsoft.Json;

namespace CM.Business.Entities.Models.CmsArchive;

public class CmsArchiveNoteResponse
{
    [JsonProperty("cms_note_id")]
    public int CMS_Note_ID { get; set; }

    [JsonProperty("cms_note")]
    public string CMS_Note { get; set; }

    [JsonProperty("created_by")]
    public string Created_By { get; set; }

    [JsonProperty("created_date")]
    public string Created_Date { get; set; }
}