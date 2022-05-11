using System;
using CM.Common.Utilities;

namespace CM.Data.Model;

public class HearingAuditLog
{
    public int HearingAuditLogId { get; set; }

    public HearingChangeType HearingChangeType { get; set; }

    public int HearingId { get; set; }

    public Hearing Hearing { get; set; }

    public byte? HearingType { get; set; }

    public byte? HearingSubType { get; set; }

    public byte? HearingPriority { get; set; }

    public ConferenceBridge ConferenceBridge { get; set; }

    public int? ConferenceBridgeId { get; set; }

    public SystemUser SystemUser { get; set; }

    public int HearingOwner { get; set; }

    public DateTime? HearingStartDateTime { get; set; }

    public DateTime? HearingEndDateTime { get; set; }

    public DateTime? LocalStartDateTime { get; set; }

    public DateTime? LocalEndDateTime { get; set; }

    public byte? DisputeHearingRole { get; set; }

    public Guid? DisputeGuid { get; set; }

    public Dispute Dispute { get; set; }

    public byte? SharedHearingLinkType { get; set; }

    public DateTime? CreatedDate { get; set; }

    public int? CreatedBy { get; set; }
}