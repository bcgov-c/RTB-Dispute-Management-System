using System;
using System.Threading.Tasks;
using CM.Business.Entities.Models.ParticipantIdentity;
using CM.Business.Services.Base;
using CM.Data.Model;

namespace CM.Business.Services.ParticipantIdentityService
{
    public interface IParticipantIdentityService : IServiceBase, IDisputeResolver
    {
        Task<ParticipantIdentityResponse> CreateAsync(ParticipantIdentityPostRequest request);

        Task<bool> DeleteAsync(int particpantIdentityId);

        Task<ParticipantIdentitiesResponse> GetByDisputeGuidAsync(Guid disputeGuid, int count, int index);

        Task<ParticipantIdentityResponse> GetByIdAsync(int particpantIdentityId);

        Task<ParticipantIdentitiesResponse> GetByParticipantAsync(int participantId, int count, int index);

        Task<ParticipantIdentity> GetNoTrackingNoticeAsync(int particpantIdentityId);

        Task<ParticipantIdentityResponse> PatchAsync(ParticipantIdentity participantIdentity);
    }
}
