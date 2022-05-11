using System.ComponentModel.DataAnnotations;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.CustomConfigObject;

public class CustomConfigObjectPatchRequest
{
    [JsonProperty("object_status")]
    public byte? ObjectStatus { get; set; }

    [JsonProperty("object_version_id")]
    public decimal? ObjectVersionId { get; set; }

    [JsonProperty("object_title")]
    [MinLength(5, ErrorMessage = "A minimum 5 char length value is required for object_title")]
    public string ObjectTitle { get; set; }

    [JsonProperty("object_description")]
    [MinLength(5, ErrorMessage = "A minimum 5 char length value is required for object_description")]
    public string ObjectDescription { get; set; }

    [JsonProperty("associated_role_group")]
    public byte? AssociatedRoleGroup { get; set; }

    [JsonProperty("is_active")]
    public bool IsActive { get; set; }

    [JsonProperty("is_public")]
    public bool IsPublic { get; set; }

    [JsonProperty("object_json")]
    [JsonValidation]
    public string ObjectJson { get; set; }

    [JsonProperty("object_json_b")]
    [JsonValidation]
    public string ObjectJsonB { get; set; }

    [JsonProperty("object_text")]
    public string ObjectText { get; set; }
}