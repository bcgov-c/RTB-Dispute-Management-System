using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AllowNullForOutcomeDocAffectedDocuments : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "AffectedDocuments",
                table: "OutcomeDocRequests",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "AffectedDocuments",
                table: "OutcomeDocRequests",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);
        }
    }
}
