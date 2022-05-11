using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class AddCustomDataObject : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CustomDataObjects",
                columns: table => new
                {
                    CustomDataObjectId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    DisputeGuid = table.Column<Guid>(nullable: false),
                    ObjectType = table.Column<int>(nullable: false),
                    ObjectSubType = table.Column<byte>(nullable: true),
                    Description = table.Column<string>(maxLength: 255, nullable: true),
                    IsActive = table.Column<bool>(nullable: true),
                    ObjectStatus = table.Column<byte>(nullable: true),
                    ObjectJson = table.Column<string>(type: "jsonb", nullable: true),
                    IsDeleted = table.Column<bool>(nullable: true, defaultValue: false),
                    IsAmmended = table.Column<bool>(nullable: true, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomDataObjects", x => x.CustomDataObjectId);
                    table.ForeignKey(
                        name: "FK_CustomDataObjects_Disputes_DisputeGuid",
                        column: x => x.DisputeGuid,
                        principalTable: "Disputes",
                        principalColumn: "DisputeGuid",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CustomDataObjects_DisputeGuid",
                table: "CustomDataObjects",
                column: "DisputeGuid");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CustomDataObjects");
        }
    }
}
