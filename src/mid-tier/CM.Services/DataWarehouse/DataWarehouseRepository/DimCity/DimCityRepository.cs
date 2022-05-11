using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Services.DataWarehouse.DataWarehouseDataModel;
using CM.Services.DataWarehouse.DataWarehouseRepository.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Services.DataWarehouse.DataWarehouseRepository.DimCity;

public class DimCityRepository : DwRepository<DataWarehouseDataModel.Models.DimCity>, IDimCityRepository
{
    public DimCityRepository(DataWarehouseContext context)
        : base(context)
    {
    }

    public async Task<int> GetCityId(Dispute dispute)
    {
        var id = await Context.DimCities.FirstOrDefaultAsync(x => x.CityName == dispute.TenancyCity);

        if (id == null)
        {
            return Constants.NotFoundOrIncorrect;
        }

        return id.DimCityId;
    }
}