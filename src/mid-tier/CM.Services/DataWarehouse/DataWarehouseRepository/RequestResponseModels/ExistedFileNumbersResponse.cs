using System;

namespace CM.Services.DataWarehouse.DataWarehouseRepository.RequestResponseModels;

public class ExistedFileNumbersResponse
{
    public int DisputeSummaryRecordId { get; set; }

    public DateTime LoadDateTime { get; set; }

    public Guid DisputeGuid { get; set; }
}