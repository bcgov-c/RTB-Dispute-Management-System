using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class AddAutoText : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AutoTexts",
                columns: table => new
                {
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    AutoTextId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    TextTitle = table.Column<string>(maxLength: 255, nullable: true),
                    TextType = table.Column<byte>(nullable: false),
                    TextSubType = table.Column<byte>(nullable: true),
                    TextStatus = table.Column<byte>(nullable: true),
                    TextPrivacy = table.Column<byte>(nullable: true),
                    TextOwner = table.Column<int>(nullable: true),
                    TextContent = table.Column<string>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: true, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AutoTexts", x => x.AutoTextId);
                    table.ForeignKey(
                        name: "FK_AutoTexts_SystemUsers_TextOwner",
                        column: x => x.TextOwner,
                        principalTable: "SystemUsers",
                        principalColumn: "SystemUserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AutoTexts_TextOwner",
                table: "AutoTexts",
                column: "TextOwner");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AutoTexts");
        }
    }
}
