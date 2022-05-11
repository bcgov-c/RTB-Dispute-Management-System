using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class AddPostedDecisionOutcomes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PostedDecisionOutcomes",
                columns: table => new
                {
                    PostedDecisionOutcomeId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    PostedDecisionId = table.Column<int>(nullable: false),
                    ClaimId = table.Column<int>(nullable: false),
                    RemedyId = table.Column<int>(nullable: false),
                    RemedyType = table.Column<byte>(nullable: false),
                    RemedyStatus = table.Column<byte>(nullable: false),
                    RemedySubStatus = table.Column<byte>(nullable: true),
                    ClaimTitle = table.Column<string>(maxLength: 255, nullable: true),
                    RelatedSections = table.Column<string>(maxLength: 255, nullable: true),
                    RemedyAmountRequested = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    RemedyAmountAwarded = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    PostingDate = table.Column<DateTime>(nullable: true),
                    PostedBy = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PostedDecisionOutcomes", x => x.PostedDecisionOutcomeId);
                    table.ForeignKey(
                        name: "FK_PostedDecisionOutcomes_Claims_ClaimId",
                        column: x => x.ClaimId,
                        principalTable: "Claims",
                        principalColumn: "ClaimId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PostedDecisionOutcomes_SystemUsers_PostedBy",
                        column: x => x.PostedBy,
                        principalTable: "SystemUsers",
                        principalColumn: "SystemUserId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PostedDecisionOutcomes_PostedDecisions_PostedDecisionId",
                        column: x => x.PostedDecisionId,
                        principalTable: "PostedDecisions",
                        principalColumn: "PostedDecisionId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PostedDecisionOutcomes_Remedies_RemedyId",
                        column: x => x.RemedyId,
                        principalTable: "Remedies",
                        principalColumn: "RemedyId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PostedDecisionOutcomes_ClaimId",
                table: "PostedDecisionOutcomes",
                column: "ClaimId");

            migrationBuilder.CreateIndex(
                name: "IX_PostedDecisionOutcomes_PostedBy",
                table: "PostedDecisionOutcomes",
                column: "PostedBy");

            migrationBuilder.CreateIndex(
                name: "IX_PostedDecisionOutcomes_PostedDecisionId",
                table: "PostedDecisionOutcomes",
                column: "PostedDecisionId");

            migrationBuilder.CreateIndex(
                name: "IX_PostedDecisionOutcomes_RemedyId",
                table: "PostedDecisionOutcomes",
                column: "RemedyId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PostedDecisionOutcomes");
        }
    }
}
