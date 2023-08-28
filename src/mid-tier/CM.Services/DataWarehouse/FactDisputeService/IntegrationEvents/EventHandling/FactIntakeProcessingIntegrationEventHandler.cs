using System;
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

public class FactIntakeProcessingIntegrationEventHandler : IConsumeAsync<FactIntakeProcessingIntegrationEvent>
{
    private readonly FactIntakeProcessingConfig _appSettings;
    private readonly IUnitOfWorkDataWarehouse _dwUnitOfWork;
    private readonly ILogger _logger;
    private readonly IUnitOfWork _unitOfWork;

    public FactIntakeProcessingIntegrationEventHandler(IUnitOfWork unitOfWork, IUnitOfWorkDataWarehouse dwUnitOfWork, ILogger logger, IOptions<FactIntakeProcessingConfig> appSettings)
    {
        _unitOfWork = unitOfWork;
        _dwUnitOfWork = dwUnitOfWork;
        _logger = logger;
        _appSettings = appSettings.Value;
    }

    [AutoSubscriberConsumer(SubscriptionId = "FactIntakeProcessing")]
    public async Task ConsumeAsync(FactIntakeProcessingIntegrationEvent message, CancellationToken cancellationToken = default)
    {
        var log = _logger.ForContext("CorrelationGuid", message.CorrelationGuid);
        log.EventMessage("DataWarehouse FactTimeStatistics Integration Event Received", message);

        var prevDayStart = _appSettings.PrevDayStart_UTC;
        var prevDayEnd = _appSettings.PrevDayEnd_UTC;

        var factIntakeProcessingManager = new FactIntakeProcessingManager(_unitOfWork, _dwUnitOfWork, log);
        await factIntakeProcessingManager.RecordAsync(prevDayStart, prevDayEnd);
    }
}