using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.OnlineMeeting;
using CM.Business.Services.Base;
using CM.Common.Utilities;
using CM.Data.Model;

namespace CM.Business.Services.OnlineMeeting
{
    public interface IOnlineMeetingService : IServiceBase, IDisputeResolver
    {
        Task<OnlineMeetingResponse> CreateAsync(OnlineMeetingPostRequest request);

        Task<OnlineMeetingResponse> PatchAsync(int onlineMeetingId, OnlineMeetingPatchRequest request);

        Task<bool> DeleteAsync(int onlineMeetingId);

        Task<OnlineMeetingResponse> GetByIdAsync(int onlineMeetingId);

        Task<Data.Model.OnlineMeeting> GetNoTrackingAsync(int onlineMeetingId);

        Task<DisputeLinkResponse> CreateDisputeLinkAsync(DisputeLinkPostRequest request);

        Task<DisputeLink> GetNoTrackingDisputeLinkAsync(int disputeLinkId);

        Task<DisputeLinkResponse> PatchDisputeLinkAsync(int disputeLinkId, DisputeLinkPatchRequest disputeLinkToPatch);

        Task<bool> DeleteDisputeLinkAsync(int disputeLinkId);

        Task<List<DisputeLinkResponse>> GetDisputeLinkByDisputeAsync(Guid disputeGuid, DisputeLinkGetRequest request);

        Task<bool> IsExistedDisputeLink(DisputeLinkRole disputeLinkRole, int onlineMeetingId);
    }
}
