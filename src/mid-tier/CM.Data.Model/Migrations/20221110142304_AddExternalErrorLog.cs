using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CM.Data.Model.Migrations
{
    public partial class AddExternalErrorLog : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ExternalErrorLogs",
                columns: table => new
                {
                    ExternalErrorLogId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    ErrorSite = table.Column<byte>(type: "smallint", nullable: false),
                    DisputeGuid = table.Column<Guid>(type: "uuid", nullable: true),
                    ErrorSeverity = table.Column<byte>(type: "smallint", nullable: true),
                    ErrorImpact = table.Column<byte>(type: "smallint", nullable: true),
                    ErrorUrgency = table.Column<byte>(type: "smallint", nullable: true),
                    ErrorType = table.Column<byte>(type: "smallint", nullable: false),
                    ErrorSubType = table.Column<byte>(type: "smallint", nullable: true),
                    ErrorStatus = table.Column<byte>(type: "smallint", nullable: true),
                    ErrorOwner = table.Column<int>(type: "integer", nullable: true),
                    ReportedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ErrorTitle = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    FeatureTitle = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    ErrorDetails = table.Column<string>(type: "character varying(2500)", maxLength: 2500, nullable: false),
                    ErrorComment = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<int>(type: "integer", nullable: true),
                    ModifiedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ModifiedBy = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExternalErrorLogs", x => x.ExternalErrorLogId);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ExternalErrorLogs");
        }
    }
}
