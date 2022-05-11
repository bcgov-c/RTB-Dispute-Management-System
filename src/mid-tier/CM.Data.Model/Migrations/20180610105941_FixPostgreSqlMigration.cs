using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class FixPostgreSqlMigration : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte>(
                name: "EvidenceOverride",
                table: "DisputeStatuses",
                nullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "SecurityDepositAmount",
                table: "Disputes",
                nullable: true,
                oldClrType: typeof(int),
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "PetDamageDepositAmount",
                table: "Disputes",
                nullable: true,
                oldClrType: typeof(int),
                oldNullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "RentPaymentAmount",
                table: "Disputes",
                nullable: true);

            migrationBuilder.AddColumn<byte>(
                name: "AmendmentSource",
                table: "Amendments",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EvidenceOverride",
                table: "DisputeStatuses");

            migrationBuilder.DropColumn(
                name: "RentPaymentAmount",
                table: "Disputes");

            migrationBuilder.DropColumn(
                name: "AmendmentSource",
                table: "Amendments");

            migrationBuilder.AlterColumn<int>(
                name: "SecurityDepositAmount",
                table: "Disputes",
                nullable: true,
                oldClrType: typeof(decimal),
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "PetDamageDepositAmount",
                table: "Disputes",
                nullable: true,
                oldClrType: typeof(decimal),
                oldNullable: true);
        }
    }
}
