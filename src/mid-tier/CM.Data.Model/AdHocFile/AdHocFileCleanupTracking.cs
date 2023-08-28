using System;

namespace CM.Data.Model.AdHocFile;

public class AdHocFileCleanupTracking
{
    public long AdHocFileCleanupTrackingId { get; set; }

    public long AdHocFileCleanupId { get; set; }

    public DateTime? StartTime { get; set; }

    public FileCleanupStatus Status { get; set; }

    public int Count { get; set; }

    public int Size { get; set; }
}