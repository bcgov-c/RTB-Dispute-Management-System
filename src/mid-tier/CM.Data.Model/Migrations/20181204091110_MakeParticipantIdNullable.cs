using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class MakeParticipantIdNullable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "OtherParticipantTitleServiceComment",
                table: "FilePackageServices",
                newName: "ServiceComment");

            migrationBuilder.AlterColumn<int>(
                name: "ParticipantId",
                table: "FilePackageServices",
                nullable: true,
                oldClrType: typeof(int));
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ServiceComment",
                table: "FilePackageServices",
                newName: "OtherParticipantTitleServiceComment");

            migrationBuilder.AlterColumn<int>(
                name: "ParticipantId",
                table: "FilePackageServices",
                nullable: false,
                oldClrType: typeof(int),
                oldNullable: true);
        }
    }
}
