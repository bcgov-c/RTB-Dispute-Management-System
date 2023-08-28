using System;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.ExternalErrorLog
{
    public class ExternalErrorLogRequest
    {
        [JsonProperty("error_site")]
        public byte ErrorSite { get; set; }

        [JsonProperty("error_type")]
        public byte ErrorType { get; set; }

        [JsonProperty("error_title")]
        [StringLength(150, MinimumLength = 3)]
        [Required]
        public string ErrorTitle { get; set; }

        [JsonProperty("error_details")]
        [StringLength(2500, MinimumLength = 25)]
        [Required]
        public string ErrorDetails { get; set; }

        [JsonProperty("dispue_guid")]
        public Guid? DisputeGuid { get; set; }

        [JsonProperty("error_owner")]
        public int? ErrorOwner { get; set; }

        [JsonProperty("reported_date")]
        public DateTime? ReportedDate { get; set; }
    }
}
