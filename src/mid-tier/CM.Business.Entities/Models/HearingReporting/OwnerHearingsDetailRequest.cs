using System;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.HearingReporting;

public class OwnerHearingsDetailRequest
{
    [Required]
    [JsonProperty("start_date")]
    public DateTime StartDate { get; set; }

    [JsonProperty("end_date")]
    public DateTime? EndDate { get; set; }
}