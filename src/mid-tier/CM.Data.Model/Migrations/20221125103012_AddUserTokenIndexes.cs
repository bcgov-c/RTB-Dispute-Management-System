using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CM.Data.Model.Migrations
{
    public partial class AddUserTokenIndexes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_UserTokens_ExpiresOn_AuthToken",
                table: "UserTokens",
                columns: new[] { "ExpiresOn", "AuthToken" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UserTokens_ExpiresOn_AuthToken",
                table: "UserTokens");
        }
    }
}
