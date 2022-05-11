using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class AddInternalUserProfiles : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "InternalUserProfiles",
                columns: table => new
                {
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    InternalUserProfileId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    InternalUserId = table.Column<int>(nullable: false),
                    ProfileStatus = table.Column<byte>(nullable: true),
                    ProfilePictureId = table.Column<int>(nullable: true),
                    SignatureFileId = table.Column<int>(nullable: true),
                    ProfileNickname = table.Column<string>(maxLength: 40, nullable: true),
                    ProfileTitle = table.Column<string>(maxLength: 70, nullable: true),
                    ProfileDecision = table.Column<string>(maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InternalUserProfiles", x => x.InternalUserProfileId);
                    table.ForeignKey(
                        name: "FK_InternalUserProfiles_SystemUsers_InternalUserId",
                        column: x => x.InternalUserId,
                        principalTable: "SystemUsers",
                        principalColumn: "SystemUserId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InternalUserProfiles_CommonFiles_ProfilePictureId",
                        column: x => x.ProfilePictureId,
                        principalTable: "CommonFiles",
                        principalColumn: "CommonFileId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InternalUserProfiles_CommonFiles_SignatureFileId",
                        column: x => x.SignatureFileId,
                        principalTable: "CommonFiles",
                        principalColumn: "CommonFileId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_InternalUserProfiles_InternalUserId",
                table: "InternalUserProfiles",
                column: "InternalUserId");

            migrationBuilder.CreateIndex(
                name: "IX_InternalUserProfiles_ProfilePictureId",
                table: "InternalUserProfiles",
                column: "ProfilePictureId");

            migrationBuilder.CreateIndex(
                name: "IX_InternalUserProfiles_SignatureFileId",
                table: "InternalUserProfiles",
                column: "SignatureFileId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InternalUserProfiles");
        }
    }
}
