using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class AddArchiveNotesTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CMSArchiveNotes",
                columns: table => new
                {
                    CMS_Note_ID = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    File_Number = table.Column<string>(maxLength: 20, nullable: false),
                    CMS_Note = table.Column<string>(maxLength: 1000, nullable: false),
                    Created_Date = table.Column<DateTime>(nullable: true),
                    Created_By = table.Column<string>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CMSArchiveNotes", x => x.CMS_Note_ID);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CMSArchiveNotes");
        }
    }
}
