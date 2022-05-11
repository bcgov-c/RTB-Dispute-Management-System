using System;
using CM.Business.Entities.Models.Base;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.CustomDataObject;

public class CustomDataObjectResponse : CommonResponse
{
    [JsonProperty("custom_data_object_id")]
    public int CustomDataObjectId { get; set; }

    [JsonProperty("dispute_guid")]
    public Guid DisputeGuid { get; set; }

    [JsonProperty("object_type")]
    public CustomObjectType ObjectType { get; set; }

    [JsonProperty("object_sub_type")]
    public byte? ObjectSubType { get; set; }

    [JsonProperty("description")]
    public string Description { get; set; }

    [JsonProperty("is_active")]
    public bool? IsActive { get; set; }

    [JsonProperty("object_status")]
    public byte? ObjectStatus { get; set; }

    [JsonProperty("object_json")]
    [JsonValidation]
    public string ObjectJson { get; set; }

    [JsonProperty("is_amended")]
    public bool? IsAmended { get; set; }
}