using System;
using System.ComponentModel.DataAnnotations;

namespace CM.Data.Model;

public class Amendment : BaseEntity
{
    public int AmendmentId { get; set; }

    public Dispute Dispute { get; set; }

    [Required]
    public Guid DisputeGuid { get; set; }

    public Notice Notice { get; set; }

    public int? NoticeId { get; set; }

    [Required]
    [StringLength(70)]
    public string AmendmentTitle { get; set; }

    public byte AmendmentTo { get; set; }

    public bool? IsInternallyInitiated { get; set; }

    public byte AmendmentChangeType { get; set; }

    [Required]
    public string AmendmentChangeHtml { get; set; }

    public Participant Participant { get; set; }

    public int? AmendmentSubmitterId { get; set; }

    public string AmendmentPendingData { get; set; }

    public byte AmendmentStatus { get; set; }

    [StringLength(255)]
    public string AmendmentDescription { get; set; }

    public int? AmendmentFileId { get; set; }

    public byte? AmendmentSource { get; set; }

    public byte? IncludeInDecision { get; set; }

    public int? AmendFileDescriptionId { get; set; }

    public FileDescription AmendFileDescription { get; set; }
}