using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using CM.Business.Entities.Models.Dashboard;
using CM.Business.Entities.SharedModels;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.DisputeStatus;

public class DisputeStatusRepository : CmRepository<Model.DisputeStatus>, IDisputeStatusRepository
{
    public DisputeStatusRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<Model.DisputeStatus> GetDisputeLastStatusAsync(Guid disputeGuid)
    {
        var lastStatus = await Context.DisputeStatuses
            .FirstOrDefaultAsync(d => d.DisputeGuid == disputeGuid && d.IsActive);

        return lastStatus;
    }

    public async Task<List<Model.DisputeStatus>> GetDisputeStatuses(int? userId, DashboardSearchDisputesRequest request)
    {
        var statuses = request.StatusList?.Split(',');
        var stages = request.StageList?.Split(',');
        var processes = request.ProcessList?.Split(',');

        var predicate = PredicateBuilder.True<Model.DisputeStatus>();

        if (userId == null)
        {
            predicate = predicate.And(x => x.IsActive && (x.Owner == userId || x.Owner == 0));
        }
        else
        {
            predicate = predicate.And(x => x.IsActive && x.Owner == userId);
        }

        if (statuses != null)
        {
            predicate = predicate.And(x => statuses.Contains(x.Status.ToString()));
        }

        if (stages != null)
        {
            predicate = predicate.And(x => stages.Contains(x.Stage.ToString()));
        }

        if (processes != null)
        {
            predicate = predicate.And(x => processes.Contains(x.Process.ToString()));
        }

        if (request.DisputeUrgency != null)
        {
            predicate = predicate.And(x => x.Dispute.DisputeUrgency == request.DisputeUrgency);
        }

        if (request.CreationMethod != null)
        {
            predicate = predicate.And(x => x.Dispute.CreationMethod == request.CreationMethod);
        }

        Expression<Func<Model.DisputeStatus, dynamic>> orderBy = x => x.StatusStartDate;

        if (request.SortByDateField != null)
        {
            orderBy = request.SortByDateField switch
            {
                (byte)SortByDateFields.CreatedDate => x => x.Dispute.CreatedDate,
                (byte)SortByDateFields.InitialPaymentDate => x => x.Dispute.InitialPaymentDate,
                (byte)SortByDateFields.SubmittedDate => x => x.Dispute.SubmittedDate,
                (byte)SortByDateFields.OriginalNoticeDate => x => x.Dispute.OriginalNoticeDate,
                (byte)SortByDateFields.StatusStartDate => x => x.StatusStartDate,
                _ => orderBy
            };
        }

        var disputesStatuses = await Context.DisputeStatuses
            .Include(d => d.Dispute)
            .Where(predicate)
            .OrderBy(orderBy)
            .ToListAsync();

        return disputesStatuses;
    }

    public async Task<List<byte?>> GetDisputeProcesses(Guid disputeGuid)
    {
        var processes = await Context.DisputeStatuses
            .Where(d => d.DisputeGuid == disputeGuid)
            .Select(d => d.Process)
            .ToListAsync();

        return processes;
    }

    public async Task<List<Model.DisputeStatus>> GetAbandonedDisputeStatuses(int disputeAbandonedDays)
    {
        var abandonedDisputeStatuses = await Context.DisputeStatuses
            .Where(d => ((d.Status == (byte)DisputeStatuses.UpdateRequired && d.Stage == (byte)DisputeStage.ApplicationInProgress) ||
                         (d.Status == (byte)DisputeStatuses.PaperApplicationUpdateRequired && d.Stage == (byte)DisputeStage.ApplicationInProgress)) &&
                        d.StatusStartDate.AddDays(disputeAbandonedDays) < DateTime.UtcNow &&
                        d.IsActive)
            .ToListAsync();

        return abandonedDisputeStatuses;
    }

    public async Task<List<Model.DisputeStatus>> GetDisputeAbandonedForNoPaymentStatuses(int disputeAbandonedNoPaymentDays)
    {
        var abandonedForNoPaymentStatuses = await Context.DisputeStatuses
            .Where(d => ((d.Status == (byte)DisputeStatuses.PaymentRequired &&
                          d.Stage == (byte)DisputeStage.ApplicationInProgress) ||
                         (d.Status == (byte)DisputeStatuses.FeeWaiverProofRequired &&
                          d.Stage == (byte)DisputeStage.ApplicationInProgress) ||
                         (d.Status == (byte)DisputeStatuses.OfficePaymentRequired &&
                          d.Stage == (byte)DisputeStage.ApplicationInProgress)) &&
                        d.StatusStartDate.AddDays(disputeAbandonedNoPaymentDays) < DateTime.UtcNow &&
                        d.IsActive)
            .ToListAsync();

        return abandonedForNoPaymentStatuses;
    }

    public async Task<List<Model.DisputeStatus>> GetUniqueStatuses(Guid disputeGuid)
    {
        var statuses = await Context.DisputeStatuses
            .Where(x => x.DisputeGuid == disputeGuid)
            .AsEnumerable()
            .DistinctBy(x => new UniqueStatus { Status = x.Status, Stage = x.Stage, Process = x.Process })
            .ToListAsync();

        return statuses;
    }

    public async Task<List<Model.DisputeStatus>> GetDisputeAbandonedForNoServiceStatuses(int disputeAbandonedNoServiceDays)
    {
        var abandonedForNoPaymentStatuses = await Context.DisputeStatuses
            .Where(d =>
                d.Status == (byte)DisputeStatuses.WaitingForProofOfService &&
                d.Stage == (byte)DisputeStage.ServingDocuments &&
                d.StatusStartDate.AddDays(disputeAbandonedNoServiceDays) < DateTime.UtcNow &&
                d.IsActive)
            .ToListAsync();

        return abandonedForNoPaymentStatuses;
    }

    public async Task<List<Model.DisputeStatus>> GetDisputeForColdStorageMigrationStatuses(int closedDaysForColdStorage)
    {
        var abandonedForNoPaymentStatuses = await Context.DisputeStatuses
            .Where(d => (
                            (d.Status == (byte)DisputeStatuses.Withdrawn && d.Stage == (byte)DisputeStage.ApplicationInProgress) ||
                            (d.Status == (byte)DisputeStatuses.AbandonedNoPayment && d.Stage == (byte)DisputeStage.ApplicationInProgress) ||
                            (d.Status == (byte)DisputeStatuses.AbandonedApplicantInaction && d.Stage == (byte)DisputeStage.ApplicationInProgress) ||
                            (d.Status == (byte)DisputeStatuses.Withdrawn && d.Stage == (byte)DisputeStage.ApplicationScreening) ||
                            (d.Status == (byte)DisputeStatuses.CancelledByRtb && d.Stage == (byte)DisputeStage.ApplicationScreening) ||
                            (d.Status == (byte)DisputeStatuses.AbandonedApplicantInaction && d.Stage == (byte)DisputeStage.ApplicationScreening) ||
                            (d.Status == (byte)DisputeStatuses.Withdrawn && d.Stage == (byte)DisputeStage.ServingDocuments) ||
                            (d.Status == (byte)DisputeStatuses.Dismissed && d.Stage == (byte)DisputeStage.ServingDocuments) ||
                            (d.Status == (byte)DisputeStatuses.AbandonedApplicantInaction && d.Stage == (byte)DisputeStage.ServingDocuments) ||
                            (d.Status == (byte)DisputeStatuses.Withdrawn && d.Stage == (byte)DisputeStage.HearingPending) ||
                            (d.Status == (byte)DisputeStatuses.Withdrawn && d.Stage == (byte)DisputeStage.Hearing) ||
                            (d.Status == (byte)DisputeStatuses.Closed && d.Stage == (byte)DisputeStage.DecisionAndPostSupport)) &&
                        d.StatusStartDate.AddDays(closedDaysForColdStorage) < DateTime.UtcNow &&
                        d.Dispute.FilesStorageSetting == DisputeStorageType.Hot &&
                        d.IsActive)
            .ToListAsync();

        return abandonedForNoPaymentStatuses;
    }

    public async Task<List<Model.DisputeStatus>> GetStatusesByStatusStartDate(DateTime startDate, DateTime endDate)
    {
        var statuses = await Context
            .DisputeStatuses
            .Where(x => x.StatusStartDate >= startDate && x.StatusStartDate <= endDate && x.IsActive)
            .ToListAsync();

        return statuses;
    }

    public async Task<Model.DisputeStatus> GetOldestStatus(int[] oldStatuses)
    {
        var oldestStatus = await Context
            .DisputeStatuses
            .Where(x => oldStatuses.Contains(x.Status) && x.IsActive)
            .OrderBy(x => x.StatusStartDate)
            .FirstOrDefaultAsync();

        return oldestStatus;
    }

    public async Task<List<Model.DisputeStatus>> GetDisputeStatuses(int[] statuses)
    {
        var selectedStatuses = await Context
            .DisputeStatuses
            .Where(x => statuses.Contains(x.Status) && x.IsActive)
            .ToListAsync();

        return selectedStatuses;
    }

    public async Task<List<Model.DisputeStatus>> GetStageOpenDisputeStatuses(int?[] stages, int[] notContainsStatuses)
    {
        var selectedStatuses = await Context
            .DisputeStatuses
            .Where(x => stages.Contains(x.Stage) && !notContainsStatuses.Contains(x.Status) && x.IsActive)
            .ToListAsync();

        return selectedStatuses;
    }

    public async Task<bool> IsAdjournedDisputeStatusExists(Guid disputeGuid)
    {
        var isAdjournedStatusExists = await Context
            .DisputeStatuses
            .AnyAsync(x => x.DisputeGuid == disputeGuid && x.Status == (byte)DisputeStatuses.Adjourned);
        return isAdjournedStatusExists;
    }

    public async Task<int> GetDisputesCountLastChangesStatusFrom2(DateTime utcStart, DateTime utcEnd)
    {
        var strUtcStart = utcStart.ToString(CultureInfo.InvariantCulture);

        var sqlQuery = @$"WITH calc_processed AS (
SELECT 
    CASE 
        WHEN (prev_stage = 2 AND prev_status NOT IN (23) )
            AND (
                (""Stage"" = 0 and ""Status"" in (1,6))
                or(""Stage"" = 4 and ""Status"" in (41))
                or(""Stage"" = 6 and ""Status"" in (60, 61)))
            THEN 1 ELSE 0 END AS processed
, *
FROM(
    select
        coalesce(LAG(ds1.""Stage"") OVER(PARTITION BY ds1.""DisputeGuid"" ORDER BY ds1.""DisputeStatusId"")) AS prev_stage
        , coalesce(LAG(ds1.""Status"") OVER(PARTITION BY ds1.""DisputeGuid"" ORDER BY ds1.""DisputeStatusId"")) AS prev_status
        , ds1.""DisputeGuid"", ds1.""DisputeStatusId"", ds1.""Status"", ds1.""Stage"", ds1.""Process"", ds1.""Owner"", ds1.""StatusStartDate""
        FROM public.""DisputeStatuses"" ds1
        where(ds1.""Stage"" = 2 or(ds1.""Stage"" = 0 and ds1.""Status"" in (1, 6)) or(ds1.""Stage"" = 4 and ds1.""Status"" = 41) or(ds1.""Stage"" = 6 and ds1.""Status"" in (60, 61)))
        and ds1.""DisputeGuid"" in
            (select ds.""DisputeGuid"" from public.""DisputeStatuses"" ds where ds.""StatusStartDate"" > '{strUtcStart}' and ds.""StatusStartDate"" < '{utcEnd.ToString(CultureInfo.InvariantCulture)}')
        ORDER BY ds1.""DisputeGuid"", ds1.""DisputeStatusId""
    ) p
)
select ""DisputeStatusId""
FROM calc_processed
where processed = 1
and ""StatusStartDate"" > '{utcStart.ToString(CultureInfo.InvariantCulture)}' and ""StatusStartDate"" < '{utcEnd.ToString(CultureInfo.InvariantCulture)}'";

        var disputeStatuses = await Context
            .DisputeStatuses
            .FromSqlRaw(sqlQuery)
            .Select(x => x.DisputeStatusId)
            .ToListAsync();

        return disputeStatuses.Count;
    }

    public async Task<List<Model.DisputeStatus>> GetProcessedStatuses(DateTime utcStart, DateTime utcEnd)
    {
        var processedStatuses1 = new byte[] { 1, 6, 60, 61, 41 };
        var processedStatuses2 = new byte[] { 90, 91 };

        var disputeStatuses = await Context
            .DisputeStatuses
            .Where(x => x.StatusStartDate >= utcStart && x.StatusStartDate < utcEnd
            && (processedStatuses1.Contains(x.Status) || (x.Stage == 2 && processedStatuses2.Contains(x.Status))))
            .OrderBy(x => x.DisputeStatusId)
            .ToListAsync();

        return disputeStatuses;
    }

    public async Task<List<Model.DisputeStatus>> GetDisputeStatuses(Guid disputeGuid)
    {
        var statuses = await Context.DisputeStatuses.Where(x => x.DisputeGuid == disputeGuid).ToListAsync();
        return statuses;
    }

    public async Task<List<Model.DisputeStatus>> GetLastStatuses(int[] statusIds)
    {
        var lastStatuses = await Context
            .DisputeStatuses
            .Where(d => d.IsActive && statusIds.Contains(d.DisputeStatusId))
            .ToListAsync();

        return lastStatuses;
    }

    public async Task<List<Statuses1And6Duration>> GetStatuses1And6Duration(int[] statusIds)
    {
        var statuses = await Context.DisputeStatuses
            .Where(d => statusIds.Contains(d.DisputeStatusId)
                        && (d.Status == (byte)DisputeStatuses.UpdateRequired
                            || d.Status == (byte)DisputeStatuses.PaperApplicationUpdateRequired))
            .Select(x => new Statuses1And6Duration { DisputeGuid = x.DisputeGuid, Duration = x.DurationSeconds })
            .ToListAsync();

        return statuses;
    }

    public async Task<bool> IsClosedForSubmission(Guid disputeGuid)
    {
        var isClosedForSubmission = await Context
            .DisputeStatuses
            .AnyAsync(x => x.DisputeGuid == disputeGuid && x.IsActive == true && x.Status == (byte)DisputeStatuses.ClosedForSubmissions);
        return isClosedForSubmission;
    }

    public async Task<List<Model.DisputeStatus>> GetStatusesByGuids(List<Guid> disputeGuids)
    {
        var statuses = await Context.DisputeStatuses.Where(x => disputeGuids.Contains(x.DisputeGuid)).ToListAsync();
        return statuses;
    }
}

public class UniqueStatus
{
    public byte Status { get; set; }

    public byte? Stage { get; set; }

    public byte? Process { get; set; }
}