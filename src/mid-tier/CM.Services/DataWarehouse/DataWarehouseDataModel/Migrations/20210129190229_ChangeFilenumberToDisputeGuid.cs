using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.Migrations
{
    public partial class ChangeFileNumberToDisputeGuid : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"delete from public.""FactDisputeSummaries""");
            migrationBuilder.Sql(@"delete from public.""LoadingHistories""");

            migrationBuilder.AddColumn<Guid>(
                name: "DisputeGuid",
                table: "FactDisputeSummaries",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_FactDisputeSummaries_LoadDateTime",
                table: "FactDisputeSummaries",
                column: "LoadDateTime")
                .Annotation("Npgsql:IndexInclude", new[] { "CreationMethod" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_FactDisputeSummaries_LoadDateTime",
                table: "FactDisputeSummaries");

            migrationBuilder.DropColumn(
                name: "DisputeGuid",
                table: "FactDisputeSummaries");
        }
    }
}
