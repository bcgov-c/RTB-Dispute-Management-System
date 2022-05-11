using System.Threading;
using System.Threading.Tasks;
using CM.Data.Repositories.UnitOfWork;
using CM.Messages.DataWarehouse.Events;
using CM.ServiceBase;
using CM.Services.DataWarehouse.DataWarehouseRepository.UnitOfWork;
using CM.Services.DataWarehouse.FactDisputeService.Configuration;
using CM.Services.DataWarehouse.FactDisputeService.Managers;
using EasyNetQ.AutoSubscribe;
using Microsoft.Extensions.Options;
using Serilog;

namespace CM.Services.DataWarehouse.FactDisputeService.IntegrationEvents.EventHandling;

public class DataWarehouseIntegrationEventHandler : IConsumeAsync<DataWarehouseIntegrationEvent>
{
    private readonly FactDisputeSummaryConfig _appSettings;
    private readonly IUnitOfWorkDataWarehouse _dwUnitOfWork;
    private readonly ILogger _logger;
    private readonly IUnitOfWork _unitOfWork;

    public DataWarehouseIntegrationEventHandler(IUnitOfWork unitOfWork, IUnitOfWorkDataWarehouse dwUnitOfWork, ILogger logger, IOptions<FactDisputeSummaryConfig> appSettings)
    {
        _unitOfWork = unitOfWork;
        _dwUnitOfWork = dwUnitOfWork;
        _logger = logger;
        _appSettings = appSettings.Value;
    }

    [AutoSubscriberConsumer(SubscriptionId = "DataWarehouse")]
    public async Task ConsumeAsync(DataWarehouseIntegrationEvent message, CancellationToken cancellationToken = default)
    {
        var log = _logger.ForContext("CorrelationGuid", message.CorrelationGuid);
        log.EventMessage("DataWarehouse Integration Event Received", message);

        var dateDelay = _appSettings.DateDelay;
        var existedDisputes = await _dwUnitOfWork.FactDisputeSummaryRepository.GetDisputes();

        var factDisputeSummaryManager = new FactDisputeSummaryManager(_unitOfWork, _dwUnitOfWork, log);
        await factDisputeSummaryManager.RecordClosedDisputes(existedDisputes, dateDelay);
    }
}