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

namespace CM.Services.DataWarehouse.FactDisputeService.IntegrationEvents.EventHandling
{
    public class FactResolutionServiceIntegrationEventHandler : IConsumeAsync<FactResolutionServiceIntegrationEvent>
    {
        private readonly FactResolutionServiceConfig _appSettings;
        private readonly IUnitOfWorkDataWarehouse _dwUnitOfWork;
        private readonly ILogger _logger;
        private readonly IUnitOfWork _unitOfWork;

        public FactResolutionServiceIntegrationEventHandler(IUnitOfWork unitOfWork, IUnitOfWorkDataWarehouse dwUnitOfWork, ILogger logger, IOptions<FactResolutionServiceConfig> appSettings)
        {
            _unitOfWork = unitOfWork;
            _dwUnitOfWork = dwUnitOfWork;
            _logger = logger;
            _appSettings = appSettings.Value;
        }

        [AutoSubscriberConsumer(SubscriptionId = "FactResolutionService")]
        public async Task ConsumeAsync(FactResolutionServiceIntegrationEvent message, CancellationToken cancellationToken = default)
        {
            var log = _logger.ForContext("CorrelationGuid", message.CorrelationGuid);
            log.EventMessage("FactResolutionService Integration Event Received", message);

            var dateDelay = _appSettings.DateDelay;
            var factResolutionServiceManager = new FactResolutionServiceManager(_unitOfWork, _dwUnitOfWork, log);
            await factResolutionServiceManager.Record(dateDelay);
        }
    }
}
