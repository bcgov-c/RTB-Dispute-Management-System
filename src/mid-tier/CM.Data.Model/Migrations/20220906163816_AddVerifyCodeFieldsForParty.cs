using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CM.Data.Model.Migrations
{
    public partial class AddVerifyCodeFieldsForParty : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EmailVerifyCode",
                table: "Participants",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PrimaryPhoneVerifyCode",
                table: "Participants",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SecondaryPhoneVerifyCode",
                table: "Participants",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EmailVerifyCode",
                table: "Participants");

            migrationBuilder.DropColumn(
                name: "PrimaryPhoneVerifyCode",
                table: "Participants");

            migrationBuilder.DropColumn(
                name: "SecondaryPhoneVerifyCode",
                table: "Participants");
        }
    }
}
