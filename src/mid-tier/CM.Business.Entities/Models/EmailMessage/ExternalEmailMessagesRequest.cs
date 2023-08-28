using System.ComponentModel.DataAnnotations;

namespace CM.Business.Entities.Models.EmailMessage
{
    public class ExternalEmailMessagesRequest
    {
        [Required]
        public int[] Participants { get; set; }
    }
}
