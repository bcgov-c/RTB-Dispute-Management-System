using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class AddHearingImport : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<byte>(
                name: "TaskPriority",
                table: "Tasks",
                nullable: false,
                oldClrType: typeof(byte),
                oldDefaultValue: (byte)1);

            migrationBuilder.CreateTable(
                name: "HearingImports",
                columns: table => new
                {
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    HearingImportId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    ImportFileId = table.Column<int>(nullable: false),
                    ImportStatus = table.Column<byte>(nullable: false),
                    ImportStartDateTime = table.Column<DateTime>(nullable: true),
                    ImportEndDateTime = table.Column<DateTime>(nullable: true),
                    ImportNote = table.Column<string>(maxLength: 255, nullable: true),
                    ImportProcessLog = table.Column<string>(nullable: true),
                    ImportOfficeId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HearingImports", x => x.HearingImportId);
                    table.ForeignKey(
                        name: "FK_HearingImports_CommonFiles_ImportFileId",
                        column: x => x.ImportFileId,
                        principalTable: "CommonFiles",
                        principalColumn: "CommonFileId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_HearingImports_ImportFileId",
                table: "HearingImports",
                column: "ImportFileId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HearingImports");

            migrationBuilder.AlterColumn<byte>(
                name: "TaskPriority",
                table: "Tasks",
                nullable: false,
                defaultValue: (byte)1,
                oldClrType: typeof(byte));
        }
    }
}
