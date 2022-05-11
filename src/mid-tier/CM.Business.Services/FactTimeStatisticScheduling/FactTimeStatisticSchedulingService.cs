using System;
using System.Threading.Tasks;
using CM.Messages.DataWarehouse.Events;
using EasyNetQ;
using Serilog;

namespace CM.Business.Services.FactTimeStatisticScheduling;

public class FactTimeStatisticSchedulingService : IFactTimeStatisticSchedulingService
{
    private readonly IBus _bus;

    public FactTimeStatisticSchedulingService(IBus bus)
    {
        _bus = bus;
    }

    public Task<bool> ProcessFactTimeStatistic()
    {
        var message = new FactTimeStatisticsIntegrationEvent();

        Publish(message);

        return System.Threading.Tasks.Task.FromResult(true);
    }

    protected void Publish(FactTimeStatisticsIntegrationEvent message)
    {
        _bus.PubSub.PublishAsync(message)
            .ContinueWith(task =>
            {
                if (task.IsCompleted)
                {
                    Log.Information("Fact Time Statistic event: {CorrelationGuid}", message.CorrelationGuid);
                }
                if (task.IsFaulted)
                {
                    Log.Error(task.Exception, "CorrelationGuid = {CorrelationGuid}", message.CorrelationGuid);
                    throw new Exception($"CorrelationGuid = {message.CorrelationGuid} exception", task.Exception);
                }
            });
    }
}