using System;
using System.Threading.Tasks;
using CM.Services.DataWarehouse.DataWarehouseDataModel;
using CM.Services.DataWarehouse.DataWarehouseRepository.Base;
using Microsoft.EntityFrameworkCore;
using DWDM = CM.Services.DataWarehouse.DataWarehouseDataModel.Models;

namespace CM.Services.DataWarehouse.DataWarehouseRepository.FactIntakeProcessing;

public class FactIntakeProcessingRepository : DwRepository<DWDM.FactIntakeProcessing>, IFactIntakeProcessingRepository
{
    public FactIntakeProcessingRepository(DataWarehouseContext context)
        : base(context)
    {
    }

    public async Task<bool> GetExistedRecord(Guid disputeGuid, int statusId, int earliestStatusId)
    {
        var exists = await Context.FactIntakeProcessings
            .AnyAsync(x => x.DisputeGuid == disputeGuid
                           && x.ProcessStartDisputeStatusId == earliestStatusId
                           && x.ProcessEndDisputeStatusId == statusId);
        return exists;
    }
}