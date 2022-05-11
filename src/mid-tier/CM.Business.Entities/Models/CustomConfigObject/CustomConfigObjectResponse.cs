using CM.Business.Entities.Models.Base;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.CustomConfigObject;

public class CustomConfigObjectResponse : CommonResponse
{
    [JsonProperty("custom_config_object_id")]
    public int CustomConfigObjectId { get; set; }

    [JsonProperty("object_type")]
    public byte ObjectType { get; set; }

    [JsonProperty("object_sub_type")]
    public byte? ObjectSubType { get; set; }

    [JsonProperty("object_status")]
    public byte? ObjectStatus { get; set; }

    [JsonProperty("object_version_id")]
    public decimal? ObjectVersionId { get; set; }

    [JsonProperty("object_title")]
    public string ObjectTitle { get; set; }

    [JsonProperty("object_description")]
    public string ObjectDescription { get; set; }

    [JsonProperty("associated_role_group")]
    public byte? AssociatedRoleGroup { get; set; }

    [JsonProperty("is_active")]
    public bool IsActive { get; set; }

    [JsonProperty("is_public")]
    public bool IsPublic { get; set; }

    [JsonProperty("object_storage_type ")]
    public byte ObjectStorageType { get; set; }

    [JsonProperty("object_json")]
    [JsonValidation]
    public string ObjectJson { get; set; }

    [JsonProperty("object_json_b")]
    [JsonValidation]
    public string ObjectJsonB { get; set; }

    [JsonProperty("object_text")]
    public string ObjectText { get; set; }
}