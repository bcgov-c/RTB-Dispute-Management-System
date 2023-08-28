using System.Threading;
using System.Threading.Tasks;
using CM.Services.DataWarehouse.DataWarehouseDataModel.Models;
using Microsoft.EntityFrameworkCore;

namespace CM.Services.DataWarehouse.DataWarehouseDataModel;

public class DataWarehouseContext : DbContext
{
    public DataWarehouseContext(DbContextOptions<DataWarehouseContext> options)
        : base(options)
    {
    }

    public DbSet<FactDisputeSummary> FactDisputeSummaries { get; set; }

    public DbSet<FactTimeStatistic> FactTimeStatistics { get; set; }

    public DbSet<FactHearingSummary> FactHearingSummaries { get; set; }

    public DbSet<FactIntakeProcessing> FactIntakeProcessings { get; set; }

    public DbSet<FactResolutionService> FactResolutionServices { get; set; }

    public DbSet<FactIssueOutcome> FactIssueOutcomes { get; set; }

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
        modelBuilder.ApplyIndexes();
        modelBuilder.ApplyColumnsCustomTypes();
        modelBuilder.ApplyUniqueIndexes();
    }
}