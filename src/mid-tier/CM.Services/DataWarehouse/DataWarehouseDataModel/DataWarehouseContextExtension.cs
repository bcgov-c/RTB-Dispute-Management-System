using CM.Services.DataWarehouse.DataWarehouseDataModel.Models;
using Microsoft.EntityFrameworkCore;

namespace CM.Services.DataWarehouse.DataWarehouseDataModel;

public static class DataWarehouseContextExtension
{
    public static void ApplyIndexes(this ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<FactDisputeSummary>()
            .HasIndex(b => b.LoadDateTime)
            .IncludeProperties(b => b.CreationMethod);
    }

    public static void ApplyColumnsCustomTypes(this ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<FactHearingSummary>().Property(r => r.AllLinkedEvidenceFilesMb).HasColumnType("decimal(8,2)");
        modelBuilder.Entity<FactTimeStatistic>().Property(r => r.AvgNext10StandardEmptyHearingDays).HasColumnType("decimal(6,2)");
        modelBuilder.Entity<FactTimeStatistic>().Property(r => r.AvgNext10EmergEmptyHearingDays).HasColumnType("decimal(6,2)");
        modelBuilder.Entity<FactTimeStatistic>().Property(r => r.AvgNext10DeferredEmptyHearingDays).HasColumnType("decimal(6,2)");

        modelBuilder.Entity<FactIssueOutcome>().Property(r => r.RequestedAmount).HasColumnType("decimal(10,2)");
        modelBuilder.Entity<FactIssueOutcome>().Property(r => r.AwardedAmount).HasColumnType("decimal(10,2)");
        modelBuilder.Entity<FactIssueOutcome>().Property(r => r.PrevAwardedAmount).HasColumnType("decimal(10,2)");
    }

    public static void ApplyUniqueIndexes(this ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<FactIntakeProcessing>().HasIndex(p => new { p.DisputeGuid, p.ProcessStartDisputeStatusId, p.ProcessEndDisputeStatusId }).IsUnique();
    }
}