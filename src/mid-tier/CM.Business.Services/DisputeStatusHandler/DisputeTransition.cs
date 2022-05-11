using System;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Messages.EmailGenerator.Events;
using EasyNetQ;
using Serilog;

namespace CM.Business.Services.DisputeStatusHandler;

public abstract class DisputeTransition
{
    protected DisputeTransition(
        DisputeStage fromDisputeStage,
        DisputeStatuses fromDisputeStatus,
        DisputeStage toDisputeStage,
        DisputeStatuses toDisputeStatus,
        DisputeProcess process,
        IBus messageBus)
    {
        FromDisputeStatus = fromDisputeStatus;
        FromDisputeStage = fromDisputeStage;
        ToDisputeStatus = toDisputeStatus;
        ToDisputeStage = toDisputeStage;
        Process = process;
        MessageBus = messageBus;
    }

    private DisputeStatuses FromDisputeStatus { get; }

    private DisputeStage FromDisputeStage { get; }

    private DisputeStatuses ToDisputeStatus { get; }

    private DisputeStage ToDisputeStage { get; }

    private DisputeProcess Process { get; }

    private IBus MessageBus { get; }

    private DisputeTransition Next { get; set; }

    public DisputeTransition SetNext(DisputeTransition nextTransition)
    {
        Next = nextTransition;
        return nextTransition;
    }

    public void Message(DisputeStatus fromDisputeStatus, DisputeStatus toDisputeStatus, Dispute dispute)
    {
        if (fromDisputeStatus == null || toDisputeStatus == null)
        {
            return;
        }

        if (fromDisputeStatus.Stage != null && toDisputeStatus.Stage != null && fromDisputeStatus.Process != null)
        {
            if ((FromDisputeStatus == (DisputeStatuses)fromDisputeStatus.Status || FromDisputeStatus == DisputeStatuses.Any) &&
                (FromDisputeStage == (DisputeStage)fromDisputeStatus.Stage || FromDisputeStage == DisputeStage.Any) &&
                (ToDisputeStatus == (DisputeStatuses)toDisputeStatus.Status || ToDisputeStatus == DisputeStatuses.Any) &&
                (ToDisputeStage == (DisputeStage)toDisputeStatus.Stage || ToDisputeStage == DisputeStage.Any) &&
                (Process == (DisputeProcess)fromDisputeStatus.Process || Process == DisputeProcess.Any))
            {
                Handle(dispute);
            }
        }

        Next?.Message(fromDisputeStatus, toDisputeStatus, dispute);
    }

    protected abstract void Handle(Dispute dispute);

    protected void Publish(EmailGenerateIntegrationEvent message)
    {
        MessageBus.PubSub.PublishAsync(message)
            .ContinueWith(task =>
            {
                if (task.IsCompleted)
                {
                    Log.Information("Publish email generation event: {CorrelationGuid} {DisputeGuid} {AssignedTemplateId}", message.CorrelationGuid, message.DisputeGuid, message.AssignedTemplateId);
                }
                if (task.IsFaulted)
                {
                    Log.Error(task.Exception, "CorrelationGuid = {CorrelationGuid}", message.CorrelationGuid);
                    throw new Exception($"CorrelationGuid = {message.CorrelationGuid} exception", task.Exception);
                }
            });
    }
}