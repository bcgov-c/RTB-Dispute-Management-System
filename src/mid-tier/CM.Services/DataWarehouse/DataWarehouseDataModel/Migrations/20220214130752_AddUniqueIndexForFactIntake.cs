using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.Migrations
{
    public partial class AddUniqueIndexForFactIntake : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_FactIntakeProcessings_DisputeGuid_ProcessStartDisputeStatus~",
                table: "FactIntakeProcessings",
                columns: new[] { "DisputeGuid", "ProcessStartDisputeStatusId", "ProcessEndDisputeStatusId" },
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_FactIntakeProcessings_DisputeGuid_ProcessStartDisputeStatus~",
                table: "FactIntakeProcessings");
        }
    }
}
