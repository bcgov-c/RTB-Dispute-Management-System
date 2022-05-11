using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddAssociatedRecordId : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AssociatedRecordId",
                table: "AuditLogs",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CaseFileLastModifiedDate",
                table: "Disputes",
                type: "timestamp without time zone",
                nullable: true);
        }
    }
}
