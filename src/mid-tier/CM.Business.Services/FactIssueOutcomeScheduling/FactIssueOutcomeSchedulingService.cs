using System;
using System.Threading.Tasks;
using CM.Messages.DataWarehouse.Events;
using EasyNetQ;
using Serilog;

namespace CM.Business.Services.FactIssueOutcomeScheduling
{
    public class FactIssueOutcomeSchedulingService : IFactIssueOutcomeSchedulingService
    {
        private readonly IBus _bus;

        public FactIssueOutcomeSchedulingService(IBus bus)
        {
            _bus = bus;
        }

        public Task<bool> ProcessFactIssueOutcome()
        {
            var message = new FactIssueOutcomeIntegrationEvent();

            Publish(message);

            return System.Threading.Tasks.Task.FromResult(true);
        }

        protected void Publish(FactIssueOutcomeIntegrationEvent message)
        {
            _bus.PubSub.PublishAsync(message)
                .ContinueWith(task =>
                {
                    if (task.IsCompleted)
                    {
                        Log.Information("Fact Issue Outcome event: {CorrelationGuid}", message.CorrelationGuid);
                    }
                    if (task.IsFaulted)
                    {
                        Log.Error(task.Exception, "CorrelationGuid = {CorrelationGuid}", message.CorrelationGuid);
                        throw new Exception($"CorrelationGuid = {message.CorrelationGuid} exception", task.Exception);
                    }
                });
        }
    }
}
