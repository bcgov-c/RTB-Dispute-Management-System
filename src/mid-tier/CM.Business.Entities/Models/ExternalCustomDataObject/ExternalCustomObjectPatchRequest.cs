using System;
using System.ComponentModel.DataAnnotations;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.ExternalCustomDataObject;

public class ExternalCustomObjectPatchRequest
{
    [JsonProperty("external_user_session_expiry")]
    public DateTime Expiry { get; set; }

    [JsonProperty("owner_id")]
    public int? OwnerId { get; set; }

    [JsonProperty("reference_id")]
    [MinLength(5, ErrorMessage = "A minimum 5 char length value is required")]
    public string ReferenceId { get; set; }

    [Required(AllowEmptyStrings = false)]
    [JsonProperty("object_type")]
    public CustomObjectType Type { get; set; }

    [Required(AllowEmptyStrings = false)]
    [MinLength(5, ErrorMessage = "A minimum 5 char length value is required")]
    [JsonProperty("object_title")]
    [StringLength(100)]
    public string Title { get; set; }

    [MinLength(5, ErrorMessage = "A minimum 5 char length value is required")]
    [JsonProperty("object_description")]
    public string Description { get; set; }

    [JsonProperty("object_json")]
    public string ObjectJson { get; set; }

    [JsonProperty("object_status")]
    public byte? Status { get; set; }

    [JsonProperty("object_sub_status")]
    public byte? SubStatus { get; set; }
}