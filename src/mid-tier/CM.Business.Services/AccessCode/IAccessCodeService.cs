using System;
using System.Threading.Tasks;
using CM.Business.Entities.Models.AccessCode;
using CM.Data.Model;

namespace CM.Business.Services.AccessCode;

public interface IAccessCodeService
{
    Task<string> Authenticate(int userId, int participantId);

    Task<bool> CheckDisputeStatus(Guid disputeGuid);

    Task<Participant> CheckAccessCodeExistence(string accesscode);

    Task<DisputeClosedResponse> GetClosedDisputeInfo(string accesscode);

    Task<Dispute> GetDispute(Guid disputeGuid);

    Task<Hearing> GetHearing(Guid disputeGuid);

    Task<DisputeAccessResponse> GetAccessCodeFileInfo(string token);

    Task<DisputeUser> GetAssociatedDisputeUser(Participant participant);

    Task<bool> TrySendAccessCodeRecoveryEmailAsync(int fileNumber, string email);
}