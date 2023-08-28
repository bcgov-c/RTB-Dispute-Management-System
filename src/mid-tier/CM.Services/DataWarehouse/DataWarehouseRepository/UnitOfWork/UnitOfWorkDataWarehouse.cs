using System.Data.Common;
using System.Threading.Tasks;
using CM.Services.DataWarehouse.DataWarehouseDataModel;
using CM.Services.DataWarehouse.DataWarehouseRepository.DimCity;
using CM.Services.DataWarehouse.DataWarehouseRepository.DimTime;
using CM.Services.DataWarehouse.DataWarehouseRepository.FactDisputeSummary;
using CM.Services.DataWarehouse.DataWarehouseRepository.FactHearingSummary;
using CM.Services.DataWarehouse.DataWarehouseRepository.FactIntakeProcessing;
using CM.Services.DataWarehouse.DataWarehouseRepository.FactIssueOutcome;
using CM.Services.DataWarehouse.DataWarehouseRepository.FactResolutionService;
using CM.Services.DataWarehouse.DataWarehouseRepository.FactTimeStatistic;
using CM.Services.DataWarehouse.DataWarehouseRepository.LoadingHistory;

namespace CM.Services.DataWarehouse.DataWarehouseRepository.UnitOfWork;

public class UnitOfWorkDataWarehouse : IUnitOfWorkDataWarehouse
{
    private readonly DataWarehouseContext _context;

    private readonly IDimCityRepository _dimCityRepository = null;

    private readonly IDimTimeRepository _dimTimeRepository = null;

    private readonly IFactDisputeSummaryRepository _factDisputeSummaryRepository = null;

    private readonly IFactHearingSummaryRepository _factHearingSummaryRepository = null;

    private readonly IFactIntakeProcessingRepository _factIntakeProcessingRepository = null;

    private readonly IFactResolutionServiceRepository _factResolutionServiceRepository = null;

    private readonly IFactTimeStatisticRepository _factTimeStatisticRepository = null;

    private readonly IFactIssueOutcomeRepository _factIssueOutcomeRepository = null;

    private readonly ILoadingHistoryRepository _loadingHistoryRepository = null;

    public UnitOfWorkDataWarehouse(DataWarehouseContext context)
    {
        _context = context;
    }

    public IFactDisputeSummaryRepository FactDisputeSummaryRepository => _factDisputeSummaryRepository ?? new FactDisputeSummaryRepository(_context);

    public IFactTimeStatisticRepository FactTimeStatisticRepository => _factTimeStatisticRepository ?? new FactTimeStatisticRepository(_context);

    public IFactHearingSummaryRepository FactHearingSummaryRepository => _factHearingSummaryRepository ?? new FactHearingSummaryRepository(_context);

    public IFactIntakeProcessingRepository FactIntakeProcessingRepository => _factIntakeProcessingRepository ?? new FactIntakeProcessingRepository(_context);

    public IFactResolutionServiceRepository FactResolutionServiceRepository => _factResolutionServiceRepository ?? new FactResolutionServiceRepository(_context);

    public IFactIssueOutcomeRepository FactIssueOutcomeRepository => _factIssueOutcomeRepository ?? new FactIssueOutcomeRepository(_context);

    public IDimTimeRepository DimTimeRepository => _dimTimeRepository ?? new DimTimeRepository(_context);

    public IDimCityRepository DimCityRepository => _dimCityRepository ?? new DimCityRepository(_context);

    public ILoadingHistoryRepository LoadingHistoryRepository => _loadingHistoryRepository ?? new LoadingHistoryRepository(_context);

    public async Task<int> Complete()
    {
        await using var scope = await _context.Database.BeginTransactionAsync();

        try
        {
            var res = await _context.SaveChangesAsync();
            await scope.CommitAsync();

            return res;
        }
        catch (DbException ex)
        {
            await scope.RollbackAsync();

            return await Task.FromResult(ex.ErrorCode);
        }
    }
}