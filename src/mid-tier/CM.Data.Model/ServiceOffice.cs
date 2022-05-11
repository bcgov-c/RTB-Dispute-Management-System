using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CM.Data.Model;

public class ServiceOffice : BaseEntity
{
    public int ServiceOfficeId { get; set; }

    [Required]
    [StringLength(100)]
    public string OfficeName { get; set; }

    [StringLength(10)]
    public string OfficeAbbreviation { get; set; }

    [StringLength(255)]
    public string OfficeDescription { get; set; }

    [Required]
    [StringLength(100)]
    public string OfficeTimezone { get; set; }

    public byte OfficeTimezoneUtcOffset { get; set; }

    public byte? OfficeStatus { get; set; }

    public bool IsDeleted { get; set; }

    public virtual ICollection<SystemUser> SystemUsers { get; set; }
}