using System;
using System.ComponentModel.DataAnnotations;

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.Models;

public class DimCity
{
    [Key]
    public int DimCityId { get; set; }

    public DateTime DateInserted { get; set; }

    [StringLength(50)]
    public string CityName { get; set; }

    [StringLength(5)]
    public string CityNameSoundEx { get; set; }

    public int? CityPopulation { get; set; }

    public int? RegionId { get; set; }

    [StringLength(50)]
    public string RegionName { get; set; }

    public int SubRegionId { get; set; }

    [StringLength(50)]
    public string SubRegionName { get; set; }

    public int ProvinceId { get; set; }

    [StringLength(50)]
    public string ProvinceName { get; set; }

    public int CountryId { get; set; }

    [StringLength(50)]
    public string CountryName { get; set; }
}