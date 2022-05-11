using System.Threading;
using System.Threading.Tasks;
using CM.Data.Repositories.UnitOfWork;
using CM.Messages.DataWarehouse.Events;
using CM.ServiceBase;
using CM.Services.DataWarehouse.DataWarehouseRepository.UnitOfWork;
using CM.Services.DataWarehouse.FactTimeStatistics.Manager;
using EasyNetQ.AutoSubscribe;
using Serilog;

namespace CM.Services.DataWarehouse.FactTimeStatistics.IntegrationEvents.EventHandling
{
    public class FactTimeStatisticsIntegrationEventHandler : IConsumeAsync<FactTimeStatisticsIntegrationEvent>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUnitOfWorkDataWarehouse _dwUnitOfWork;
        private readonly ILogger _logger;

        public FactTimeStatisticsIntegrationEventHandler(IUnitOfWork unitOfWork, IUnitOfWorkDataWarehouse dwUnitOfWork, ILogger logger)
        {
            _unitOfWork = unitOfWork;
            _dwUnitOfWork = dwUnitOfWork;
            _logger = logger;
        }

        [AutoSubscriberConsumer(SubscriptionId = "FactTimeStatistics")]
        public async Task ConsumeAsync(FactTimeStatisticsIntegrationEvent message, CancellationToken cancellationToken = default)
        {
            var log = _logger.ForContext("CorrelationGuid", message.CorrelationGuid);
            log.EventMessage("DataWarehouse FactTimeStatistics Integration Event Received", message);

            await FactTimeStatisticManager.Record(_unitOfWork, _dwUnitOfWork, log);
        }
    }
}
