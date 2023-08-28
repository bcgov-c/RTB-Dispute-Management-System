using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using CM.Business.Entities.Models.Dashboard;
using CM.Business.Entities.SharedModels;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.DisputeStatus;

public interface IDisputeStatusRepository : IRepository<Model.DisputeStatus>
{
    Task<Model.DisputeStatus> GetDisputeLastStatusAsync(Guid disputeGuid);

    Task<List<Model.DisputeStatus>> GetDisputeStatuses(int? userId, DashboardSearchDisputesRequest request);

    Task<List<Model.DisputeStatus>> GetDisputeStatuses(Guid disputeGuid);

    Task<List<byte?>> GetDisputeProcesses(Guid disputeGuid);

    Task<List<Model.DisputeStatus>> GetAbandonedDisputeStatuses(int disputeAbandonedDays);

    Task<List<Model.DisputeStatus>> GetDisputeAbandonedForNoPaymentStatuses(int disputeAbandonedNoPaymentDays);

    Task<List<Model.DisputeStatus>> GetUniqueStatuses(Guid disputeGuid);

    Task<List<Model.DisputeStatus>> GetDisputeAbandonedForNoServiceStatuses(int disputeAbandonedNoServiceDays);

    Task<List<Model.DisputeStatus>> GetDisputeForColdStorageMigrationStatuses(int closedDaysForColdStorage);

    Task<List<Model.DisputeStatus>> GetStatusesByStatusStartDate(DateTime startDate, DateTime endDate);

    Task<List<Model.DisputeStatus>> GetAllStatusesByStatusStartDate(DateTime startDate, DateTime endDate);

    Task<Model.DisputeStatus> GetOldestStatus(int[] oldStatuses);

    Task<List<Model.DisputeStatus>> GetDisputeStatuses(int[] statuses);

    Task<List<Model.DisputeStatus>> GetStageOpenDisputeStatuses(int?[] stages, int[] notContainStatuses);

    Task<bool> IsAdjournedDisputeStatusExists(Guid disputeGuid);

    Task<int> GetDisputesCountLastChangesStatusFrom2(DateTime utcStart, DateTime utcEnd);

    Task<List<Model.DisputeStatus>> GetProcessedStatuses(DateTime utcStart, DateTime utcEnd);

    Task<List<Model.DisputeStatus>> GetLastStatuses(int[] statusIds);

    Task<List<Statuses1And6Duration>> GetStatuses1And6Duration(int[] statusIds);

    Task<bool> IsClosedForSubmission(Guid disputeGuid);

    Task<List<Model.DisputeStatus>> GetStatusesByGuids(List<Guid> disputeGuids);

    Task<int> GetWaitingForDecisionsCount();

    Task<List<Model.DisputeStatus>> GetAllWithDisputeAsync();

    Task<int> GetStatusesCount(Expression<Func<Model.DisputeStatus, bool>> expression);
}