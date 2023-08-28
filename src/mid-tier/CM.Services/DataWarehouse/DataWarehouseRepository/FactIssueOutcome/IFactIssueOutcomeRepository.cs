using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Services.DataWarehouse.DataWarehouseRepository.Base;
using CM.Services.DataWarehouse.DataWarehouseRepository.RequestResponseModels;

namespace CM.Services.DataWarehouse.DataWarehouseRepository.FactIssueOutcome
{
    public interface IFactIssueOutcomeRepository : IDwRepository<DataWarehouseDataModel.Models.FactIssueOutcome>
    {
        Task<List<Guid>> GetAllDisputes();

        Task<DataWarehouseDataModel.Models.FactIssueOutcome> GetByFileNumber(Guid disputeGuid);

        Task<List<ExistedFileNumbersResponse>> GetDisputes();
    }
}
