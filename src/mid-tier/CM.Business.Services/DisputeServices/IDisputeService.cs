using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.Dispute;
using CM.Business.Entities.Models.ExternalUpdate;
using CM.Data.Model;

namespace CM.Business.Services.DisputeServices;

public interface IDisputeService : IServiceBase
{
    Task<CreateDisputeResponse> CreateAsync(int userId);

    Task<Dispute> PatchDisputeAsync(Dispute originalDispute);

    Task<DisputeListResponse> GetAllAsync(int count, int index, int userId, int? creationMethod);

    Task<DisputeResponse> GetDisputeResponseAsync(Guid disputeGuid);

    Task<Dispute> GetDisputeNoTrackAsync(Guid disputeGuid);

    Task<DisputeStatusResponse> PostDisputeStatusAsync(DisputeStatusPostRequest request, Guid disputeGuid);

    Task<ExternalUpdateDisputeStatusResponse> PostDisputeStatusAsync(ExternalUpdateDisputeStatusRequest request, Guid disputeGuid, int userId);

    Task<bool> DisputeExistsAsync(Guid disputeGuid);

    Task<bool> DisputeStatusExistsAsync(int disputeStatusId);

    Task<bool> IfFirstStatus(Guid disputeGuid);

    Task<List<DisputeStatusResponse>> GetDisputeStatusesAsync(Guid disputeGuid);

    Task<DisputeStatusResponse> GetDisputeLastStatusAsync(Guid disputeGuid);

    Task<Dispute> GetDisputeByFileNumber(int fileNumber);

    Task<ICollection<DisputeUser>> GetDisputeUsersAsync(Guid disputeGuid);

    bool StatusChangeAllowed(ExternalUpdateDisputeStatusRequest disputeStatus, DisputeStatusResponse lastDisputeStatus);

    Task<bool> IsDisputeUser(Guid disputeGuid, int userId);

    Task<List<DisputeUserGetResponse>> GetDisputeUsers(Guid disputeGuid);

    Task<bool> IsDisputeUserModified(int disputeUserId, DateTime unmodifiedSince);

    Task<DisputeUser> GetDisputeUser(int disputeUserId);

    Task<DisputeUserGetResponse> PatchDisputeUserAsync(DisputeUser disputeUser);
}