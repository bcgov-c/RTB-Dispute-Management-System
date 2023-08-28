using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CM.Data.Model.Migrations
{
    public partial class AddServiceComment : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ServiceComment",
                table: "ServiceAuditLogs",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ServiceComment",
                table: "ServiceAuditLogs");
        }
    }
}
