using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddTenancyAgreementFieldsToDispute : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "TenancyAgreementDate",
                table: "Disputes",
                nullable: true);

            migrationBuilder.AddColumn<byte>(
                name: "TenancyAgreementSignedBy",
                table: "Disputes",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TenancyAgreementDate",
                table: "Disputes");

            migrationBuilder.DropColumn(
                name: "TenancyAgreementSignedBy",
                table: "Disputes");
        }
    }
}
