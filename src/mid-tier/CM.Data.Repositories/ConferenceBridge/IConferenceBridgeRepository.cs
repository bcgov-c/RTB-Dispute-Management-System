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

    Task<IList<Model.ConferenceBridge>> GetAvailableBridges(DateTime dateTime);

    Task<bool> IsBridgeBooked(int conferenceBridgeId, DateTime startTime);
}