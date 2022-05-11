using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class UpdateTasksTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AssignedDurationSeconds",
                table: "Tasks",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastAssignedDate",
                table: "Tasks",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "LastOwnerId",
                table: "Tasks",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastUnassignedDate",
                table: "Tasks",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TaskActivityType",
                table: "Tasks",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UnassignedDurationSeconds",
                table: "Tasks",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_LastOwnerId",
                table: "Tasks",
                column: "LastOwnerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_SystemUsers_LastOwnerId",
                table: "Tasks",
                column: "LastOwnerId",
                principalTable: "SystemUsers",
                principalColumn: "SystemUserId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_SystemUsers_LastOwnerId",
                table: "Tasks");

            migrationBuilder.DropIndex(
                name: "IX_Tasks_LastOwnerId",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "AssignedDurationSeconds",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "LastAssignedDate",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "LastOwnerId",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "LastUnassignedDate",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "TaskActivityType",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "UnassignedDurationSeconds",
                table: "Tasks");
        }
    }
}
