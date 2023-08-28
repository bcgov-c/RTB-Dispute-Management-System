using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.Migrations
{
    public partial class AddFactIssueOutcome : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FactIssueOutcomes",
                columns: table => new
                {
                    IssueOutcomeRecordId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    LoadDateTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AssociatedOffice = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsPublic = table.Column<bool>(type: "boolean", nullable: false),
                    DisputeGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    ClaimGroupId = table.Column<int>(type: "integer", nullable: true),
                    ClaimId = table.Column<int>(type: "integer", nullable: true),
                    ClaimCreatedDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    AwardDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    AwardedBy = table.Column<int>(type: "integer", nullable: true),
                    ClaimCode = table.Column<int>(type: "integer", nullable: true),
                    IsAmended = table.Column<bool>(type: "boolean", nullable: true),
                    RemedyStatus = table.Column<int>(type: "integer", nullable: true),
                    RemedySubtatus = table.Column<int>(type: "integer", nullable: true),
                    RequestedAmount = table.Column<decimal>(type: "numeric(10,2)", nullable: true),
                    AwardedAmount = table.Column<decimal>(type: "numeric(10,2)", nullable: true),
                    AwardedDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    AwardedDaysAfterService = table.Column<int>(type: "integer", nullable: true),
                    IsReviewed = table.Column<bool>(type: "boolean", nullable: true),
                    PrevRemedyStatus = table.Column<int>(type: "integer", nullable: true),
                    PrevAwardDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    PrevAwardedBy = table.Column<int>(type: "integer", nullable: true),
                    PrevAwardedDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    PrevAwardedDaysAfterService = table.Column<int>(type: "integer", nullable: true),
                    PrevAwardedAmount = table.Column<decimal>(type: "numeric(10,2)", nullable: true),
                    DisputeUrgency = table.Column<int>(type: "integer", nullable: true),
                    DisputeCreationMethod = table.Column<int>(type: "integer", nullable: true),
                    DisputeType = table.Column<int>(type: "integer", nullable: true),
                    DisputeSubType = table.Column<int>(type: "integer", nullable: true),
                    CreationMethod = table.Column<int>(type: "integer", nullable: true),
                    SubmittedDateTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    InitialPaymentDateTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    InitialPaymentMethod = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FactIssueOutcomes", x => x.IssueOutcomeRecordId);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FactIssueOutcomes");
        }
    }
}
