using System;
using System.Threading.Tasks;
using CM.Messages.DataWarehouse.Events;
using EasyNetQ;
using Serilog;

namespace CM.Business.Services.DataWarehouseScheduling;

public class DataWarehouseSchedulingService : IDataWarehouseSchedulingService
{
    private readonly IBus _bus;

    public DataWarehouseSchedulingService(IBus bus)
    {
        _bus = bus;
    }

    public Task<bool> ProcessFactDispute()
    {
        var message = new DataWarehouseIntegrationEvent();

        Publish(message);

        return System.Threading.Tasks.Task.FromResult(true);
    }

    protected void Publish(DataWarehouseIntegrationEvent message)
    {
        _bus.PubSub.PublishAsync(message)
            .ContinueWith(task =>
            {
                if (task.IsCompleted)
                {
                    Log.Information("Fact Dispute Tables event: {CorrelationGuid}", message.CorrelationGuid);
                }
                if (task.IsFaulted)
                {
                    Log.Error(task.Exception, "CorrelationGuid = {CorrelationGuid}", message.CorrelationGuid);
                    throw new Exception($"CorrelationGuid = {message.CorrelationGuid} exception", task.Exception);
                }
            });
    }
}