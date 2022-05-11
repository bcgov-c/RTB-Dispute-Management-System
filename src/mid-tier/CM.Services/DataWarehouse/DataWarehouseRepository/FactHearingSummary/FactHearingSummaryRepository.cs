using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Services.DataWarehouse.DataWarehouseDataModel;
using CM.Services.DataWarehouse.DataWarehouseRepository.Base;
using Microsoft.EntityFrameworkCore;
using DWDM = CM.Services.DataWarehouse.DataWarehouseDataModel.Models;

namespace CM.Services.DataWarehouse.DataWarehouseRepository.FactHearingSummary;

public class FactHearingSummaryRepository : DwRepository<DWDM.FactHearingSummary>, IFactHearingSummaryRepository
{
    public FactHearingSummaryRepository(DataWarehouseContext context)
        : base(context)
    {
    }

    public async Task<List<DWDM.FactHearingSummary>> GetDwPrimaryHearings(Guid disputeGuid)
    {
        var factHearings = await Context.FactHearingSummaries.Where(x => x.DisputeGuid == disputeGuid).ToListAsync();
        if (factHearings == null)
        {
            return new List<DWDM.FactHearingSummary>();
        }

        return factHearings;
    }

    public async Task<List<int>> GetExistedHearings()
    {
        var hearings = await Context
            .FactHearingSummaries
            .Select(x => x.HearingId)
            .ToListAsync();

        return hearings;
    }
}