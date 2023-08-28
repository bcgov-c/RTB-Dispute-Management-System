using System.Threading.Tasks;
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

public interface IUnitOfWorkDataWarehouse
{
    IFactDisputeSummaryRepository FactDisputeSummaryRepository { get; }

    IFactTimeStatisticRepository FactTimeStatisticRepository { get; }

    IFactHearingSummaryRepository FactHearingSummaryRepository { get; }

    IFactIntakeProcessingRepository FactIntakeProcessingRepository { get; }

    IFactResolutionServiceRepository FactResolutionServiceRepository { get; }

    IFactIssueOutcomeRepository FactIssueOutcomeRepository { get; }

    IDimTimeRepository DimTimeRepository { get; }

    IDimCityRepository DimCityRepository { get; }

    ILoadingHistoryRepository LoadingHistoryRepository { get; }

    Task<int> Complete();
}