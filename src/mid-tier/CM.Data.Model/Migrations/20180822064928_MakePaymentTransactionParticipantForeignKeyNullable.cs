using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class MakePaymentTransactionParticipantForeignKeyNullable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "TransactionBy",
                table: "PaymentTransactions",
                nullable: true,
                oldClrType: typeof(int));
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "TransactionBy",
                table: "PaymentTransactions",
                nullable: false,
                oldClrType: typeof(int),
                oldNullable: true);
        }
    }
}
