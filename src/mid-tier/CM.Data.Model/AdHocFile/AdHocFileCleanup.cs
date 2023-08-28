using System;

namespace CM.Data.Model.AdHocFile;

public class AdHocFileCleanup
{
    public long AdHocFileCleanupId { get; set; }

    public string Title { get; set; }

    public string Description { get; set; }

    public CleanupType? Type { get; set; }

    public string CronJob { get; set; }

    public string QueryForCleanup { get; set; }

    public bool IsActive { get; set; }

    public bool IsDeleted { get; set; }

    public DateTime? CreatedDate { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? ModifiedDate { get; set; }

    public int? ModifiedBy { get; set; }
}