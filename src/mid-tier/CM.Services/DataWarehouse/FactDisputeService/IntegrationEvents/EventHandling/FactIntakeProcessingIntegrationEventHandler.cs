using System.Threading;
using System.Threading.Tasks;
using CM.Data.Repositories.UnitOfWork;
using CM.Messages.DataWarehouse.Events;
using CM.ServiceBase;
using CM.Services.DataWarehouse.DataWarehouseRepository.UnitOfWork;
using CM.Services.DataWarehouse.FactDisputeService.Managers;
using EasyNetQ.AutoSubscribe;
using Serilog;

namespace CM.Services.DataWarehouse.FactDisputeService.IntegrationEvents.EventHandling;

public class FactIntakeProcessingIntegrationEventHandler : IConsumeAsync<FactIntakeProcessingIntegrationEvent>
{
    private readonly IUnitOfWorkDataWarehouse _dwUnitOfWork;
    private readonly ILogger _logger;
    private readonly IUnitOfWork _unitOfWork;

    public FactIntakeProcessingIntegrationEventHandler(IUnitOfWork unitOfWork, IUnitOfWorkDataWarehouse dwUnitOfWork, ILogger logger)
    {
        _unitOfWork = unitOfWork;
        _dwUnitOfWork = dwUnitOfWork;
        _logger = logger;
    }

    [AutoSubscriberConsumer(SubscriptionId = "FactIntakeProcessing")]
    public async Task ConsumeAsync(FactIntakeProcessingIntegrationEvent message, CancellationToken cancellationToken = default)
    {
        var log = _logger.ForContext("CorrelationGuid", message.CorrelationGuid);
        log.EventMessage("DataWarehouse FactTimeStatistics Integration Event Received", message);

        var factIntakeProcessingManager = new FactIntakeProcessingManager(_unitOfWork, _dwUnitOfWork, log);
        await factIntakeProcessingManager.RecordAsync();
    }
}