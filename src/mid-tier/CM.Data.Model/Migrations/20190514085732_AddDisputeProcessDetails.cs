using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class AddDisputeProcessDetails : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DisputeProcessDetails",
                columns: table => new
                {
                    DisputeProcessDetailId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    DisputeGuid = table.Column<Guid>(nullable: false),
                    AssociatedProcess = table.Column<byte>(nullable: false),
                    ProcessApplicant1Id = table.Column<int>(nullable: true),
                    ProcessApplicant2Id = table.Column<int>(nullable: true),
                    ProcessDuration = table.Column<int>(nullable: true),
                    ProcessComplexity = table.Column<byte>(nullable: true),
                    ProcessMethod = table.Column<byte>(nullable: true),
                    ProcessOutcomeCode = table.Column<byte>(nullable: true),
                    ProcessOutcomeTitle = table.Column<string>(maxLength: 70, nullable: true),
                    ProcessOutcomeDescription = table.Column<string>(maxLength: 255, nullable: true),
                    ProcessOutcomeNote = table.Column<string>(maxLength: 1000, nullable: true),
                    IsDeleted = table.Column<bool>(nullable: true, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DisputeProcessDetails", x => x.DisputeProcessDetailId);
                    table.ForeignKey(
                        name: "FK_DisputeProcessDetails_Disputes_DisputeGuid",
                        column: x => x.DisputeGuid,
                        principalTable: "Disputes",
                        principalColumn: "DisputeGuid",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DisputeProcessDetails_Participants_ProcessApplicant1Id",
                        column: x => x.ProcessApplicant1Id,
                        principalTable: "Participants",
                        principalColumn: "ParticipantId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DisputeProcessDetails_Participants_ProcessApplicant2Id",
                        column: x => x.ProcessApplicant2Id,
                        principalTable: "Participants",
                        principalColumn: "ParticipantId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DisputeProcessDetails_DisputeGuid",
                table: "DisputeProcessDetails",
                column: "DisputeGuid");

            migrationBuilder.CreateIndex(
                name: "IX_DisputeProcessDetails_ProcessApplicant1Id",
                table: "DisputeProcessDetails",
                column: "ProcessApplicant1Id");

            migrationBuilder.CreateIndex(
                name: "IX_DisputeProcessDetails_ProcessApplicant2Id",
                table: "DisputeProcessDetails",
                column: "ProcessApplicant2Id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DisputeProcessDetails");
        }
    }
}
