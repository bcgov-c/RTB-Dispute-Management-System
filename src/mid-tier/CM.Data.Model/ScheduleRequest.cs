﻿using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using CM.Common.Utilities;

namespace CM.Data.Model;

public class ScheduleRequest : BaseEntity
{
    public int ScheduleRequestId { get; set; }

    public int RequestorSystemUserId { get; set; }

    public SystemUser RequestorSystemUser { get; set; }

    public byte? RequestType { get; set; }

    public int? RequestSubmitter { get; set; }

    public SystemUser RequestSubmitterUser { get; set; }

    public int? RequestOwnerId { get; set; }

    public SystemUser RequestOwner { get; set; }

    public DateTime? RequestStart { get; set; }

    public DateTime? RequestEnd { get; set; }

    public ScheduleRequestStatus? RequestStatus { get; set; }

    public ScheduleRequestSubStatus? RequestSubStatus { get; set; }

    [StringLength(500)]
    public string RequestDescription { get; set; }

    [StringLength(500)]
    public string RequestNote { get; set; }

    [Column(TypeName = "jsonb")]
    public string RequestJson { get; set; }

    public bool? IsDeleted { get; set; }
}