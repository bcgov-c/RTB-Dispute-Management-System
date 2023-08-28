using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.Notice;
using CM.Business.Entities.Models.ParticipantIdentity;
using CM.Business.Entities.Models.Task;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace CM.Business.Services.ParticipantIdentityService
{
    public class ParticipantIdentityService : CmServiceBase, IParticipantIdentityService
    {
        public ParticipantIdentityService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
        {
        }

        public async Task<ParticipantIdentityResponse> CreateAsync(ParticipantIdentityPostRequest request)
        {
            var participant = await UnitOfWork.ParticipantRepository.GetByIdAsync(request.ParticipantId);
            var dispute = await UnitOfWork.DisputeRepository.GetNoTrackDisputeByGuidAsync(participant.DisputeGuid);
            var identityParticipant = await UnitOfWork.ParticipantRepository.GetByIdAsync(request.IdentityParticipantId);
            var identityDispute = await UnitOfWork.DisputeRepository.GetNoTrackDisputeByGuidAsync(identityParticipant.DisputeGuid);

            var newParticipantIdentity = MapperService.Map<ParticipantIdentityPostRequest, Data.Model.ParticipantIdentity>(request);
            newParticipantIdentity.ParticipantId = participant.ParticipantId;
            newParticipantIdentity.DisputeGuid = dispute.DisputeGuid;
            newParticipantIdentity.IdentityParticipantId = identityParticipant.ParticipantId;
            newParticipantIdentity.IdentityDisputeGuid = identityDispute.DisputeGuid;
            newParticipantIdentity.IsDeleted = false;
            var participantIdentityResult = await UnitOfWork.ParticipantIdentityRepository.InsertAsync(newParticipantIdentity);
            var result = await UnitOfWork.Complete();
            if (result.CheckSuccess())
            {
                var res = MapperService.Map<ParticipantIdentity, ParticipantIdentityResponse>(participantIdentityResult);
                res.FileNumber = dispute.FileNumber;
                res.IdentityFileNumber = identityDispute.FileNumber;
                return res;
            }

            return null;
        }

        public async Task<bool> DeleteAsync(int participantIdentityId)
        {
            var participantIdentity = await UnitOfWork.ParticipantIdentityRepository.GetByIdAsync(participantIdentityId);
            if (participantIdentity != null)
            {
                participantIdentity.IsDeleted = true;
                UnitOfWork.ParticipantIdentityRepository.Attach(participantIdentity);
                var result = await UnitOfWork.Complete();
                return result.CheckSuccess();
            }

            return false;
        }

        public async Task<ParticipantIdentitiesResponse> GetByDisputeGuidAsync(Guid disputeGuid, int count, int index)
        {
            if (count == 0)
            {
                count = int.MaxValue;
            }

            var participantIdentitiesResponse = new ParticipantIdentitiesResponse();

            var participantIdentities = await UnitOfWork.ParticipantIdentityRepository.FindAllAsync(x => x.DisputeGuid == disputeGuid);
            if (participantIdentities != null)
            {
                participantIdentitiesResponse.TotalAvailableRecords = participantIdentities.Count;
                participantIdentitiesResponse.ParticipantIdentities.AddRange(MapperService.Map<List<ParticipantIdentity>, List<ParticipantIdentityResponse>>(participantIdentities.ApplyPaging(count, index).ToList()));
            }

            return participantIdentitiesResponse;
        }

        public async Task<ParticipantIdentityResponse> GetByIdAsync(int participantIdentityId)
        {
            var participantIdentity = await UnitOfWork.ParticipantIdentityRepository.GetByIdAsync(participantIdentityId);
            if (participantIdentity != null)
            {
                return MapperService.Map<ParticipantIdentity, ParticipantIdentityResponse>(participantIdentity);
            }

            return null;
        }

        public async Task<ParticipantIdentitiesResponse> GetByParticipantAsync(int participantId, int count, int index)
        {
            if (count == 0)
            {
                count = int.MaxValue;
            }

            var participantIdentitiesResponse = new ParticipantIdentitiesResponse();

            var participantIdentities = await UnitOfWork.ParticipantIdentityRepository.FindAllAsync(x => x.ParticipantId == participantId);
            if (participantIdentities != null)
            {
                participantIdentitiesResponse.TotalAvailableRecords = participantIdentities.Count;
                participantIdentitiesResponse.ParticipantIdentities.AddRange(MapperService.Map<List<ParticipantIdentity>, List<ParticipantIdentityResponse>>(participantIdentities.ApplyPaging(count, index).ToList()));
            }

            return participantIdentitiesResponse;
        }

        public async Task<DateTime?> GetLastModifiedDateAsync(object id)
        {
            var lastModifiedDate = await UnitOfWork.ParticipantIdentityRepository.GetLastModifiedDate((int)id);

            return lastModifiedDate;
        }

        public async Task<ParticipantIdentity> GetNoTrackingNoticeAsync(int participantIdentityId)
        {
            var participantIdentity = await UnitOfWork.ParticipantIdentityRepository.GetNoTrackingByIdAsync(r =>
            r.ParticipantIdentityId == participantIdentityId);
            return participantIdentity;
        }

        public async Task<ParticipantIdentityResponse> PatchAsync(ParticipantIdentity participantIdentity)
        {
            UnitOfWork.ParticipantIdentityRepository.Attach(participantIdentity);
            var result = await UnitOfWork.Complete();

            if (result.CheckSuccess())
            {
                return MapperService.Map<ParticipantIdentity, ParticipantIdentityResponse>(participantIdentity);
            }

            return null;
        }

        public async Task<Guid> ResolveDisputeGuid(int id)
        {
            var entity = await UnitOfWork.ParticipantIdentityRepository.GetNoTrackingByIdAsync(x => x.ParticipantIdentityId == id);
            return entity?.DisputeGuid ?? Guid.Empty;
        }
    }
}
