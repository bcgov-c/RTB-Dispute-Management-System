﻿using System.Collections.Generic;
using System.Linq;
using CM.Common.Utilities;
using CM.Data.Model;

namespace CM.Services.DataWarehouse.FactDisputeService.Helper;

public static class Utils
{
    internal static int GetTasksAverageDuration(List<Task> tasks)
    {
        var totalCount = tasks.Count(x => x.DateTaskCompleted != null);
        double totalDuration = 0;

        foreach (var task in tasks)
        {
            if (task.DateTaskCompleted == null || task.CreatedDate == null)
            {
                continue;
            }

            var span = task.DateTaskCompleted.Value - task.CreatedDate.Value;
            totalDuration += span.TotalMinutes;
        }

        return totalCount > 0 ? (int)(totalDuration / totalCount) : 0;
    }

    internal static int GetEvidenceOverridesOnCount(List<DisputeStatus> disputeStatuses)
    {
        var count = disputeStatuses.Where(x => x.EvidenceOverride == 1).DistinctBy(x => x.DisputeGuid).Count();

        return count;
    }

    internal static int GetAverageDeliveryTime(List<OutcomeDocDelivery> outcomeDocDeliveries)
    {
        double time = 0;
        var count = 0;

        foreach (var delivery in outcomeDocDeliveries)
        {
            if (delivery.ReceivedDate.HasValue && delivery.DeliveryDate.HasValue)
            {
                var span = delivery.ReceivedDate.Value - delivery.DeliveryDate.Value;
                time += span.TotalMinutes;
                count += 1;
            }
        }

        if (count > 0)
        {
            return (int)(time / count);
        }

        return 0;
    }

    internal static int GetStatusesTotalOpenTime(List<DisputeStatus> disputeStatuses)
    {
        var total = 0;
        var notAllowedStatuses = new byte[] { 103, 90, 91, 94 };

        var filteredStatuses = disputeStatuses
            .Where(x => !notAllowedStatuses.Contains(x.Status) &&
                        x.Stage != (byte)DisputeStage.ApplicationInProgress &&
                        x.DurationSeconds.HasValue);
        total = filteredStatuses.Sum(x => x.DurationSeconds.Value);

        return total / Constants.SecondsInMinute;
    }

    internal static int GetStatusesTotalTime(List<DisputeStatus> disputeStatuses)
    {
        var total = 0;

        var statuses = new[]
        {
            DisputeStatuses.Received,
            DisputeStatuses.AssessingApplication,
            DisputeStatuses.ConfirmingInformation,
            DisputeStatuses.ReadyForScheduling,
            DisputeStatuses.DocumentReadyToSend,
            DisputeStatuses.PartialProofOfService,
            DisputeStatuses.WaitingProcessDecision,
            DisputeStatuses.ToBeRescheduled,
            DisputeStatuses.Adjourned,
            DisputeStatuses.Deleted,
            DisputeStatuses.PostDecisionApplicationRequested
        };

        for (var i = 1; i < disputeStatuses.Count - 1; i++)
        {
            if (statuses.Contains((DisputeStatuses)disputeStatuses[i].Status))
            {
                var durationSeconds = disputeStatuses[i].DurationSeconds;

                if (durationSeconds != null)
                {
                    total += durationSeconds.Value;
                }
            }
        }

        return total / Constants.SecondsInMinute;
    }

    internal static int GetStatusesTotalArbTime(List<DisputeStatus> disputeStatuses)
    {
        var total = 0;

        var statuses = new[]
        {
            DisputeStatuses.WaitingDismissalDecision,
            DisputeStatuses.AssignedForHearing,
            DisputeStatuses.ProcessDecisionRequired,
            DisputeStatuses.DecisionPending,
            DisputeStatuses.InterimDecisionPending,
            DisputeStatuses.ClarificationDecisionPending,
            DisputeStatuses.CorrectionDecisionPending
        };

        for (var i = 1; i < disputeStatuses.Count - 1; i++)
        {
            if (statuses.Contains((DisputeStatuses)disputeStatuses[i].Status))
            {
                var durationSeconds = disputeStatuses[i].DurationSeconds;

                if (durationSeconds != null)
                {
                    total += durationSeconds.Value;
                }
            }
        }

        return total / Constants.SecondsInMinute;
    }
}