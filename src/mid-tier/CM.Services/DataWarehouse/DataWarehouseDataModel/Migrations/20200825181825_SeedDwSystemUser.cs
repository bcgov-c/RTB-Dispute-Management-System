using CM.Common.Utilities;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.Migrations
{
    public partial class SeedDwSystemUser : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql($@"CREATE EXTENSION IF NOT EXISTS ""uuid-ossp"";
                    INSERT INTO public.""SystemUsers""
                    (""IsActive"", ""FullName"", ""Username"", ""Password"" )
                    VALUES
                    (true, 'DWDataUser', 'DWDataUser', '{HashHelper.GetHash("DWDataUser")}')");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"delete from public.""SystemUsers"" where ""Username"" = 'DWDataUser'");
        }
    }
}
