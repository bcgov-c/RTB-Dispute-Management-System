using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class AddExternalCustomObjects : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ExternalCustomDataObjects",
                columns: table => new
                {
                    ExternalCustomDataObjectId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    ReferenceId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Token = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Expiry = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    OwnerId = table.Column<int>(type: "integer", nullable: false),
                    Type = table.Column<byte>(type: "smallint", nullable: true),
                    SubType = table.Column<byte>(type: "smallint", nullable: true),
                    Status = table.Column<byte>(type: "smallint", nullable: true),
                    Title = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Description = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: true),
                    ObjectJson = table.Column<string>(type: "json", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: true, defaultValue: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CreatedBy = table.Column<int>(type: "integer", nullable: true),
                    ModifiedDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    ModifiedBy = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExternalCustomDataObjects", x => x.ExternalCustomDataObjectId);
                    table.ForeignKey(
                        name: "FK_ExternalCustomDataObjects_SystemUsers_OwnerId",
                        column: x => x.OwnerId,
                        principalTable: "SystemUsers",
                        principalColumn: "SystemUserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ExternalFile",
                columns: table => new
                {
                    ExternalFileId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    FileGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    ExternalCustomDataObjectId = table.Column<int>(type: "integer", nullable: false),
                    OriginalFileName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    FileType = table.Column<byte>(type: "smallint", nullable: true),
                    FileSubType = table.Column<byte>(type: "smallint", nullable: true),
                    FileStatus = table.Column<byte>(type: "smallint", nullable: true),
                    FileTitle = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    FileDescription = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    FileMimeType = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    FileName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    FileSize = table.Column<long>(type: "bigint", nullable: false),
                    FilePath = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CreatedBy = table.Column<int>(type: "integer", nullable: true),
                    ModifiedDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    ModifiedBy = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExternalFile", x => x.ExternalFileId);
                    table.ForeignKey(
                        name: "FK_ExternalFile_ExternalCustomDataObjects_ExternalCustomDataOb~",
                        column: x => x.ExternalCustomDataObjectId,
                        principalTable: "ExternalCustomDataObjects",
                        principalColumn: "ExternalCustomDataObjectId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ExternalCustomDataObjects_OwnerId",
                table: "ExternalCustomDataObjects",
                column: "OwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_ExternalFile_ExternalCustomDataObjectId",
                table: "ExternalFile",
                column: "ExternalCustomDataObjectId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ExternalFile");

            migrationBuilder.DropTable(
                name: "ExternalCustomDataObjects");
        }
    }
}
