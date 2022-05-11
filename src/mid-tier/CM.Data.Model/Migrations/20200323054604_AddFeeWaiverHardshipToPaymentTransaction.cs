using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddFeeWaiverHardshipToPaymentTransaction : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "FeeWaiverHardship",
                table: "PaymentTransactions",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FeeWaiverHardshipDetails",
                table: "PaymentTransactions",
                maxLength: 255,
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FeeWaiverHardship",
                table: "PaymentTransactions");

            migrationBuilder.DropColumn(
                name: "FeeWaiverHardshipDetails",
                table: "PaymentTransactions");
        }
    }
}
