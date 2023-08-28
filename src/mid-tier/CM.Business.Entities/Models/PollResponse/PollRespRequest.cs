using System;
using System.ComponentModel.DataAnnotations;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.PollResponse
{
    public class PollRespRequest
    {
        [JsonProperty("dispute_guid")]
        public Guid DisputeGuid { get; set; }

        [JsonProperty("participant_id")]
        public int? ParticipantId { get; set; }

        [JsonProperty("response_type")]
        public byte? ResponseType { get; set; }

        [JsonProperty("response_sub_type")]
        public byte? ResponseSubType { get; set; }

        [JsonProperty("response_status")]
        public byte ResponseStatus { get; set; }

        [JsonProperty("response_site")]
        public byte? ResponseSite { get; set; }

        [JsonProperty("response_json")]
        [JsonValidation(false)]
        [Required]
        public string ResponseJson { get; set; }

        [JsonProperty("response_date")]
        public DateTime? ResponseDate { get; set; }

        [JsonProperty("response_text")]
        [StringLength(2000, MinimumLength = 10, ErrorMessage = "The response text must be a minimum 10 characters")]
        public string ResponseText { get; set; }

        [JsonProperty("associated_file_id")]
        public int? AssociatedFileId { get; set; }
    }
}
