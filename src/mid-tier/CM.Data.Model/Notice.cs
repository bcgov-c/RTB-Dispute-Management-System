using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CM.Data.Model;

public class Notice : BaseEntity
{
    public int NoticeId { get; set; }

    public Dispute Dispute { get; set; }

    public Guid DisputeGuid { get; set; }

    public int? ParentNoticeId { get; set; }

    public Notice ParentNotice { get; set; }

    [StringLength(100)]
    [Required]
    public string NoticeTitle { get; set; }

    [Required]
    public byte NoticeType { get; set; }

    public byte? NoticeVersion { get; set; }

    public bool? IsInitialDisputeNotice { get; set; }

    public Hearing Hearing { get; set; }

    public int? HearingId { get; set; }

    public byte? HearingType { get; set; }

    [StringLength(1500)]
    public string NoticeSpecialInstructions { get; set; }

    public string NoticeHtmlForPdf { get; set; }

    public byte? NoticeDeliveryMethod { get; set; }

    public Participant Participant { get; set; }

    public int? NoticeDeliveredTo { get; set; }

    public byte? NoticeAssociatedTo { get; set; }

    public DateTime? NoticeDeliveredDate { get; set; }

    public int? ConferenceBridgeId { get; set; }

    public ConferenceBridge ConferenceBridge { get; set; }

    public int? NoticeFileDescriptionId { get; set; }

    public FileDescription NoticeFileDescription { get; set; }

    public bool? IsDeleted { get; set; }

    [StringLength(100)]
    public string NoticeDeliveredToOther { get; set; }

    public bool HasServiceDeadline { get; set; }

    public int? ServiceDeadlineDays { get; set; }

    public DateTime? ServiceDeadlineDate { get; set; }

    public DateTime? SecondServiceDeadlineDate { get; set; }

    public ICollection<NoticeService> NoticeServices { get; set; }

    public ICollection<Amendment> Amendments { get; set; }

    public ICollection<Dispute> Disputes { get; set; }

    public ICollection<Notice> ChildNotices { get; set; }
}