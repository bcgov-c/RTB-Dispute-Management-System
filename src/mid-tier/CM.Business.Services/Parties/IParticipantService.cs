using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.Parties;
using CM.Business.Services.Base;
using CM.Common.Utilities;
using CM.Data.Model;

namespace CM.Business.Services.Parties;

public interface IParticipantService : IServiceBase, IDisputeResolver
{
    Task<List<ParticipantResponse>> CreateManyAsync(Guid disputeGuid, IEnumerable<ParticipantRequest> participants);

    Task<bool> DeleteAsync(int id);

    Task<int> RelatedEntity(int id);

    Task<Participant> PatchAsync(Participant participant, PartyPatchType patchType = PartyPatchType.Null, bool abbrUpdate = false);

    Task<ParticipantResponse> GetAsync(int id);

    Task<List<ParticipantResponse>> GetAllAsync(Guid disputeGuid);

    Task<Participant> GetNoTrackingParticipantAsync(int id);

    Task<Participant> GetByIdAsync(int id);

    Task<ParticipantResponse> GetByAccessCode(string accessCode);

    Task<bool> ParticipantExists(int participantId);

    Task<bool> ParticipantExists(int? participantId);

    Task<(ParticipantEmailErrorCodes Result, string Value)> GetParticipantEmail(Guid disputeGuid, int? participantId);

    Task<bool> IsPrimaryApplicant(int participantId);

    Task<bool> IsActiveParticipantExists(int participantId);

    bool NeedAbbrUpdate(ParticipantRequest participantToPatch, Participant originalParty);
}