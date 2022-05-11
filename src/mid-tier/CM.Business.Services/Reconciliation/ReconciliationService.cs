using CM.Messages.ReconciliationReportGenerator.Events;
using EasyNetQ;
using Serilog;

namespace CM.Business.Services.Reconciliation;

public class ReconciliationService : IReconciliationService
{
    private readonly IBus _bus;

    public ReconciliationService(IBus bus)
    {
        _bus = bus;
    }

    public async System.Threading.Tasks.Task BuildReport()
    {
        var reconciliationEvent = new ReconciliationReportGenerationEvent();

        await Publish(reconciliationEvent);
    }

    protected async System.Threading.Tasks.Task Publish(ReconciliationReportGenerationEvent message)
    {
        await _bus.PubSub.PublishAsync(message)
            .ContinueWith(task =>
            {
                if (task.IsCompleted)
                {
                    Log.Information("Publish reconciliation report generation event {CorrelationGuid}", message.CorrelationGuid);
                }
                if (task.IsFaulted)
                {
                    Log.Error(task.Exception, "Publish reconciliation fail");
                }
            });
    }
}