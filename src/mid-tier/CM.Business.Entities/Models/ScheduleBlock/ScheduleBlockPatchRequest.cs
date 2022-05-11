using System;
using System.ComponentModel.DataAnnotations;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.ScheduleBlock;

public class ScheduleBlockPatchRequest
{
    [JsonProperty("block_start")]
    public DateTime BlockStart { get; set; }

    [JsonProperty("block_end")]
    public DateTime BlockEnd { get; set; }

    [JsonProperty("block_type")]
    public BlockType? BlockType { get; set; }

    [JsonProperty("block_status")]
    public BlockStatus? BlockStatus { get; set; }

    [JsonProperty("block_sub_status")]
    public BlockSubStatus? BlockSubStatus { get; set; }

    [JsonProperty("block_description")]
    [StringLength(255)]
    public string BlockDescription { get; set; }

    [JsonProperty("block_note")]
    [StringLength(255)]
    public string BlockNote { get; set; }
}