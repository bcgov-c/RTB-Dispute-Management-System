using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Services.DataWarehouse.DataWarehouseDataModel;
using CM.Services.DataWarehouse.DataWarehouseRepository.Base;
using CM.Services.DataWarehouse.DataWarehouseRepository.RequestResponseModels;
using Microsoft.EntityFrameworkCore;
using DWDM = CM.Services.DataWarehouse.DataWarehouseDataModel.Models;

namespace CM.Services.DataWarehouse.DataWarehouseRepository.FactIssueOutcome
{
    public class FactIssueOutcomeRepository : DwRepository<DWDM.FactIssueOutcome>, IFactIssueOutcomeRepository
    {
        public FactIssueOutcomeRepository(DataWarehouseContext context)
        : base(context)
        {
        }

        public async Task<List<Guid>> GetAllDisputes()
        {
            var disputes = await Context
            .FactIssueOutcomes
            .Select(x => x.DisputeGuid)
            .ToListAsync();

            return disputes;
        }

        public async Task<DWDM.FactIssueOutcome> GetByFileNumber(Guid disputeGuid)
        {
            var fact = await Context.FactIssueOutcomes.OrderByDescending(x => x.IssueOutcomeRecordId).FirstOrDefaultAsync(x => x.DisputeGuid == disputeGuid);

            return fact;
        }

        public async Task<List<ExistedFileNumbersResponse>> GetDisputes()
        {
            var fileNumbers = await Context.FactIssueOutcomes.Select(x => new ExistedFileNumbersResponse
            {
                DisputeSummaryRecordId = x.IssueOutcomeRecordId,
                LoadDateTime = x.LoadDateTime,
                DisputeGuid = x.DisputeGuid
            }).ToListAsync();

            return fileNumbers;
        }
    }
}
