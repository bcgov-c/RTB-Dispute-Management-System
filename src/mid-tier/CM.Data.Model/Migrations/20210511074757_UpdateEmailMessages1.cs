using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class UpdateEmailMessages1 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte>(
                name: "MessageSubType",
                table: "EmailMessages",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RelatedMessageId",
                table: "EmailMessages",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RelatedObjectId",
                table: "EmailMessages",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<byte>(
                name: "SendMethod",
                table: "EmailMessages",
                type: "smallint",
                nullable: false,
                defaultValue: (byte)1);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MessageSubType",
                table: "EmailMessages");

            migrationBuilder.DropColumn(
                name: "RelatedMessageId",
                table: "EmailMessages");

            migrationBuilder.DropColumn(
                name: "RelatedObjectId",
                table: "EmailMessages");

            migrationBuilder.DropColumn(
                name: "SendMethod",
                table: "EmailMessages");
        }
    }
}
