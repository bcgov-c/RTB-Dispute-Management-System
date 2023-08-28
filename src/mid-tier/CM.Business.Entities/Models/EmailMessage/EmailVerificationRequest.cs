using System.ComponentModel.DataAnnotations;
using CM.Common.Utilities;

namespace CM.Business.Entities.Models.EmailMessage
{
    public class EmailVerificationRequest
    {
        [Required]
        public VerificationType VerificationType { get; set; }

        [Required]
        [StringLength(4, MinimumLength = 4, ErrorMessage = "A valid numeric 6-digit verification code is required - e.g. 1234")]
        public string VerificationCode { get; set; }
    }
}
