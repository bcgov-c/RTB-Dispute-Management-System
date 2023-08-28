using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.DisputeVerification;
using CM.Business.Entities.Models.VerificationAttempt;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.DisputeVerification
{
    public class DisputeVerificationService : CmServiceBase, IDisputeVerificationService
    {
        public DisputeVerificationService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
        {
        }

        public async Task<DisputeVerificationResponse> CreateAsync(Guid disputeGuid, DisputeVerificationPostRequest request)
        {
            var disputeVerification = MapperService.Map<DisputeVerificationPostRequest, Data.Model.DisputeVerification>(request);
            disputeVerification.DisputeGuid = disputeGuid;
            disputeVerification.IsDeleted = false;

            var disputeFlagResult = await UnitOfWork.DisputeVerificationRepository.InsertAsync(disputeVerification);
            var result = await UnitOfWork.Complete();

            if (result.CheckSuccess())
            {
                var res = MapperService.Map<Data.Model.DisputeVerification, DisputeVerificationResponse>(disputeFlagResult);
                return res;
            }

            return null;
        }

        public async Task<VerificationAttemptResponse> CreateAttemptAsync(int verificationId, VerificationAttemptPostRequest request)
        {
            var verificationAttempt = MapperService.Map<VerificationAttemptPostRequest, Data.Model.VerificationAttempt>(request);
            verificationAttempt.DisputeVerificationId = verificationId;
            verificationAttempt.IsDeleted = false;

            var verificationAttemptResult = await UnitOfWork.VerificationAttemptRepository.InsertAsync(verificationAttempt);
            var result = await UnitOfWork.Complete();

            if (result.CheckSuccess())
            {
                var res = MapperService.Map<Data.Model.VerificationAttempt, VerificationAttemptResponse>(verificationAttemptResult);
                return res;
            }

            return null;
        }

        public async Task<bool> DeleteAsync(int verificationId)
        {
            var disputeVerification = await UnitOfWork.DisputeVerificationRepository.GetByIdAsync(verificationId);
            if (disputeVerification != null)
            {
                disputeVerification.IsDeleted = true;
                UnitOfWork.DisputeVerificationRepository.Attach(disputeVerification);
                var result = await UnitOfWork.Complete();
                return result.CheckSuccess();
            }

            return false;
        }

        public async Task<bool> DeleteAttemptAsync(int verificationAttemptId)
        {
            var verificationAttempt = await UnitOfWork.VerificationAttemptRepository.GetByIdAsync(verificationAttemptId);
            if (verificationAttempt != null)
            {
                verificationAttempt.IsDeleted = true;
                UnitOfWork.VerificationAttemptRepository.Attach(verificationAttempt);
                var result = await UnitOfWork.Complete();
                return result.CheckSuccess();
            }

            return false;
        }

        public async Task<VerificationAttempt> GetAttemptById(int verificationAttemptId)
        {
            var verificationAttempt = await UnitOfWork.VerificationAttemptRepository.GetByIdAsync(verificationAttemptId);
            return verificationAttempt;
        }

        public async Task<Data.Model.DisputeVerification> GetById(int verificationId)
        {
            var disputeVerification = await UnitOfWork.DisputeVerificationRepository.GetByIdAsync(verificationId);
            return disputeVerification;
        }

        public async Task<DisputeVerificationGetResponse> GetDisputeVerification(int verificationId)
        {
            var disputeVerification = await UnitOfWork.DisputeVerificationRepository.GetDisputeVerification(verificationId);
            return MapperService.Map<Data.Model.DisputeVerification, DisputeVerificationGetResponse>(disputeVerification);
        }

        public async Task<List<DisputeVerificationGetResponse>> GetDisputeVerifications(Guid disputeGuid)
        {
            var disputeVerifications = await UnitOfWork.DisputeVerificationRepository.GetDisputeVerifications(disputeGuid);
            return MapperService.Map<List<Data.Model.DisputeVerification>, List<DisputeVerificationGetResponse>>(disputeVerifications);
        }

        public async Task<DateTime?> GetLastModifiedDateAsync(object id)
        {
            var lastModifiedDate = await UnitOfWork.DisputeVerificationRepository.GetLastModifiedDate((int)id);
            return lastModifiedDate;
        }

        public async Task<bool> IsAssignedAttemptsExists(int verificationId)
        {
            var isAssigned = await UnitOfWork.VerificationAttemptRepository.IsAssignedAttemptsExists(verificationId);
            return isAssigned;
        }

        public async Task<DisputeVerificationResponse> PatchDisputeVerificationAsync(int verificationId, DisputeVerificationPatchRequest request)
        {
            var disputeVerification = await UnitOfWork.DisputeVerificationRepository.GetByIdAsync(verificationId);
            MapperService.Map(request, disputeVerification);

            UnitOfWork.DisputeVerificationRepository.Attach(disputeVerification);
            var result = await UnitOfWork.Complete();
            if (result.CheckSuccess())
            {
                var res = MapperService.Map<Data.Model.DisputeVerification, DisputeVerificationResponse>(disputeVerification);

                return res;
            }

            return null;
        }

        public async Task<VerificationAttemptResponse> PatchVerificationAttemptAsync(int verificationAttemptId, VerificationAttemptPatchRequest request)
        {
            var verificationAttempt = await UnitOfWork.VerificationAttemptRepository.GetByIdAsync(verificationAttemptId);
            MapperService.Map(request, verificationAttempt);

            UnitOfWork.VerificationAttemptRepository.Attach(verificationAttempt);
            var result = await UnitOfWork.Complete();
            if (result.CheckSuccess())
            {
                var res = MapperService.Map<Data.Model.VerificationAttempt, VerificationAttemptResponse>(verificationAttempt);

                return res;
            }

            return null;
        }

        public async Task<Guid> ResolveDisputeGuid(int id)
        {
            var entity = await UnitOfWork.DisputeVerificationRepository.GetNoTrackingByIdAsync(x => x.VerificationId == id);
            return entity?.DisputeGuid ?? Guid.Empty;
        }
    }
}
