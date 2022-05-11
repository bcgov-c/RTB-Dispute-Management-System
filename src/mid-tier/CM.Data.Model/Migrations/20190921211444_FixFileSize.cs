using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class FixFileSize : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<long>(
                name: "FileSize",
                table: "Files",
                nullable: false,
                oldClrType: typeof(int));

            migrationBuilder.AlterColumn<long>(
                name: "FileSize",
                table: "CommonFiles",
                nullable: false,
                oldClrType: typeof(int));

            migrationBuilder.AlterColumn<string>(
                name: "Fax_Area",
                table: "CMSParticipants",
                maxLength: 30,
                nullable: true,
                oldClrType: typeof(string),
                oldMaxLength: 15,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "DayTime_Phone",
                table: "CMSParticipants",
                maxLength: 62,
                nullable: true,
                oldClrType: typeof(string),
                oldMaxLength: 40,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "DayTime_Area",
                table: "CMSParticipants",
                maxLength: 30,
                nullable: true,
                oldClrType: typeof(string),
                oldMaxLength: 15,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Reference_Number",
                table: "CMSData",
                maxLength: 30,
                nullable: true,
                oldClrType: typeof(string),
                oldMaxLength: 15,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Parent_File_Number",
                table: "CMSData",
                maxLength: 30,
                nullable: true,
                oldClrType: typeof(string),
                oldMaxLength: 15,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Dispute_Province",
                table: "CMSData",
                maxLength: 30,
                nullable: true,
                oldClrType: typeof(string),
                oldMaxLength: 15,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "DRO_Name",
                table: "CMSData",
                maxLength: 61,
                nullable: true,
                oldClrType: typeof(string),
                oldMaxLength: 40,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "DRO_Location",
                table: "CMSData",
                maxLength: 101,
                nullable: true,
                oldClrType: typeof(string),
                oldMaxLength: 40,
                oldNullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "FileSize",
                table: "Files",
                nullable: false,
                oldClrType: typeof(long));

            migrationBuilder.AlterColumn<int>(
                name: "FileSize",
                table: "CommonFiles",
                nullable: false,
                oldClrType: typeof(long));

            migrationBuilder.AlterColumn<string>(
                name: "Fax_Area",
                table: "CMSParticipants",
                maxLength: 15,
                nullable: true,
                oldClrType: typeof(string),
                oldMaxLength: 30,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "DayTime_Phone",
                table: "CMSParticipants",
                maxLength: 40,
                nullable: true,
                oldClrType: typeof(string),
                oldMaxLength: 62,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "DayTime_Area",
                table: "CMSParticipants",
                maxLength: 15,
                nullable: true,
                oldClrType: typeof(string),
                oldMaxLength: 30,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Reference_Number",
                table: "CMSData",
                maxLength: 15,
                nullable: true,
                oldClrType: typeof(string),
                oldMaxLength: 30,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Parent_File_Number",
                table: "CMSData",
                maxLength: 15,
                nullable: true,
                oldClrType: typeof(string),
                oldMaxLength: 30,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Dispute_Province",
                table: "CMSData",
                maxLength: 15,
                nullable: true,
                oldClrType: typeof(string),
                oldMaxLength: 30,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "DRO_Name",
                table: "CMSData",
                maxLength: 40,
                nullable: true,
                oldClrType: typeof(string),
                oldMaxLength: 61,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "DRO_Location",
                table: "CMSData",
                maxLength: 40,
                nullable: true,
                oldClrType: typeof(string),
                oldMaxLength: 101,
                oldNullable: true);
        }
    }
}
