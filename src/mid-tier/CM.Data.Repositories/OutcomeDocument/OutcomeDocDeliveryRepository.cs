using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Business.Entities.Models.OutcomeDocument;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.OutcomeDocument;

public class OutcomeDocDeliveryRepository : CmRepository<OutcomeDocDelivery>, IOutcomeDocDeliveryRepository
{
    public OutcomeDocDeliveryRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<DateTime?> GetLastModifiedDate(int outcomeDocDeliveryId)
    {
        var dates = await Context.OutcomeDocDeliveries
            .Where(n => n.OutcomeDocDeliveryId == outcomeDocDeliveryId)
            .Select(n => n.ModifiedDate)
            .ToListAsync();

        return dates?.FirstOrDefault();
    }

    public async Task<List<OutcomeDocDelivery>> GetAllUndelivered(OutcomeDocDeliveryGetRequest request, int index, int count)
    {
        var predicate = PredicateBuilder.True<OutcomeDocDelivery>();

        predicate = predicate.And(o => o.IsDelivered != true && o.ReadyForDelivery == true);

        if (request.DeliveryMethod != null)
        {
            var deliveryMethods = request.DeliveryMethod?.Split(',');
            predicate = predicate.And(x => deliveryMethods.Contains(x.DeliveryMethod.ToString()));
        }

        if (request.DeliveryPriority != null)
        {
            var deliveryPriority = request.DeliveryPriority?.Split(',');
            predicate = predicate.And(x => deliveryPriority.Contains(x.DeliveryPriority.ToString()));
        }

        if (request.FileType != null)
        {
            var fileType = request.FileType?.Split(',');
            predicate = predicate.And(x => fileType.Contains(x.OutcomeDocFile.FileType.ToString()));
        }

        var outcomeDocDeliveries = await Context.OutcomeDocDeliveries
            .Include(x => x.OutcomeDocFile)
            .Where(predicate)
            .ApplyPaging(count, index)
            .ToListAsync();

        return outcomeDocDeliveries;
    }

    public async Task<bool> IsDuplicateByParticipantId(Guid disputeGuid, int? participantId, int outcomeDocFileId)
    {
        var isAnyExists = await Context.OutcomeDocDeliveries.AnyAsync(x => x.DisputeGuid == disputeGuid && x.ParticipantId == participantId && x.OutcomeDocFileId == outcomeDocFileId);
        return isAnyExists;
    }
}