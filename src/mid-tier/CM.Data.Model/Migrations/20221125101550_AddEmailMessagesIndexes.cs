using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CM.Data.Model.Migrations
{
    public partial class AddEmailMessagesIndexes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_EmailMessages_CreatedDate",
                table: "EmailMessages",
                column: "CreatedDate");

            migrationBuilder.CreateIndex(
                name: "IX_EmailMessages_PreferredSendDate",
                table: "EmailMessages",
                column: "PreferredSendDate");

            migrationBuilder.CreateIndex(
                name: "IX_EmailMessages_SendStatus_MessageType_IsActive",
                table: "EmailMessages",
                columns: new[] { "SendStatus", "MessageType", "IsActive" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_EmailMessages_CreatedDate",
                table: "EmailMessages");

            migrationBuilder.DropIndex(
                name: "IX_EmailMessages_PreferredSendDate",
                table: "EmailMessages");

            migrationBuilder.DropIndex(
                name: "IX_EmailMessages_SendStatus_MessageType_IsActive",
                table: "EmailMessages");
        }
    }
}
