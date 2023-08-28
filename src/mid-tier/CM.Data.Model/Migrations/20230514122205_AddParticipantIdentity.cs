using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CM.Data.Model.Migrations
{
    public partial class AddParticipantIdentity : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ParticipantIdentities",
                columns: table => new
                {
                    ParticipantIdentityId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    ParticipantId = table.Column<int>(type: "integer", nullable: false),
                    DisputeGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    IdentityParticipantId = table.Column<int>(type: "integer", nullable: false),
                    IdentityDisputeGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    IdentitySystemUserId = table.Column<int>(type: "integer", nullable: true),
                    IdentityStatus = table.Column<byte>(type: "smallint", nullable: true),
                    IdentityNote = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CreatedBy = table.Column<int>(type: "integer", nullable: true),
                    ModifiedDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    ModifiedBy = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ParticipantIdentities", x => x.ParticipantIdentityId);
                    table.ForeignKey(
                        name: "FK_ParticipantIdentities_Disputes_DisputeGuid",
                        column: x => x.DisputeGuid,
                        principalTable: "Disputes",
                        principalColumn: "DisputeGuid",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ParticipantIdentities_Disputes_IdentityDisputeGuid",
                        column: x => x.IdentityDisputeGuid,
                        principalTable: "Disputes",
                        principalColumn: "DisputeGuid",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ParticipantIdentities_Participants_IdentityParticipantId",
                        column: x => x.IdentityParticipantId,
                        principalTable: "Participants",
                        principalColumn: "ParticipantId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ParticipantIdentities_Participants_ParticipantId",
                        column: x => x.ParticipantId,
                        principalTable: "Participants",
                        principalColumn: "ParticipantId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ParticipantIdentities_SystemUsers_IdentitySystemUserId",
                        column: x => x.IdentitySystemUserId,
                        principalTable: "SystemUsers",
                        principalColumn: "SystemUserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ParticipantIdentities_DisputeGuid",
                table: "ParticipantIdentities",
                column: "DisputeGuid");

            migrationBuilder.CreateIndex(
                name: "IX_ParticipantIdentities_IdentityDisputeGuid",
                table: "ParticipantIdentities",
                column: "IdentityDisputeGuid");

            migrationBuilder.CreateIndex(
                name: "IX_ParticipantIdentities_IdentityParticipantId",
                table: "ParticipantIdentities",
                column: "IdentityParticipantId");

            migrationBuilder.CreateIndex(
                name: "IX_ParticipantIdentities_IdentitySystemUserId",
                table: "ParticipantIdentities",
                column: "IdentitySystemUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ParticipantIdentities_ParticipantId",
                table: "ParticipantIdentities",
                column: "ParticipantId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ParticipantIdentities");
        }
    }
}
