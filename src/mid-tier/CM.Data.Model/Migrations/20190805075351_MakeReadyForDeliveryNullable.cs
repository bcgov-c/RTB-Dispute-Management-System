using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class MakeReadyForDeliveryNullable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<bool>(
                name: "ReadyForDelivery",
                table: "OutcomeDocDeliveries",
                nullable: true,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldDefaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<bool>(
                name: "ReadyForDelivery",
                table: "OutcomeDocDeliveries",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldNullable: true,
                oldDefaultValue: false);
        }
    }
}
