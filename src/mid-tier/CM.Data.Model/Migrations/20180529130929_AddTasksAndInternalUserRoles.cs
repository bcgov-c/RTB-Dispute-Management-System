using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class AddTasksAndInternalUserRoles : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "InternalUserRoles",
                columns: table => new
                {
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    InternalUserRoleId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    UserId = table.Column<int>(nullable: false),
                    RoleGroupId = table.Column<byte>(nullable: false),
                    RoleSubtypeId = table.Column<byte>(nullable: true),
                    IsActive = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InternalUserRoles", x => x.InternalUserRoleId);
                    table.ForeignKey(
                        name: "FK_InternalUserRoles_SystemUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "SystemUsers",
                        principalColumn: "SystemUserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Tasks",
                columns: table => new
                {
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    TaskId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    DisputeGuid = table.Column<Guid>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: true),
                    TaskLinkedTo = table.Column<byte>(nullable: false),
                    TaskLinkId = table.Column<int>(nullable: true),
                    TaskType = table.Column<byte>(nullable: true),
                    TaskText = table.Column<string>(maxLength: 1000, nullable: false),
                    TaskPriority = table.Column<byte>(nullable: false),
                    TaskStatus = table.Column<byte>(nullable: true),
                    DateTaskCompleted = table.Column<DateTime>(nullable: true),
                    TaskOwnerId = table.Column<int>(nullable: true),
                    TaskDueDate = table.Column<DateTime>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tasks", x => x.TaskId);
                    table.ForeignKey(
                        name: "FK_Tasks_Disputes_DisputeGuid",
                        column: x => x.DisputeGuid,
                        principalTable: "Disputes",
                        principalColumn: "DisputeGuid",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Tasks_SystemUsers_TaskOwnerId",
                        column: x => x.TaskOwnerId,
                        principalTable: "SystemUsers",
                        principalColumn: "SystemUserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_InternalUserRoles_UserId",
                table: "InternalUserRoles",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_DisputeGuid",
                table: "Tasks",
                column: "DisputeGuid");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_TaskOwnerId",
                table: "Tasks",
                column: "TaskOwnerId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InternalUserRoles");

            migrationBuilder.DropTable(
                name: "Tasks");
        }
    }
}
