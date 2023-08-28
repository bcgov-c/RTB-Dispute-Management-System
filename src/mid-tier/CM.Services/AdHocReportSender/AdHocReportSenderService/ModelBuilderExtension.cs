using CM.Common.Utilities;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Models;
using Microsoft.EntityFrameworkCore;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService
{
    public static class ModelBuilderExtension
    {
        public static void ApplyIndexes(this ModelBuilder modelBuilder)
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

        public static void AddDefaultValues(this ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<AdHocDlReport>().Property(r => r.IsDeleted).HasDefaultValue(false);
            modelBuilder.Entity<AdHocDlReport>().Property(r => r.IsActive).HasDefaultValue(false);
            modelBuilder.Entity<AdHocDlReport>().Property(r => r.TargetDatabase).HasDefaultValue(TargetDatabase.RtbDms);

            modelBuilder.Entity<AdHocReport>().Property(r => r.IsDeleted).HasDefaultValue(false);
            modelBuilder.Entity<AdHocReport>().Property(r => r.IsActive).HasDefaultValue(false);
        }

        public static void ApplyIsDeletedFilter(this ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<AdHocDlReport>().HasQueryFilter(r => r.IsDeleted == false);
            modelBuilder.Entity<AdHocReport>().HasQueryFilter(r => r.IsDeleted == false);
        }

        public static void ApplyRelations(this ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<AdHocReportAttachment>()
                .HasOne(ds => ds.AdHocReport)
                .WithMany(d => d.AdHocReportAttachments)
                .HasForeignKey(ds => ds.AdHocReportId)
                .HasPrincipalKey(d => d.AdHocReportId);
        }
    }
}
