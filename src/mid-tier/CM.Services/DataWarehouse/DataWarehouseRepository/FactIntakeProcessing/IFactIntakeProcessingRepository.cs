using System;
using System.Threading.Tasks;
using CM.Services.DataWarehouse.DataWarehouseRepository.Base;

namespace CM.Services.DataWarehouse.DataWarehouseRepository.FactIntakeProcessing;

public interface IFactIntakeProcessingRepository : IDwRepository<DataWarehouseDataModel.Models.FactIntakeProcessing>
{
    Task<bool> GetExistedRecord(Guid disputeGuid, int statusId, int earliestStatusId);
}