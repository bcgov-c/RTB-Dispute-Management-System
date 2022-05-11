using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Services.DataWarehouse.DataWarehouseRepository.Base;

namespace CM.Services.DataWarehouse.DataWarehouseRepository.FactHearingSummary;

public interface IFactHearingSummaryRepository : IDwRepository<DataWarehouseDataModel.Models.FactHearingSummary>
{
    Task<List<int>> GetExistedHearings();

    Task<List<DataWarehouseDataModel.Models.FactHearingSummary>> GetDwPrimaryHearings(Guid disputeGuid);
}