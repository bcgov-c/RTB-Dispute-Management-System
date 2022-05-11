using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class AddDisputeHearings : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ConferenceBridge_SystemUsers_PreferedOwner",
                table: "ConferenceBridge");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ConferenceBridge",
                table: "ConferenceBridge");

            migrationBuilder.RenameTable(
                name: "ConferenceBridge",
                newName: "ConferenceBridges");

            migrationBuilder.RenameIndex(
                name: "IX_ConferenceBridge_PreferedOwner",
                table: "ConferenceBridges",
                newName: "IX_ConferenceBridges_PreferedOwner");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ConferenceBridges",
                table: "ConferenceBridges",
                column: "ConferenceBridgeId");

            migrationBuilder.CreateTable(
                name: "DisputeHearings",
                columns: table => new
                {
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    DisputeHearingId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    HearingId = table.Column<int>(nullable: false),
                    DisputeGuid = table.Column<Guid>(nullable: false),
                    DisputeHearingRole = table.Column<byte>(nullable: false),
                    DisputeHearingStatus = table.Column<byte>(nullable: true, defaultValue: (byte)1),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DisputeHearings", x => x.DisputeHearingId);
                    table.ForeignKey(
                        name: "FK_DisputeHearings_Disputes_DisputeGuid",
                        column: x => x.DisputeGuid,
                        principalTable: "Disputes",
                        principalColumn: "DisputeGuid",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DisputeHearings_Hearings_HearingId",
                        column: x => x.HearingId,
                        principalTable: "Hearings",
                        principalColumn: "HearingId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DisputeHearings_DisputeGuid",
                table: "DisputeHearings",
                column: "DisputeGuid");

            migrationBuilder.CreateIndex(
                name: "IX_DisputeHearings_HearingId",
                table: "DisputeHearings",
                column: "HearingId");

            migrationBuilder.AddForeignKey(
                name: "FK_ConferenceBridges_SystemUsers_PreferedOwner",
                table: "ConferenceBridges",
                column: "PreferedOwner",
                principalTable: "SystemUsers",
                principalColumn: "SystemUserId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ConferenceBridges_SystemUsers_PreferedOwner",
                table: "ConferenceBridges");

            migrationBuilder.DropTable(
                name: "DisputeHearings");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ConferenceBridges",
                table: "ConferenceBridges");

            migrationBuilder.RenameTable(
                name: "ConferenceBridges",
                newName: "ConferenceBridge");

            migrationBuilder.RenameIndex(
                name: "IX_ConferenceBridges_PreferedOwner",
                table: "ConferenceBridge",
                newName: "IX_ConferenceBridge_PreferedOwner");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ConferenceBridge",
                table: "ConferenceBridge",
                column: "ConferenceBridgeId");

            migrationBuilder.AddForeignKey(
                name: "FK_ConferenceBridge_SystemUsers_PreferedOwner",
                table: "ConferenceBridge",
                column: "PreferedOwner",
                principalTable: "SystemUsers",
                principalColumn: "SystemUserId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
