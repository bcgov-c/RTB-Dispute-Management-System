using System;
using System.ComponentModel.DataAnnotations;
using CM.Common.Utilities;

namespace CM.Data.Model;

public class ScheduleBlock : BaseEntity
{
    public int ScheduleBlockId { get; set; }

    public int SchedulePeriodId { get; set; }

    public SchedulePeriod SchedulePeriod { get; set; }

    public int SystemUserId { get; set; }

    public SystemUser SystemUser { get; set; }

    public DateTime BlockStart { get; set; }

    public DateTime BlockEnd { get; set; }

    public BlockType? BlockType { get; set; }

    public BlockStatus? BlockStatus { get; set; }

    public BlockSubStatus? BlockSubStatus { get; set; }

    [StringLength(255)]
    public string BlockDescription { get; set; }

    [StringLength(255)]
    public string BlockNote { get; set; }

    public bool? IsDeleted { get; set; }
}