using System;
using System.Linq;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Services.DataWarehouse.DataWarehouseDataModel;
using CM.Services.DataWarehouse.DataWarehouseRepository.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Services.DataWarehouse.DataWarehouseRepository.LoadingHistory;

public class LoadingHistoryRepository : DwRepository<CM.Services.DataWarehouse.DataWarehouseDataModel.Models.LoadingHistory>, ILoadingHistoryRepository
{
    public LoadingHistoryRepository(DataWarehouseContext context)
        : base(context)
    {
    }

    public async Task<DateTime?> GetLastLoadStartDateTime(int factTableId)
    {
        var isAny = await Context.LoadingHistories.AnyAsync(x => x.FactTableId == factTableId);

        if (isAny)
        {
            var history = await Context
                .LoadingHistories
                .OrderByDescending(x => x.LoadingEventId)
                .FirstOrDefaultAsync(x => x.FactTableId == factTableId);
            return history.LoadStartDateTime;
        }

        return null;
    }
}