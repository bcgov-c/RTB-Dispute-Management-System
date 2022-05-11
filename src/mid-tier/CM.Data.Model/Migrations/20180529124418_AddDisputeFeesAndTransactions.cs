using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class AddDisputeFeesAndTransactions : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DisputeFees",
                columns: table => new
                {
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    DisputeFeeId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    DisputeGuid = table.Column<Guid>(nullable: false),
                    DueDate = table.Column<DateTime>(nullable: true),
                    IsActive = table.Column<bool>(nullable: true),
                    FeeType = table.Column<byte>(nullable: true),
                    FeeDescription = table.Column<string>(maxLength: 255, nullable: true),
                    PayorId = table.Column<int>(nullable: true),
                    AmountDue = table.Column<decimal>(nullable: true),
                    MethodPaid = table.Column<byte>(nullable: true),
                    IsPaid = table.Column<bool>(nullable: true),
                    AmountPaid = table.Column<decimal>(nullable: true),
                    DatePaid = table.Column<DateTime>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DisputeFees", x => x.DisputeFeeId);
                    table.ForeignKey(
                        name: "FK_DisputeFees_Disputes_DisputeGuid",
                        column: x => x.DisputeGuid,
                        principalTable: "Disputes",
                        principalColumn: "DisputeGuid",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PaymentTransactions",
                columns: table => new
                {
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    PaymentTransactionId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    DisputeFeeid = table.Column<int>(nullable: false),
                    TransactionMethod = table.Column<byte>(nullable: false),
                    OfficePaymentIdir = table.Column<string>(maxLength: 50, nullable: true),
                    TransactionBy = table.Column<int>(nullable: false),
                    TransactionAmount = table.Column<decimal>(nullable: true),
                    PaymentStatus = table.Column<byte>(nullable: true),
                    FeeWaiverTenantsFamily = table.Column<byte>(nullable: true),
                    FeeWaiverIncome = table.Column<decimal>(nullable: true),
                    FeeWaiverCitySize = table.Column<byte>(nullable: true),
                    PaymentUrl = table.Column<string>(maxLength: 1000, nullable: true),
                    CardType = table.Column<string>(nullable: true),
                    TrnReqDate = table.Column<DateTime>(nullable: true),
                    TrnApproved = table.Column<bool>(nullable: false),
                    TrnDate = table.Column<DateTime>(nullable: true),
                    TrnId = table.Column<string>(maxLength: 10, nullable: true),
                    TrnType = table.Column<string>(maxLength: 3, nullable: true),
                    PaymentVerified = table.Column<byte>(nullable: true),
                    PaymentVerifyRetries = table.Column<byte>(nullable: true),
                    DisplayMsg = table.Column<string>(maxLength: 100, nullable: true),
                    TrnResponse = table.Column<int>(nullable: true),
                    PaymentProvider = table.Column<byte>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentTransactions", x => x.PaymentTransactionId);
                    table.ForeignKey(
                        name: "FK_PaymentTransactions_DisputeFees_DisputeFeeid",
                        column: x => x.DisputeFeeid,
                        principalTable: "DisputeFees",
                        principalColumn: "DisputeFeeId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PaymentTransactions_Participants_TransactionBy",
                        column: x => x.TransactionBy,
                        principalTable: "Participants",
                        principalColumn: "ParticipantId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DisputeFees_DisputeGuid",
                table: "DisputeFees",
                column: "DisputeGuid");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentTransactions_DisputeFeeid",
                table: "PaymentTransactions",
                column: "DisputeFeeid");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentTransactions_TransactionBy",
                table: "PaymentTransactions",
                column: "TransactionBy");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PaymentTransactions");

            migrationBuilder.DropTable(
                name: "DisputeFees");
        }
    }
}
