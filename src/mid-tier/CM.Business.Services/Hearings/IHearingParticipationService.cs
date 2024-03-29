﻿using System;
using System.Threading.Tasks;
using CM.Business.Entities.Models.CmsArchive;
using CM.Business.Entities.Models.Hearing;
using CM.Business.Entities.Models.OfficeUser;
using CM.Data.Model;

namespace CM.Business.Services.Hearings;

public interface IHearingParticipationService : IServiceBase
{
    Task<HearingParticipationResponse> CreateAsync(int hearingId, HearingParticipationRequest hearingParticipation);

    Task<ExternalHearingParticipationResponse> CreateAsync(int hearingId, int participantId, Guid disputeGuid, ExternalHearingParticipationRequest hearingParticipation);

    Task<bool> DeleteAsync(int id);

    Task<HearingParticipationResponse> PatchAsync(HearingParticipation hearingParticipation);

    Task<HearingParticipation> GetNoTrackingHearingParticipationAsync(int id);

    Task<HearingParticipation> GetHearingParticipation(int hearingId, int participantId, Guid disputeGuid);

    Task<bool> HearingParticipantExists(int participantId);
}