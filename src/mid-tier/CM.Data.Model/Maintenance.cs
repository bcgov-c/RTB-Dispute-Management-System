using System;
using System.ComponentModel.DataAnnotations;

namespace CM.Data.Model;

public class Maintenance
{
    public int MaintenanceId { get; set; }

    public byte SystemId { get; set; }

    [StringLength(255)]
    public string MaintenanceTitle { get; set; }

    [Required]
    public DateTime StartDateTime { get; set; }

    public int ExpectedDurationMinutes { get; set; }

    [Required]
    [StringLength(15)]
    public string OverrideKey { get; set; }

    public bool Active { get; set; }
}