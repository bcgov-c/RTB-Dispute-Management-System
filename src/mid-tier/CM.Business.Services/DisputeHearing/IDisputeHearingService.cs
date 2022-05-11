using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.DisputeHearing;

namespace CM.Business.Services.DisputeHearing;

public interface IDisputeHearingService : IServiceBase
{
    Task<DisputeHearingResponse> CreateAsync(DisputeHearingRequest request);

    Task<DisputeHearingResponse> PatchAsync(Data.Model.DisputeHearing disputeHearing);

    Task<Data.Model.DisputeHearing> GetNoTrackingAsync(int disputeHearingId);

    Task<bool> DeleteAsync(int disputeHearingId);

    Task<Data.Model.DisputeHearing> GetPrimaryHearing(int hearingId);

    Task<List<DisputeHearingResponse>> GetDisputeHearingHistory(byte searchType, Guid? disputeGuid, int? hearingId, int index, int count);

    Task<bool> IsFutureHearingExist(Guid disputeGuid);

    Task<bool> IsOverlappedHearingExist(Guid disputeGuid, int hearingId);

    Task<List<Data.Model.DisputeHearing>> GetDisputeHearingsByHearing(int hearingId);

    Task<Data.Model.DisputeHearing> FindRecordingHearing(string recordCode, DateTime startDate);
}