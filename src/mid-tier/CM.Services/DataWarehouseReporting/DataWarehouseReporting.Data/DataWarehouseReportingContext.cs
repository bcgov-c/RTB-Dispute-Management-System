using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CM.UserResolverService;
using DataWarehouseReporting.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace DataWarehouseReporting.Data;

public class DataWarehouseReportingContext : DbContext
{
    private readonly IUserResolver _userResolver;

    public DataWarehouseReportingContext(DbContextOptions<DataWarehouseReportingContext> options)
        : base(options)
    {
    }

    public DataWarehouseReportingContext(DbContextOptions<DataWarehouseReportingContext> options, IUserResolver userResolver)
        : base(options)
    {
        _userResolver = userResolver;
    }

    public DbSet<FactDisputeSummary> FactDisputeSummaries { get; set; }

    public DbSet<FactHearingSummary> FactHearingSummaries { get; set; }

    public DbSet<FactTimeStatistic> FactTimeStatistics { get; set; }

    public DbSet<DimCity> DimCities { get; set; }

    public DbSet<DimTime> DimTimes { get; set; }

    public DbSet<LoadingHistory> LoadingHistories { get; set; }

    public DbSet<SystemUser> SystemUsers { get; set; }

    public DbSet<UserToken> UserTokens { get; set; }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await base.SaveChangesAsync(cancellationToken);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
    }

    // ReSharper disable once UnusedMember.Local
    private void AddTimestamps()
    {
        var entities = ChangeTracker.Entries().Where(x => x.Entity.GetType() == typeof(UserToken) && x.State is EntityState.Added or EntityState.Modified);
        {
            var userId = _userResolver.GetUserId();

            foreach (var entity in entities)
            {
                if (entity.State == EntityState.Added)
                {
                    ((UserToken)entity.Entity).SystemUserId = userId;
                }
            }
        }
    }
}