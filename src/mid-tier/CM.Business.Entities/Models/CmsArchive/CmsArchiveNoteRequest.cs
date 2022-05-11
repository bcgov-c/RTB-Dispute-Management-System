// ReSharper disable InconsistentNaming

using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.CmsArchive;

public class CmsArchiveNoteRequest
{
    [JsonProperty("cms_note")]
    [Required]
    public string CMS_Note { get; set; }

    [JsonProperty("created_by")]
    [Required]
    public string Created_By { get; set; }
}