using System.ComponentModel.DataAnnotations;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.ExternalCustomDataObject;

public class ExternalCustomDataObjectRequest
{
    [Required]
    [JsonProperty("object_type")]
    public ExternalCustomObjectType Type { get; set; }

    [Required(AllowEmptyStrings = false)]
    [JsonProperty("object_title")]
    [MinLength(5, ErrorMessage = "A minimum 5 char length value is required")]
    [StringLength(255)]
    public string Title { get; set; }

    [JsonProperty("object_status")]
    public byte? Status { get; set; }

    [JsonProperty("object_sub_status")]
    public byte? SubStatus { get; set; }

    [JsonProperty("object_sub_type")]
    public byte? SubType { get; set; }

    [MinLength(5, ErrorMessage = "A minimum 5 char length value is required")]
    [JsonProperty("object_description")]
    [StringLength(255)]
    public string Description { get; set; }

    [MinLength(5, ErrorMessage = "A minimum 5 char length value is required for json")]
    [JsonProperty("object_json")]
    [JsonValidation]
    public string ObjectJson { get; set; }
}