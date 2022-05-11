using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.Migrations
{
    public partial class AddSystemUserAndUserToken : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SystemUsers",
                columns: table => new
                {
                    SystemUserId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IsActive = table.Column<bool>(nullable: true),
                    Username = table.Column<string>(maxLength: 50, nullable: false),
                    Password = table.Column<string>(maxLength: 250, nullable: true),
                    FullName = table.Column<string>(maxLength: 100, nullable: true),
                    AccountEmail = table.Column<string>(maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SystemUsers", x => x.SystemUserId);
                });

            migrationBuilder.CreateTable(
                name: "UserTokens",
                columns: table => new
                {
                    UserTokenId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AuthToken = table.Column<string>(maxLength: 250, nullable: false),
                    IssuedOn = table.Column<DateTime>(nullable: false),
                    ExpiresOn = table.Column<DateTime>(nullable: false),
                    SystemUserId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserTokens", x => x.UserTokenId);
                    table.ForeignKey(
                        name: "FK_UserTokens_SystemUsers_SystemUserId",
                        column: x => x.SystemUserId,
                        principalTable: "SystemUsers",
                        principalColumn: "SystemUserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserTokens_SystemUserId",
                table: "UserTokens",
                column: "SystemUserId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserTokens");

            migrationBuilder.DropTable(
                name: "SystemUsers");
        }
    }
}
