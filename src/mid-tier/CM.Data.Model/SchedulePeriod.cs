using System;
using System.Collections.Generic;
using CM.Common.Utilities;

namespace CM.Data.Model;

public class SchedulePeriod : BaseEntity
{
    public int SchedulePeriodId { get; set; }

    public CmTimeZone PeriodTimeZone { get; set; }

    public DateTime PeriodStart { get; set; }

    public DateTime PeriodEnd { get; set; }

    public DateTime LocalPeriodStart { get; set; }

    public DateTime LocalPeriodEnd { get; set; }

    public PeriodStatus PeriodStatus { get; set; }

    public bool? IsDeleted { get; set; }

    public virtual ICollection<ScheduleBlock> ScheduleBlocks { get; set; }
}