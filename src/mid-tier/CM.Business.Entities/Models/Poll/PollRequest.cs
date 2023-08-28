using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Poll
{
    public class PollRequest
    {
        [JsonProperty("poll_title")]
        [StringLength(150, MinimumLength = 5)]
        [Required(ErrorMessage = "A poll title is required with a minimum of 5 characters", AllowEmptyStrings = false)]
        public string PollTitle { get; set; }

        [Required(ErrorMessage = "A poll type must be provided")]
        [JsonProperty("poll_type")]
        [Range(1, byte.MaxValue)]
        public byte PollType { get; set; }
    }
}
