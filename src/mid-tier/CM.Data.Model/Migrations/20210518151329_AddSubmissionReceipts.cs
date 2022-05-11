using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class AddSubmissionReceipts : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SubmissionReceipts",
                columns: table => new
                {
                    SubmissionReceiptId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    DisputeGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    ParticipantId = table.Column<int>(type: "integer", nullable: false),
                    ReceiptType = table.Column<byte>(type: "smallint", nullable: false),
                    ReceiptSubType = table.Column<byte>(type: "smallint", nullable: true),
                    ReceiptTitle = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ReceiptBody = table.Column<string>(type: "text", nullable: true),
                    ReceiptDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    ReceiptPrinted = table.Column<bool>(type: "boolean", nullable: true),
                    ReceiptEmailed = table.Column<bool>(type: "boolean", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CreatedBy = table.Column<int>(type: "integer", nullable: true),
                    ModifiedDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    ModifiedBy = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubmissionReceipts", x => x.SubmissionReceiptId);
                    table.ForeignKey(
                        name: "FK_SubmissionReceipts_Disputes_DisputeGuid",
                        column: x => x.DisputeGuid,
                        principalTable: "Disputes",
                        principalColumn: "DisputeGuid",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SubmissionReceipts_DisputeGuid",
                table: "SubmissionReceipts",
                column: "DisputeGuid");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SubmissionReceipts");
        }
    }
}
