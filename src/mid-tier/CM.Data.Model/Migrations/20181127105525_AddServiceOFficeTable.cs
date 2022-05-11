using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class AddServiceOFficeTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ServiceOffices",
                columns: table => new
                {
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    ServiceOfficeId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    OfficeName = table.Column<string>(maxLength: 100, nullable: false),
                    OfficeAbbreviation = table.Column<string>(maxLength: 10, nullable: true),
                    OfficeDescription = table.Column<string>(maxLength: 255, nullable: true),
                    OfficeTimezone = table.Column<string>(maxLength: 100, nullable: false),
                    OfficeTimezoneUTCOffset = table.Column<byte>(nullable: false),
                    OfficeStatus = table.Column<byte>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceOffices", x => x.ServiceOfficeId);
                });

            migrationBuilder.Sql(@"INSERT INTO public.""ServiceOffices""(""OfficeName"", ""OfficeAbbreviation"", ""OfficeDescription"", ""OfficeTimezone"", ""OfficeTimezoneUTCOffset"" ) 
                                   VALUES ('Residential Tenancy Branch BC', 'RTB', ' ', 'PST - Pacific Standard Time', -8)");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ServiceOffices");
        }
    }
}
