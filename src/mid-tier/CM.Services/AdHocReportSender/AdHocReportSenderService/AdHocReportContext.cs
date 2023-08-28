using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Models;
using CM.UserResolverService;
using Microsoft.EntityFrameworkCore;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService;

public class AdHocReportContext : DbContext
{
    private readonly IUserResolver _userResolver;

    public AdHocReportContext(DbContextOptions<AdHocReportContext> options, IUserResolver userResolver)
        : base(options)
    {
        _userResolver = userResolver;
    }

    public DbSet<AdHocReport> AdHocReports { get; set; }

    public DbSet<AdHocDlReport> AdHocDlReports { get; set; }

    public DbSet<AdHocReportAttachment> AdHocReportAttachments { get; set; }

    public DbSet<AdHocReportTracking> AdHocReportsTracking { get; set; }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        AddTimestamps();
        var result = base.SaveChangesAsync(true, cancellationToken);

        return await result;
    }

    public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess,
        CancellationToken cancellationToken = default)
    {
        AddTimestamps();

        return SaveChangesAsync(cancellationToken);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyIndexes();
        modelBuilder.AddDefaultValues();
        modelBuilder.ApplyIsDeletedFilter();
    }

    private void AddTimestamps()
    {
        var entities = ChangeTracker.Entries()
            .Where(x => x.Entity is CommonModel && x.State is EntityState.Added or EntityState.Modified);
        {
            var userId = _userResolver.GetUserId();

            foreach (var entity in entities)
            {
                switch (entity.State)
                {
                    case EntityState.Added
                        when ((CommonModel)entity.Entity).CreatedBy == Constants.UndefinedUserId ||
                             ((CommonModel)entity.Entity).ModifiedBy == Constants.UndefinedUserId:
                        ((CommonModel)entity.Entity).CreatedDate = DateTime.UtcNow;
                        ((CommonModel)entity.Entity).CreatedBy = Constants.UndefinedUserId;
                        ((CommonModel)entity.Entity).ModifiedDate = DateTime.UtcNow;
                        ((CommonModel)entity.Entity).ModifiedBy = Constants.UndefinedUserId;

                        continue;
                    case EntityState.Added:
                        ((CommonModel)entity.Entity).CreatedDate = DateTime.UtcNow;
                        ((CommonModel)entity.Entity).CreatedBy = userId;

                        break;
                    case EntityState.Modified
                        when ((CommonModel)entity.Entity).ModifiedBy == Constants.UndefinedUserId &&
                             entity.Entity.GetType() != typeof(SystemUser):
                        ((CommonModel)entity.Entity).ModifiedDate = DateTime.UtcNow;

                        continue;
                }

                ((CommonModel)entity.Entity).ModifiedDate = DateTime.UtcNow;
                ((CommonModel)entity.Entity).ModifiedBy = userId;
            }
        }
    }
}