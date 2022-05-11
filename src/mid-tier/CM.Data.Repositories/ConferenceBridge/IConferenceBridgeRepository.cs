using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.ConferenceBridge;

public interface IConferenceBridgeRepository : IRepository<Model.ConferenceBridge>
{
    Task<DateTime?> GetLastModifiedDate(int conferenceBridgeId);

    Task<bool> IsModeratorCodeExist(string moderatorCode);

    Task<bool> IsParticipantCodeExist(string moderatorCode);

    Task<List<Model.ConferenceBridge>> GetAllByOwnerAsync(int ownerId);

    Task<List<Model.ConferenceBridge>> GetAccordingScheduleForCheck(int? systemUserId, TimeSpan? time);

    Task<List<Model.ConferenceBridge>> GetAccordingSchedule(int? systemUserId, TimeSpan? time);

    Task<List<Model.ConferenceBridge>> GetOpenConferenceBridges();

    Task<int[]> GetActiveConferenceBridges();
}