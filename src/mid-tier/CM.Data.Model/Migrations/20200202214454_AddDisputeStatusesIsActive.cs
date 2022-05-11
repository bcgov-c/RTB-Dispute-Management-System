using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddDisputeStatusesIsActive : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "DisputeStatuses",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_DisputeStatuses_DisputeGuid_IsActive",
                table: "DisputeStatuses",
                columns: new[] { "DisputeGuid", "IsActive" },
                unique: true,
                filter: "\"IsActive\" = true");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_DisputeStatuses_DisputeGuid_IsActive",
                table: "DisputeStatuses");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "DisputeStatuses");
        }
    }
}
