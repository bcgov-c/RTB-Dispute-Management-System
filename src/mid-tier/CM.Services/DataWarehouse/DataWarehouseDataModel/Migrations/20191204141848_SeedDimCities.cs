using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.Migrations
{
    public partial class SeedDimCities : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Abbotsford', ' ', -1, 'TBD', 10, 'Fraser Valley', 133497, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + @"', 'Armstrong', '', -1, 'TBD', 17, 'North Okanagan', 4815, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Burnaby', '', -1, 'TBD', 15, 'Metro Vancouver', 223218, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Campbell River', '', -1, 'TBD', 22, 'Strathcona', 31186, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Castlegar', '', -1, 'TBD', 4, 'Central Kootenay', 7816, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Chilliwack', '', -1, 'TBD', 11, 'Fraser Valley', 77936, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Colwood', '', -1, 'TBD', 2, 'Capital', 16093, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Coquitlam', '', -1, 'TBD', 15, 'Metro Vancouver', 126840, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Courtenay', '', -1, 'TBD', 7, 'Comox Valley', 24099, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Cranbrook', '', -1, 'TBD', 9, 'East Kootenay', 19319, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Dawson Creek', '', -1, 'TBD', 19, 'Peace River', 11583, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Delta', '', -1, 'TBD', 15, 'Metro Vancouver', 99863, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Duncan', '', -1, 'TBD', 8, 'Cowichan Valley', 4932, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Enderby', '', -1, 'TBD', 17, 'North Okanagan', 2932, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Fernie', '', -1, 'TBD', 9, 'East Kootenay', 4448, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Fort St. John', '', -1, 'TBD', 19, 'Peace River', 18609, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Grand Forks', '', -1, 'TBD', 14, 'Kootenay Boundary', 3985, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Greenwood', '', -1, 'TBD', 14, 'Kootenay Boundary', 708, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Kamloops', '', -1, 'TBD', 23, 'Thompson-Nicola', 85678, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Kelowna', '', -1, 'TBD', 5, 'Central Okanagan', 117312, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Kimberley', '', -1, 'TBD', 9, 'East Kootenay', 6652, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Langford', '', -1, 'TBD', 2, 'Capital', 29228, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Langley', '', -1, 'TBD', 15, 'Metro Vancouver', 25081, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Maple Ridge', '', -1, 'TBD', 15, 'Metro Vancouver', 76052, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Merritt', '', -1, 'TBD', 24, 'Thompson-Nicola', 7113, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Nanaimo', '', -1, 'TBD', 16, 'Nanaimo', 83810, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Nelson', '', -1, 'TBD', 4, 'Central Kootenay', 10230, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'New Westminster', '', -1, 'TBD', 15, 'Metro Vancouver', 65976, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'North Vancouver', '', -1, 'TBD', 15, 'Metro Vancouver', 48196, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Other', '', -1, 'TBD', 9999, 'N/A', -1, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Parksville', '', -1, 'TBD', 16, 'Nanaimo', 11977, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Penticton', '', -1, 'TBD', 18, 'Okanagan-Similkameen', 32877, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Pitt Meadows', '', -1, 'TBD', 15, 'Metro Vancouver', 17736, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Port Alberni', '', -1, 'TBD', 1, 'Alberni-Clayoquot', 17743, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Port Coquitlam', '', -1, 'TBD', 15, 'Metro Vancouver', 55958, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Port Moody', '', -1, 'TBD', 15, 'Metro Vancouver', 32975, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Powell River', '', -1, 'TBD', 20, 'Powell River', 13165, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Prince George', '', -1, 'TBD', 12, 'Fraser-Fort George', 71974, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Prince Rupert', '', -1, 'TBD', 21, 'Skeena-Queen Charlotte', 12508, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Quesnel', '', -1, 'TBD', 3, 'Cariboo', 10007, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Revelstoke', '', -1, 'TBD', 6, 'Columbia Shuswap', 7139, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Richmond', '', -1, 'TBD', 15, 'Metro Vancouver', 190473, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Rossland', '', -1, 'TBD', 14, 'Kootenay Boundary', 3556, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Salmon Arm', '', -1, 'TBD', 6, 'Columbia Shuswap', 17464, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Surrey', '', -1, 'TBD', 15, 'Metro Vancouver', 468251, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Terrace', '', -1, 'TBD', 13, 'Kitimat-Stikine', 11486, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Trail', '', -1, 'TBD', 14, 'Kootenay Boundary', 7681, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Vancouver', '', -1, 'TBD', 15, 'Metro Vancouver', 603502, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Vernon', '', -1, 'TBD', 17, 'North Okanagan', 38150, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Victoria', '', -1, 'TBD', 2, 'Capital', 80017, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'West Kelowna', '', -1, 'TBD', 5, 'Central Okanagan', 30892, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'White Rock', '', -1, 'TBD', 15, 'Metro Vancouver', 19339, 1, 'BC', 1, 'Canada');");
            migrationBuilder.Sql(@"INSERT INTO public.""DimCities""(""DateInserted"", ""CityName"", ""CityNameSoundEx"", ""RegionId"", ""RegionName"", ""SubRegionId"", ""SubRegionName"", ""CityPopulation"", ""ProvinceId"", ""ProvinceName"", ""CountryId"", ""CountryName"")
                                VALUES ('" + DateTime.Now.Date + "', 'Williams Lake', '', -1, 'TBD', 3, 'Cariboo', 10832, 1, 'BC', 1, 'Canada');");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Abbotsford'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Armstrong'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Burnaby'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Campbell River'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Castlegar'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Chilliwack'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Colwood'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Coquitlam'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Courtenay'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Cranbrook'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Dawson Creek'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Delta'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Duncan'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Enderby'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Fernie'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Fort St. John'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Grand Forks'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Greenwood'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Kamloops'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Kelowna'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Kimberley'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Langford'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Langley'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Maple Ridge'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Merritt'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Nanaimo'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Nelson'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='New Westminster'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='North Vancouver'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Other'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Parksville'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Penticton'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Pitt Meadows'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Port Alberni'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Port Coquitlam'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Port Moody'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Powell River'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Prince George'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Prince Rupert'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Quesnel'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Revelstoke'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Richmond'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Rossland'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Salmon Arm'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Surrey'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Terrace'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Trail'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Vancouver'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Vernon'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Victoria'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='West Kelowna'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='White Rock'");
            migrationBuilder.Sql(@"delete from public.""DimCities"" where ""CityName""='Williams Lake'");
        }
    }
}
