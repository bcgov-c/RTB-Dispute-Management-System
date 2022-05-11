using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class AddRemedies : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Remedy",
                columns: table => new
                {
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    RemedyId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    ClaimId = table.Column<int>(nullable: false),
                    RemedyTitle = table.Column<string>(maxLength: 150, nullable: true),
                    RemedyStatus = table.Column<byte>(nullable: true),
                    RemedyType = table.Column<byte>(nullable: true),
                    RemedySource = table.Column<byte>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: true),
                    IsAmended = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Remedy", x => x.RemedyId);
                    table.ForeignKey(
                        name: "FK_Remedy_Claims_ClaimId",
                        column: x => x.ClaimId,
                        principalTable: "Claims",
                        principalColumn: "ClaimId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RemedyDetail",
                columns: table => new
                {
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    RemedyDetailId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    RemedyId = table.Column<int>(nullable: false),
                    DescriptionBy = table.Column<int>(nullable: false),
                    Description = table.Column<string>(maxLength: 500, nullable: true),
                    Amount = table.Column<decimal>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: true),
                    IsAmended = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RemedyDetail", x => x.RemedyDetailId);
                    table.ForeignKey(
                        name: "FK_RemedyDetail_Participants_DescriptionBy",
                        column: x => x.DescriptionBy,
                        principalTable: "Participants",
                        principalColumn: "ParticipantId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RemedyDetail_Remedy_RemedyId",
                        column: x => x.RemedyId,
                        principalTable: "Remedy",
                        principalColumn: "RemedyId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Remedy_ClaimId",
                table: "Remedy",
                column: "ClaimId");

            migrationBuilder.CreateIndex(
                name: "IX_RemedyDetail_DescriptionBy",
                table: "RemedyDetail",
                column: "DescriptionBy");

            migrationBuilder.CreateIndex(
                name: "IX_RemedyDetail_RemedyId",
                table: "RemedyDetail",
                column: "RemedyId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RemedyDetail");

            migrationBuilder.DropTable(
                name: "Remedy");
        }
    }
}
