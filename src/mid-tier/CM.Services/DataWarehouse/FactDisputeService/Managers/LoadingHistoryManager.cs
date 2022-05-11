using System;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Services.DataWarehouse.DataWarehouseDataModel.Models;
using CM.Services.DataWarehouse.DataWarehouseRepository.UnitOfWork;
using CM.Services.DataWarehouse.FactDisputeService.Helper;
using Serilog;

namespace CM.Services.DataWarehouse.FactDisputeService.Managers;

public class LoadingHistoryManager
{
    private const int ErrorMessageMaxLenght = 199;

    private readonly IUnitOfWorkDataWarehouse _dwUnitOfWork;
    private readonly ILogger _logger;

    public LoadingHistoryManager(IUnitOfWorkDataWarehouse dwUnitOfWork, ILogger logger)
    {
        _dwUnitOfWork = dwUnitOfWork;
        _logger = logger;
    }

    public async Task<int> InsertLoadingHistory(FactTable table)
    {
        var loadingHistory = new LoadingHistory
        {
            FactTableId = (int)table,
            FactTableName = table.ToString(),
            LoadStartDateTime = DateTime.UtcNow,
            LastStatus = (int)LoadingHistoryStatus.Initializing
        };

        await _dwUnitOfWork.LoadingHistoryRepository.InsertAsync(loadingHistory);
        var res = await _dwUnitOfWork.Complete();

        if (res.CheckSuccess())
        {
            _logger.Information("History Created Id: {LoadingEventId}, Table: {FactTableName}", loadingHistory.LoadingEventId, loadingHistory.FactTableName);

            return loadingHistory.LoadingEventId;
        }

        return 0;
    }

    public async Task UpdateLoadingHistory(
        int loadingEventId,
        LoadingHistoryStatus status,
        string outcomeText,
        int totalRecords)
    {
        var currentHistory = await _dwUnitOfWork.LoadingHistoryRepository.GetByIdAsync(loadingEventId);

        try
        {
            currentHistory.LastStatus = (int)status;
            _logger.Information("{Status}", status.ToString());
            currentHistory.LoadEndDateTime = DateTime.UtcNow;
            currentHistory.OutcomeText = outcomeText.Truncate(ErrorMessageMaxLenght);
            _logger.Information("{OutcomeText}", outcomeText.Truncate(ErrorMessageMaxLenght));
            currentHistory.TotalRecordsLoaded = totalRecords;
            _logger.Information("{TotalRecords}", totalRecords.ToString());

            _dwUnitOfWork.LoadingHistoryRepository.Update(currentHistory);
            _logger.Information("Before Complete Updates");
            var res = await _dwUnitOfWork.Complete();

            if (res.CheckSuccess())
            {
                _logger.Information("History Updated Id: {LoadingEventId}, Table: {FactTableName}", currentHistory.LoadingEventId, currentHistory.FactTableName);
            }
            else
            {
                _logger.Error("History Update Failed Id: {LoadingEventId}, Table: {FactTableName}", currentHistory.LoadingEventId, currentHistory.FactTableName);
            }
        }
        catch (Exception e)
        {
            _logger.Error(e, "History Update Failed Id: {LoadingEventId}, Table: {FactTableName}", currentHistory.LoadingEventId, currentHistory.FactTableName);
        }
    }
}