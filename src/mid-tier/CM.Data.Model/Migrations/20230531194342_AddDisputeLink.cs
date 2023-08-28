using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CM.Data.Model.Migrations
{
    public partial class AddDisputeLink : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DisputeLinks",
                columns: table => new
                {
                    DisputeLinkId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    DisputeGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    OnlineMeetingId = table.Column<int>(type: "integer", nullable: false),
                    DisputeLinkRole = table.Column<int>(type: "integer", nullable: false),
                    DisputeLinkType = table.Column<int>(type: "integer", nullable: false),
                    DisputeLinkStatus = table.Column<int>(type: "integer", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CreatedBy = table.Column<int>(type: "integer", nullable: true),
                    ModifiedDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    ModifiedBy = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DisputeLinks", x => x.DisputeLinkId);
                    table.ForeignKey(
                        name: "FK_DisputeLinks_Disputes_DisputeGuid",
                        column: x => x.DisputeGuid,
                        principalTable: "Disputes",
                        principalColumn: "DisputeGuid",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DisputeLinks_OnlineMeetings_OnlineMeetingId",
                        column: x => x.OnlineMeetingId,
                        principalTable: "OnlineMeetings",
                        principalColumn: "OnlineMeetingId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DisputeLinks_DisputeGuid",
                table: "DisputeLinks",
                column: "DisputeGuid");

            migrationBuilder.CreateIndex(
                name: "IX_DisputeLinks_OnlineMeetingId",
                table: "DisputeLinks",
                column: "OnlineMeetingId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DisputeLinks");
        }
    }
}
