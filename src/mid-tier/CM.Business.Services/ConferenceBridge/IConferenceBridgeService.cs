using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.ConferenceBridge;

namespace CM.Business.Services.ConferenceBridge;

public interface IConferenceBridgeService : IServiceBase
{
    Task<ConferenceBridgeResponse> CreateAsync(ConferenceBridgeRequest request);

    Task<ConferenceBridgeResponse> PatchAsync(int bridgeId, ConferenceBridgeRequest conferenceBridgeRequest);

    Task<ConferenceBridgeRequest> GetForPatchAsync(int conferenceBridgeId);

    Task<ConferenceBridgeResponse> GetByIdAsync(int conferenceBridgeId);

    Task<bool> ModeratorCodeExists(string moderatorCode);

    Task<bool> ParticipantCodeExists(string participantCode);

    Task<bool> TimeIsOverlap(int ownerId, DateTime? startTime, DateTime? endTime);

    Task<bool> ConferenceBridgeExists(int conferenceBridgeId);

    Task<bool> ConferenceBridgeIsBooked(int conferenceBridgeId, DateTime startTime, DateTime endTime);

    Task<List<ConferenceBridgeResponse>> GetAllBridges();
}