using System;
using System.Threading.Tasks;
using CM.Messages.DataWarehouse.Events;
using EasyNetQ;
using Serilog;

namespace CM.Business.Services.FactHearingSummaryScheduling;

public class FactHearingSummarySchedulingService : IFactHearingSummarySchedulingService
{
    private readonly IBus _bus;

    public FactHearingSummarySchedulingService(IBus bus)
    {
        _bus = bus;
    }

    public Task<bool> ProcessFactHearingSummary()
    {
        var message = new FactHearingSummaryIntegrationEvent();

        Publish(message);

        return System.Threading.Tasks.Task.FromResult(true);
    }

    protected void Publish(FactHearingSummaryIntegrationEvent message)
    {
        _bus.PubSub.PublishAsync(message)
            .ContinueWith(task =>
            {
                if (task.IsCompleted)
                {
                    Log.Information("Fact Hearing Summary event: {CorrelationGuid}", message.CorrelationGuid);
                }
                if (task.IsFaulted)
                {
                    Log.Error(task.Exception, "CorrelationGuid = {CorrelationGuid}", message.CorrelationGuid);
                    throw new Exception($"CorrelationGuid = {message.CorrelationGuid} exception", task.Exception);
                }
            });
    }
}