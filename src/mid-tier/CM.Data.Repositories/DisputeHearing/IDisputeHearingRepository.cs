using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.DisputeHearing;

public interface IDisputeHearingRepository : IRepository<Model.DisputeHearing>
{
    Task<DateTime?> GetLastModifiedDate(int disputeHearingId);

    Task<List<Model.DisputeHearing>> GetHearingDisputes(int hearingId);

    Task<List<Model.DisputeHearing>> GetDisputeHearingsByDispute(Guid disputeGuid);

    Task<List<Model.DisputeHearing>> GetDisputeHearings(Guid disputeGuid);

    Task<List<Model.DisputeHearing>> GetDisputeHearingsWithParticipations(Guid disputeGuid);

    Task<List<Model.DisputeHearing>> GetByHearingId(int hearingId);

    Task<List<Model.DisputeHearing>> GetDisputeHearingHistory(byte searchType, Guid? disputeGuid, int? hearingId, int index, int count);

    Task<bool> IsFutureHearingExist(Guid disputeGuid);

    Task<bool> IsOverlappedHearingExist(Guid disputeGuid, int hearingId);

    Task<List<int>> GetDisputeHearingsByHearingStartDate(DateTime startDate, DateTime endDate);

    Task<Model.DisputeHearing> GetLatestDisputeHearing(Guid disputeGuid, int hearingId);

    Task<Model.DisputeHearing> GetLatestDisputeHearing(Guid disputeGuid);

    Task<int?> GetPrimaryPreviousHearingId(int hearingId, Guid primaryDisputeGuid);

    Task<Model.DisputeHearing> GetHearingByRecordCodeAndDate(string recordCode, DateTime startDate);
}