using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class AddClaims : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ClaimGroups",
                columns: table => new
                {
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    ClaimGroupId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    DisputeGuid = table.Column<Guid>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClaimGroups", x => x.ClaimGroupId);
                    table.ForeignKey(
                        name: "FK_ClaimGroups_Disputes_DisputeGuid",
                        column: x => x.DisputeGuid,
                        principalTable: "Disputes",
                        principalColumn: "DisputeGuid",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ClaimGroupParticipants",
                columns: table => new
                {
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    ClaimGroupParticipantId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    DisputeGuid = table.Column<Guid>(nullable: false),
                    ClaimGroupId = table.Column<int>(nullable: false),
                    ParticipantId = table.Column<int>(nullable: false),
                    GroupParticipantRole = table.Column<byte>(nullable: false),
                    GroupPrimaryContactId = table.Column<int>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClaimGroupParticipants", x => x.ClaimGroupParticipantId);
                    table.ForeignKey(
                        name: "FK_ClaimGroupParticipants_ClaimGroups_ClaimGroupId",
                        column: x => x.ClaimGroupId,
                        principalTable: "ClaimGroups",
                        principalColumn: "ClaimGroupId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ClaimGroupParticipants_Disputes_DisputeGuid",
                        column: x => x.DisputeGuid,
                        principalTable: "Disputes",
                        principalColumn: "DisputeGuid",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ClaimGroupParticipants_Participants_ParticipantId",
                        column: x => x.ParticipantId,
                        principalTable: "Participants",
                        principalColumn: "ParticipantId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Claims",
                columns: table => new
                {
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    ClaimId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    ClaimGroupId = table.Column<int>(nullable: false),
                    ClaimTitle = table.Column<string>(maxLength: 150, nullable: true),
                    ClaimType = table.Column<byte>(nullable: true),
                    ClaimCode = table.Column<byte>(nullable: true),
                    ClaimStatus = table.Column<byte>(nullable: true),
                    ClaimSource = table.Column<byte>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: true),
                    IsAmended = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Claims", x => x.ClaimId);
                    table.ForeignKey(
                        name: "FK_Claims_ClaimGroups_ClaimGroupId",
                        column: x => x.ClaimGroupId,
                        principalTable: "ClaimGroups",
                        principalColumn: "ClaimGroupId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ClaimDetails",
                columns: table => new
                {
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    ClaimDetailId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    Description = table.Column<string>(maxLength: 1000, nullable: true),
                    ClaimId = table.Column<int>(nullable: true),
                    DescriptionBy = table.Column<int>(nullable: false),
                    NoticeDate = table.Column<DateTime>(nullable: true),
                    NoticeMethod = table.Column<byte>(nullable: true),
                    WhenAware = table.Column<string>(maxLength: 255, nullable: true),
                    Location = table.Column<string>(maxLength: 255, nullable: true),
                    Impact = table.Column<string>(maxLength: 750, nullable: true),
                    IsDeleted = table.Column<bool>(nullable: true),
                    IsAmended = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClaimDetails", x => x.ClaimDetailId);
                    table.ForeignKey(
                        name: "FK_ClaimDetails_Claims_ClaimId",
                        column: x => x.ClaimId,
                        principalTable: "Claims",
                        principalColumn: "ClaimId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ClaimDetails_Participants_DescriptionBy",
                        column: x => x.DescriptionBy,
                        principalTable: "Participants",
                        principalColumn: "ParticipantId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ClaimDetails_ClaimId",
                table: "ClaimDetails",
                column: "ClaimId");

            migrationBuilder.CreateIndex(
                name: "IX_ClaimDetails_DescriptionBy",
                table: "ClaimDetails",
                column: "DescriptionBy");

            migrationBuilder.CreateIndex(
                name: "IX_ClaimGroupParticipants_ClaimGroupId",
                table: "ClaimGroupParticipants",
                column: "ClaimGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_ClaimGroupParticipants_DisputeGuid",
                table: "ClaimGroupParticipants",
                column: "DisputeGuid");

            migrationBuilder.CreateIndex(
                name: "IX_ClaimGroupParticipants_ParticipantId",
                table: "ClaimGroupParticipants",
                column: "ParticipantId");

            migrationBuilder.CreateIndex(
                name: "IX_ClaimGroups_DisputeGuid",
                table: "ClaimGroups",
                column: "DisputeGuid");

            migrationBuilder.CreateIndex(
                name: "IX_Claims_ClaimGroupId",
                table: "Claims",
                column: "ClaimGroupId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ClaimDetails");

            migrationBuilder.DropTable(
                name: "ClaimGroupParticipants");

            migrationBuilder.DropTable(
                name: "Claims");

            migrationBuilder.DropTable(
                name: "ClaimGroups");
        }
    }
}
