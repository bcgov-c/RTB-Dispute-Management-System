using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CM.Data.Model;

public class DisputeStatus
{
    public int DisputeStatusId { get; set; }

    public Dispute Dispute { get; set; }

    public Guid DisputeGuid { get; set; }

    public bool IsActive { get; set; }

    public byte Status { get; set; }

    public byte? Stage { get; set; }

    public byte? Process { get; set; }

    public int? Owner { get; set; }

    public int? DurationSeconds { get; set; }

    [StringLength(255)]
    public string StatusNote { get; set; }

    public DateTime StatusStartDate { get; set; }

    public int StatusSetBy { get; set; }

    public byte? EvidenceOverride { get; set; }

    public virtual ICollection<DisputeProcessDetail> DisputeProcessDetails { get; set; }
}