using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddReconciliationFieldsToPaymentTransaction : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ReconcileDate",
                table: "PaymentTransactions",
                nullable: true);

            migrationBuilder.AddColumn<byte>(
                name: "ReconcileStatus",
                table: "PaymentTransactions",
                nullable: true,
                defaultValue: (byte)0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReconcileDate",
                table: "PaymentTransactions");

            migrationBuilder.DropColumn(
                name: "ReconcileStatus",
                table: "PaymentTransactions");
        }
    }
}
