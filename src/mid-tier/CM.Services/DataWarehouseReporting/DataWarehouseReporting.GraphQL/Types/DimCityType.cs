using DataWarehouseReporting.Data.Models;
using GraphQL.Types;

namespace DataWarehouseReporting.GraphQL.Types;

public sealed class DimCityType : ObjectGraphType<DimCity>
{
    public DimCityType()
    {
        Name = "DimCityType";
        Description = "DimCityType";

        Field(x => x.CityName);
        Field(x => x.CityPopulation, true);
        Field(x => x.CountryId, true);
        Field(x => x.CountryName);
        Field(x => x.DateInserted);
        Field(x => x.ProvinceId);
        Field(x => x.ProvinceName);
        Field(x => x.RegionId, true);
        Field(x => x.RegionName);
        Field(x => x.DimCityId);
        Field(x => x.SubRegionId);
        Field(x => x.SubRegionName);
        Field(x => x.CityNameSoundEx);
    }
}