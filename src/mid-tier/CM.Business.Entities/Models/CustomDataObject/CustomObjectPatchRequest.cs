using System.ComponentModel.DataAnnotations;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.CustomDataObject;

public class CustomObjectPatchRequest
{
    [JsonProperty("object_status")]
    public byte? ObjectStatus { get; set; }

    [JsonProperty("object_sub_type")]
    public byte? ObjectSubType { get; set; }

    [JsonProperty("description")]
    [StringLength(255)]
    public string Description { get; set; }

    [Required(AllowEmptyStrings = false)]
    [MinLength(5, ErrorMessage = "A minimum 5 char length value is required for object_json")]
    [JsonProperty("object_json")]
    [JsonValidation]
    public string ObjectJson { get; set; }

    [JsonProperty("is_amended")]
    public bool? IsAmended { get; set; }
}