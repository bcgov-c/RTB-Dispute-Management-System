using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using CM.Common.Utilities;

namespace CM.Data.Model
{
    public class OnlineMeeting : BaseEntity
    {
        [Key]
        public int OnlineMeetingId { get; set; }

        public ConferenceType ConferenceType { get; set; }

        public byte? ConferenceStatus { get; set; }

        [StringLength(200)]
        public string ConferenceId { get; set; }

        [StringLength(100)]
        public string ConferencePassword { get; set; }

        [StringLength(2500)]
        public string GeneralInstructions { get; set; }

        [StringLength(2500)]
        public string SpecialInstructions { get; set; }

        [Required]
        [StringLength(1000)]
        public string ConferenceUrl { get; set; }

        [Required]
        [StringLength(20)]
        public string DialInNumber1 { get; set; }

        [Required]
        [StringLength(255)]
        public string DialInDescription1 { get; set; }

        [StringLength(20)]
        public string DialInNumber2 { get; set; }

        [StringLength(255)]
        public string DialInDescription2 { get; set; }

        [StringLength(20)]
        public string DialInNumber3 { get; set; }

        [StringLength(255)]
        public string DialInDescription3 { get; set; }

        public bool IsDeleted { get; set; }

        public virtual ICollection<DisputeLink> DisputeLinks { get; set; }
    }
}
