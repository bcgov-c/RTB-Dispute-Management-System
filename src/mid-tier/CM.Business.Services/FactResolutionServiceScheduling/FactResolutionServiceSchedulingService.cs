using System;
using System.Threading.Tasks;
using CM.Messages.DataWarehouse.Events;
using EasyNetQ;
using Serilog;

namespace CM.Business.Services.FactResolutionServiceScheduling
{
    public class FactResolutionServiceSchedulingService : IFactResolutionServiceSchedulingService
    {
        private readonly IBus _bus;

        public FactResolutionServiceSchedulingService(IBus bus)
        {
            _bus = bus;
        }

        public Task<bool> ProcessFactResolutionService()
        {
            var message = new FactResolutionServiceIntegrationEvent();

            Publish(message);

            return System.Threading.Tasks.Task.FromResult(true);
        }

        protected void Publish(FactResolutionServiceIntegrationEvent message)
        {
            _bus.PubSub.PublishAsync(message)
                .ContinueWith(task =>
                {
                    if (task.IsCompleted)
                    {
                        Log.Information("Fact Resolution Service event: {CorrelationGuid}", message.CorrelationGuid);
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
