using CM.Services.AdHocReportSender.AdHocReportSenderService.Models;
using Microsoft.EntityFrameworkCore;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService;

public class AdHocReportContext : DbContext
{
    public AdHocReportContext(DbContextOptions<AdHocReportContext> options)
        : base(options)
    {
    }

    public DbSet<AdHocReport> AdHocReports { get; set; }

    public DbSet<AdHocDlReport> AdHocDlReports { get; set; }

    public DbSet<AdHocReportAttachment> AdHocReportAttachments { get; set; }

    public DbSet<AdHocReportTracking> AdHocReportsTracking { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .Entity<AdHocReportTracking>()
            .HasIndex(b => b.AdHocReportId)
            .IsUnique(false);
        modelBuilder
            .Entity<AdHocReportAttachment>()
            .HasIndex(b => b.AdHocReportId)
            .IsUnique(false);
    }
}