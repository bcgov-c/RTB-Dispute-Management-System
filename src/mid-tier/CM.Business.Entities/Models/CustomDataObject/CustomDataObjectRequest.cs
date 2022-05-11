﻿using System.ComponentModel.DataAnnotations;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.CustomDataObject;

public class CustomDataObjectRequest
{
    [JsonProperty("object_type")]
    public CustomObjectType ObjectType { get; set; }

    [JsonProperty("object_status")]
    public byte? ObjectStatus { get; set; }

    [JsonProperty("object_sub_type")]
    public byte? ObjectSubType { get; set; }

    [JsonProperty("description")]
    [StringLength(255)]
    public string Description { get; set; }

    [Required(AllowEmptyStrings = false)]
    [MinLength(5, ErrorMessage = "A minimum 5 char length value is required for object_json")]
    [JsonValidation]
    [JsonProperty("object_json")]
    public string ObjectJson { get; set; }
}