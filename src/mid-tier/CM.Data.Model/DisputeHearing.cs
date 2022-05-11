using System;
using System.ComponentModel.DataAnnotations;

namespace CM.Data.Model;

public class DisputeHearing : BaseEntity
{
    public int DisputeHearingId { get; set; }

    public Hearing Hearing { get; set; }

    public int HearingId { get; set; }

    public Dispute Dispute { get; set; }

    public Guid? DisputeGuid { get; set; }

    [StringLength(12)]
    public string ExternalFileId { get; set; }

    public byte DisputeHearingRole { get; set; }

    public byte? DisputeHearingStatus { get; set; }

    public byte? SharedHearingLinkType { get; set; }

    public int? NoticeConferenceBridgeId { get; set; }

    public ConferenceBridge NoticeConferenceBridge { get; set; }

    public bool? IsDeleted { get; set; }
}