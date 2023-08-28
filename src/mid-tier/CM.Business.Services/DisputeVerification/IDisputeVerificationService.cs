using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.DisputeVerification;
using CM.Business.Entities.Models.VerificationAttempt;
using CM.Business.Services.Base;

namespace CM.Business.Services.DisputeVerification
{
    public interface IDisputeVerificationService : IServiceBase, IDisputeResolver
    {
        Task<DisputeVerificationResponse> CreateAsync(Guid disputeGuid, DisputeVerificationPostRequest request);

        Task<bool> DeleteAsync(int verificationId);

        Task<Data.Model.DisputeVerification> GetById(int verificationId);

        Task<DisputeVerificationGetResponse> GetDisputeVerification(int verificationId);

        Task<DisputeVerificationResponse> PatchDisputeVerificationAsync(int verificationId, DisputeVerificationPatchRequest request);

        Task<VerificationAttemptResponse> CreateAttemptAsync(int verificationId, VerificationAttemptPostRequest request);

        Task<bool> DeleteAttemptAsync(int verificationAttemptId);

        Task<Data.Model.VerificationAttempt> GetAttemptById(int verificationAttemptId);

        Task<VerificationAttemptResponse> PatchVerificationAttemptAsync(int verificationAttemptId, VerificationAttemptPatchRequest request);

        Task<List<DisputeVerificationGetResponse>> GetDisputeVerifications(Guid disputeGuid);

        Task<bool> IsAssignedAttemptsExists(int verificationId);
    }
}
