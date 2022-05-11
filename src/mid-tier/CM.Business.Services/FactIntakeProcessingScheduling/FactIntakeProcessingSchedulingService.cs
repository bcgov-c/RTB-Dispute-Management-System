using System;
using System.Threading.Tasks;
using CM.Messages.DataWarehouse.Events;
using EasyNetQ;
using Serilog;

namespace CM.Business.Services.FactIntakeProcessingScheduling;

public class FactIntakeProcessingSchedulingService : IFactIntakeProcessingSchedulingService
{
    private readonly IBus _bus;

    public FactIntakeProcessingSchedulingService(IBus bus)
    {
        _bus = bus;
    }

    public Task<bool> ProcessFactIntakeProcessing()
    {
        var message = new FactIntakeProcessingIntegrationEvent();

        Publish(message);

        return System.Threading.Tasks.Task.FromResult(true);
    }

    protected void Publish(FactIntakeProcessingIntegrationEvent message)
    {
        _bus.PubSub.PublishAsync(message)
            .ContinueWith(task =>
            {
                if (task.IsCompleted)
                {
                    Log.Information("Fact Intake Processing event: {CorrelationGuid}", message.CorrelationGuid);
                }
                if (task.IsFaulted)
                {
                    Log.Error(task.Exception, "CorrelationGuid = {CorrelationGuid}", message.CorrelationGuid);
                    throw new Exception($"CorrelationGuid = {message.CorrelationGuid} exception", task.Exception);
                }
            });
    }
}