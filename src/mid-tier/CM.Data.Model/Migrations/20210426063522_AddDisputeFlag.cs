using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class AddDisputeFlag : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DisputeFlags",
                columns: table => new
                {
                    DisputeFlagId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    DisputeGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    FlagTitle = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    FlagStatus = table.Column<byte>(type: "smallint", nullable: false, defaultValue: (byte)1),
                    FlagType = table.Column<byte>(type: "smallint", nullable: false),
                    FlagSubType = table.Column<byte>(type: "smallint", nullable: true),
                    IsPublic = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    RelatedObjectId = table.Column<int>(type: "integer", nullable: true),
                    FlagParticipantId = table.Column<int>(type: "integer", nullable: true),
                    FlagOwnerId = table.Column<int>(type: "integer", nullable: true),
                    FlagStartDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    FlagEndDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: true, defaultValue: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CreatedBy = table.Column<int>(type: "integer", nullable: true),
                    ModifiedDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    ModifiedBy = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DisputeFlags", x => x.DisputeFlagId);
                    table.ForeignKey(
                        name: "FK_DisputeFlags_Disputes_DisputeGuid",
                        column: x => x.DisputeGuid,
                        principalTable: "Disputes",
                        principalColumn: "DisputeGuid",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DisputeFlags_DisputeGuid",
                table: "DisputeFlags",
                column: "DisputeGuid");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DisputeFlags");
        }
    }
}
