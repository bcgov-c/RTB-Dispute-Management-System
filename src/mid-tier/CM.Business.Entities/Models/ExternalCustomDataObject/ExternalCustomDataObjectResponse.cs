using System.ComponentModel.DataAnnotations;
using CM.Business.Entities.Models.Base;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.ExternalCustomDataObject;

public class ExternalCustomDataObjectResponse : CommonResponse
{
    [JsonProperty("external_custom_data_object_id")]
    public int ExternalCustomDataObjectId { get; set; }

    [JsonProperty("external_user_session_expiry")]
    public string Expiry { get; set; }

    [JsonProperty("owner_id")]
    public int? OwnerId { get; set; }

    [JsonProperty("reference_id")]
    public string ReferenceId { get; set; }

    [JsonProperty("object_type")]
    public CustomObjectType Type { get; set; }

    [JsonProperty("object_sub_type")]
    public byte? SubType { get; set; }

    [JsonProperty("object_status")]
    public byte? Status { get; set; }

    [JsonProperty("object_sub_status")]
    public byte? SubStatus { get; set; }

    [StringLength(100)]
    [JsonProperty("object_title")]
    public string Title { get; set; }

    [JsonProperty("object_description")]
    public string Description { get; set; }

    [JsonProperty("is_active")]
    public bool? IsActive { get; set; }

    [JsonProperty("object_json")]
    [JsonValidation]
    public string ObjectJson { get; set; }
}