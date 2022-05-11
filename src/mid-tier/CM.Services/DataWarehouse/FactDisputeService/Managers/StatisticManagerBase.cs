using System;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;
using CM.Services.DataWarehouse.DataWarehouseRepository.UnitOfWork;
using Serilog;

namespace CM.Services.DataWarehouse.FactDisputeService.Managers;

public abstract class StatisticManagerBase
{
    protected StatisticManagerBase(IUnitOfWork unitOfWork, IUnitOfWorkDataWarehouse dwUnitOfWork, ILogger logger)
    {
        UnitOfWork = unitOfWork;
        DwUnitOfWork = dwUnitOfWork;
        Logger = logger;
        LoadingHistoryManager = new LoadingHistoryManager(dwUnitOfWork, logger);
    }

    protected IUnitOfWork UnitOfWork { get; }

    protected LoadingHistoryManager LoadingHistoryManager { get; }

    protected IUnitOfWorkDataWarehouse DwUnitOfWork { get; }

    private ILogger Logger { get; }

    protected void LogInformation(string message)
    {
        Logger.Information("{Name}: {Message}", GetType().Name, message);
    }

    protected void LogError(string message, Exception exc)
    {
        Logger.Error(exc, "{Name}: {Message}", GetType().Name, message);
    }

    protected async Task<int?> GetTimeIdAsync(DateTime? date)
    {
        try
        {
            if (!date.HasValue)
            {
                return null;
            }

            var dateId = await DwUnitOfWork.DimTimeRepository.GetIdByDate(date.Value);

            if (dateId == Constants.NotFoundOrIncorrect)
            {
                return null;
            }

            return dateId;
        }
        catch (Exception ex)
        {
            Logger.Error(ex, "Method=GetTimeIdAsync");
        }

        return null;
    }
}