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
    public class FactIssueOutcomeIntegrationEventHandler : IConsumeAsync<FactIssueOutcomeIntegrationEvent>
    {
        private readonly FactIssueOutcomeConfig _appSettings;
        private readonly IUnitOfWorkDataWarehouse _dwUnitOfWork;
        private readonly ILogger _logger;
        private readonly IUnitOfWork _unitOfWork;

        public FactIssueOutcomeIntegrationEventHandler(IUnitOfWork unitOfWork, IUnitOfWorkDataWarehouse dwUnitOfWork, ILogger logger, IOptions<FactIssueOutcomeConfig> appSettings)
        {
            _unitOfWork = unitOfWork;
            _dwUnitOfWork = dwUnitOfWork;
            _logger = logger;
            _appSettings = appSettings.Value;
        }

        [AutoSubscriberConsumer(SubscriptionId = "FactIssueOutcome")]
        public async Task ConsumeAsync(FactIssueOutcomeIntegrationEvent message, CancellationToken cancellationToken = default)
        {
            var log = _logger.ForContext("CorrelationGuid", message.CorrelationGuid);
            log.EventMessage("DataWarehouse Integration Event Received", message);

            var dateDelay = _appSettings.DateDelay;
            var disputes = await _dwUnitOfWork.FactIssueOutcomeRepository.GetDisputes();

            var factIssueOutcomeManager = new FactIssueOutcomeManager(_unitOfWork, _dwUnitOfWork, log);
            await factIssueOutcomeManager.Record(disputes, dateDelay);
        }
    }
}
