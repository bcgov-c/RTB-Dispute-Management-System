using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Services.DataWarehouse.DataWarehouseDataModel;
using CM.Services.DataWarehouse.DataWarehouseRepository.Base;
using CM.Services.DataWarehouse.DataWarehouseRepository.RequestResponseModels;
using Microsoft.EntityFrameworkCore;

namespace CM.Services.DataWarehouse.DataWarehouseRepository.FactDisputeSummary;

public class FactDisputeSummaryRepository : DwRepository<DataWarehouseDataModel.Models.FactDisputeSummary>, IFactDisputeSummaryRepository
{
    public FactDisputeSummaryRepository(DataWarehouseContext context)
        : base(context)
    {
    }

    public async Task<DataWarehouseDataModel.Models.FactDisputeSummary> GetByFileNumber(Guid disputeGuid)
    {
        var fact = await Context.FactDisputeSummaries.OrderByDescending(x => x.DisputeSummaryRecordId).FirstOrDefaultAsync(x => x.DisputeGuid == disputeGuid);

        return fact;
    }

    public async Task<List<Guid>> GetAllDisputes()
    {
        var disputes = await Context
            .FactDisputeSummaries
            .Select(x => x.DisputeGuid)
            .ToListAsync();

        return disputes;
    }

    public async Task<List<ExistedFileNumbersResponse>> GetDisputes()
    {
        var fileNumbers = await Context.FactDisputeSummaries.Select(x => new ExistedFileNumbersResponse
        {
            DisputeSummaryRecordId = x.DisputeSummaryRecordId,
            LoadDateTime = x.LoadDateTime,
            DisputeGuid = x.DisputeGuid
        }).ToListAsync();

        return fileNumbers;
    }
}