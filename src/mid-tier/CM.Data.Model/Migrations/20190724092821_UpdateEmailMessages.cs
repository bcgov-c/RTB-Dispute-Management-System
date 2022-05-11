using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class UpdateEmailMessages : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "MessageGuid",
                table: "EmailMessages",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_EmailMessages_MessageGuid",
                table: "EmailMessages",
                column: "MessageGuid");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_EmailMessages_MessageGuid",
                table: "EmailMessages");

            migrationBuilder.DropColumn(
                name: "MessageGuid",
                table: "EmailMessages");
        }
    }
}
