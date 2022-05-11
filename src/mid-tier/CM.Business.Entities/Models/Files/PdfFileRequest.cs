using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Files;

public class PdfFileRequest
{
    [JsonProperty("generation_template")]
    [Range(1, 2)]
    [Required]
    public byte GenerationTemplate { get; set; }

    [JsonProperty("file_type")]
    [Range(1, 2)]
    [Required]
    public byte FileType { get; set; }

    [JsonProperty("version_number")]
    [Range(0, int.MaxValue)]
    public int VersionNumber { get; set; }

    [JsonProperty("html_for_pdf")]
    [Required]
    public string HtmlForPdf { get; set; }

    [JsonProperty("file_title")]
    [Required]
    public string FileTitle { get; set; }
}