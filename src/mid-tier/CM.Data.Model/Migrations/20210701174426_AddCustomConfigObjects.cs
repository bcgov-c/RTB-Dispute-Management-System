using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class AddCustomConfigObjects : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CustomConfigObjects",
                columns: table => new
                {
                    CustomConfigObjectId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    ObjectType = table.Column<byte>(type: "smallint", nullable: false),
                    ObjectSubType = table.Column<byte>(type: "smallint", nullable: true),
                    ObjectStatus = table.Column<byte>(type: "smallint", nullable: true),
                    ObjectVersionId = table.Column<decimal>(type: "decimal(4,2)", nullable: true),
                    ObjectTitle = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ObjectDescription = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    AssociatedRoleGroup = table.Column<byte>(type: "smallint", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsPublic = table.Column<bool>(type: "boolean", nullable: false),
                    ObjectStorageType = table.Column<byte>(type: "smallint", nullable: false),
                    ObjectJson = table.Column<string>(type: "json", nullable: true),
                    ObjectJsonB = table.Column<string>(type: "jsonb", nullable: true),
                    ObjectText = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CreatedBy = table.Column<int>(type: "integer", nullable: true),
                    ModifiedDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    ModifiedBy = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomConfigObjects", x => x.CustomConfigObjectId);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CustomConfigObjects");
        }
    }
}
