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

public class FactHearingSummaryIntegrationEventHandler : IConsumeAsync<FactHearingSummaryIntegrationEvent>
{
    private readonly FactHearingSummaryConfig _appSettings;
    private readonly IUnitOfWorkDataWarehouse _dwUnitOfWork;
    private readonly ILogger _logger;
    private readonly IUnitOfWork _unitOfWork;

    public FactHearingSummaryIntegrationEventHandler(IUnitOfWork unitOfWork, IUnitOfWorkDataWarehouse dwUnitOfWork, ILogger logger, IOptions<FactHearingSummaryConfig> appSettings)
    {
        _unitOfWork = unitOfWork;
        _dwUnitOfWork = dwUnitOfWork;
        _logger = logger;
        _appSettings = appSettings.Value;
    }

    [AutoSubscriberConsumer(SubscriptionId = "FactHearingSummary")]
    public async Task ConsumeAsync(FactHearingSummaryIntegrationEvent message, CancellationToken cancellationToken = default)
    {
        var log = _logger.ForContext("CorrelationGuid", message.CorrelationGuid);
        log.EventMessage("FactHearingSummary Integration Event Received", message);

        var dateDelay = _appSettings.DateDelay;
        var factHearingSummaryManager = new FactHearingSummaryManager(_unitOfWork, _dwUnitOfWork, log);
        await factHearingSummaryManager.Record(dateDelay);
    }
}