using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Services.DataWarehouse.DataWarehouseRepository.Base;
using CM.Services.DataWarehouse.DataWarehouseRepository.RequestResponseModels;

namespace CM.Services.DataWarehouse.DataWarehouseRepository.FactDisputeSummary;

public interface IFactDisputeSummaryRepository : IDwRepository<DataWarehouseDataModel.Models.FactDisputeSummary>
{
    Task<List<ExistedFileNumbersResponse>> GetDisputes();

    Task<DataWarehouseDataModel.Models.FactDisputeSummary> GetByFileNumber(Guid disputeGuid);

    Task<List<Guid>> GetDelayedDisputes(int dateDelay);
}