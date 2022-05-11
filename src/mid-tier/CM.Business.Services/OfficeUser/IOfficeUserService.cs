using System;
using System.Threading.Tasks;
using CM.Business.Entities.Models.AccessCode;
using CM.Business.Entities.Models.EmailMessage;
using CM.Business.Entities.Models.OfficeUser;
using CM.Data.Model;

namespace CM.Business.Services.OfficeUser;

public interface IOfficeUserService : IServiceBase
{
    Task<DisputeAccessResponse> GetDisputeDetails(OfficeUserGetDisputeRequest request);

    Task<OfficeUserPostDisputeResponse> CreateDispute(OfficeUserPostDisputeRequest request);

    Task<OfficeUserDisputeFee> CreatePaymentTransaction(int disputeFeeId, OfficeUserPostTransactionRequest request);

    Task<Dispute> PatchDispute(Dispute request);

    Task<OfficeUserPostNoticeResponse> CreateNotice(Guid disputeGuid, OfficeUserPostNoticeRequest request);

    Task<PickupMessageGetResponse> GetPickupMessage(int emailMessageId);
}