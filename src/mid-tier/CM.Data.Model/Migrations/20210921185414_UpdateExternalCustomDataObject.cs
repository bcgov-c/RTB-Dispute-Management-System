using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class UpdateExternalCustomDataObject : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Token",
                table: "ExternalCustomDataObjects");

            migrationBuilder.AddColumn<Guid>(
                name: "SessionGuid",
                table: "ExternalCustomDataObjects",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SessionGuid",
                table: "ExternalCustomDataObjects");

            migrationBuilder.AddColumn<string>(
                name: "Token",
                table: "ExternalCustomDataObjects",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);
        }
    }
}
