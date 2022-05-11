using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.OutcomeDocument;
using CM.Data.Model;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.OutcomeDocument;

public interface IOutcomeDocDeliveryRepository : IRepository<OutcomeDocDelivery>
{
    Task<DateTime?> GetLastModifiedDate(int outcomeDocDeliveryId);

    Task<List<OutcomeDocDelivery>> GetAllUndelivered(OutcomeDocDeliveryGetRequest request, int index, int count);

    Task<bool> IsDuplicateByParticipantId(Guid disputeGuid, int? participantId, int outcomeDocFileId);
}