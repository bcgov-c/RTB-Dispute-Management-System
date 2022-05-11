using System;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Services.DataWarehouse.DataWarehouseDataModel;
using CM.Services.DataWarehouse.DataWarehouseRepository.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Services.DataWarehouse.DataWarehouseRepository.DimTime;

public class DimTimeRepository : DwRepository<CM.Services.DataWarehouse.DataWarehouseDataModel.Models.DimTime>, IDimTimeRepository
{
    public DimTimeRepository(DataWarehouseContext context)
        : base(context)
    {
    }

    public async Task<int> GetIdByDate(DateTime date)
    {
        var dimTime = await Context.DimTimes.FirstOrDefaultAsync(x => x.AssociatedDate == date.Date);

        if (dimTime == null)
        {
            return Constants.NotFoundOrIncorrect;
        }

        return dimTime.DimTimeId;
    }
}