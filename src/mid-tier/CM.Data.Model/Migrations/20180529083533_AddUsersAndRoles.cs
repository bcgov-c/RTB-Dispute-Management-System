using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class AddUsersAndRoles : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Participant_Disputes_DisputeGuid",
                table: "Participant");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Participant",
                table: "Participant");

            migrationBuilder.RenameTable(
                name: "Participant",
                newName: "Participants");

            migrationBuilder.RenameIndex(
                name: "IX_Participant_DisputeGuid",
                table: "Participants",
                newName: "IX_Participants_DisputeGuid");

            migrationBuilder.AddColumn<int>(
                name: "SystemUserId",
                table: "Participants",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Participants",
                table: "Participants",
                column: "ParticipantId");

            migrationBuilder.CreateTable(
                name: "SystemUserRoles",
                columns: table => new
                {
                    SystemUserRoleId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    RoleName = table.Column<string>(maxLength: 50, nullable: false),
                    RoleDescritption = table.Column<string>(maxLength: 255, nullable: false),
                    SessionDuration = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SystemUserRoles", x => x.SystemUserRoleId);
                });

            migrationBuilder.CreateTable(
                name: "SystemUsers",
                columns: table => new
                {
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    SystemUserId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    UserGuid = table.Column<Guid>(nullable: false),
                    IsActive = table.Column<bool>(nullable: true),
                    AdminAccess = table.Column<bool>(nullable: false),
                    Username = table.Column<string>(maxLength: 50, nullable: false),
                    Password = table.Column<string>(maxLength: 250, nullable: true),
                    FullName = table.Column<string>(maxLength: 100, nullable: true),
                    AccountEmail = table.Column<string>(maxLength: 100, nullable: true),
                    AccountMobile = table.Column<string>(maxLength: 15, nullable: true),
                    AcceptsTextMessages = table.Column<bool>(nullable: true),
                    SystemUserRoleId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SystemUsers", x => x.SystemUserId);
                    table.ForeignKey(
                        name: "FK_SystemUsers_SystemUserRoles_SystemUserRoleId",
                        column: x => x.SystemUserRoleId,
                        principalTable: "SystemUserRoles",
                        principalColumn: "SystemUserRoleId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DisputeUsers",
                columns: table => new
                {
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    DisputeUserId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    DisputeGuid = table.Column<Guid>(nullable: false),
                    SystemUserId = table.Column<int>(nullable: false),
                    IsActive = table.Column<bool>(nullable: false),
                    ParticipantId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DisputeUsers", x => x.DisputeUserId);
                    table.ForeignKey(
                        name: "FK_DisputeUsers_Disputes_DisputeGuid",
                        column: x => x.DisputeGuid,
                        principalTable: "Disputes",
                        principalColumn: "DisputeGuid",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DisputeUsers_Participants_ParticipantId",
                        column: x => x.ParticipantId,
                        principalTable: "Participants",
                        principalColumn: "ParticipantId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DisputeUsers_SystemUsers_SystemUserId",
                        column: x => x.SystemUserId,
                        principalTable: "SystemUsers",
                        principalColumn: "SystemUserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Participants_SystemUserId",
                table: "Participants",
                column: "SystemUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DisputeUsers_DisputeGuid",
                table: "DisputeUsers",
                column: "DisputeGuid");

            migrationBuilder.CreateIndex(
                name: "IX_DisputeUsers_ParticipantId",
                table: "DisputeUsers",
                column: "ParticipantId");

            migrationBuilder.CreateIndex(
                name: "IX_DisputeUsers_SystemUserId",
                table: "DisputeUsers",
                column: "SystemUserId");

            migrationBuilder.CreateIndex(
                name: "IX_SystemUsers_SystemUserRoleId",
                table: "SystemUsers",
                column: "SystemUserRoleId");

            migrationBuilder.AddForeignKey(
                name: "FK_Participants_Disputes_DisputeGuid",
                table: "Participants",
                column: "DisputeGuid",
                principalTable: "Disputes",
                principalColumn: "DisputeGuid",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Participants_SystemUsers_SystemUserId",
                table: "Participants",
                column: "SystemUserId",
                principalTable: "SystemUsers",
                principalColumn: "SystemUserId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Participants_Disputes_DisputeGuid",
                table: "Participants");

            migrationBuilder.DropForeignKey(
                name: "FK_Participants_SystemUsers_SystemUserId",
                table: "Participants");

            migrationBuilder.DropTable(
                name: "DisputeUsers");

            migrationBuilder.DropTable(
                name: "SystemUsers");

            migrationBuilder.DropTable(
                name: "SystemUserRoles");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Participants",
                table: "Participants");

            migrationBuilder.DropIndex(
                name: "IX_Participants_SystemUserId",
                table: "Participants");

            migrationBuilder.DropColumn(
                name: "SystemUserId",
                table: "Participants");

            migrationBuilder.RenameTable(
                name: "Participants",
                newName: "Participant");

            migrationBuilder.RenameIndex(
                name: "IX_Participants_DisputeGuid",
                table: "Participant",
                newName: "IX_Participant_DisputeGuid");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Participant",
                table: "Participant",
                column: "ParticipantId");

            migrationBuilder.AddForeignKey(
                name: "FK_Participant_Disputes_DisputeGuid",
                table: "Participant",
                column: "DisputeGuid",
                principalTable: "Disputes",
                principalColumn: "DisputeGuid",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
