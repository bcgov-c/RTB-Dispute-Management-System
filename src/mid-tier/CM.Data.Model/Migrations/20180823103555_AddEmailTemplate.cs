using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class AddEmailTemplate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EmailTemplates",
                columns: table => new
                {
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    EmailTemplateId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    TemplateType = table.Column<byte>(nullable: true),
                    TemplateTitle = table.Column<string>(maxLength: 100, nullable: false),
                    TemplateDescription = table.Column<string>(maxLength: 1000, nullable: true),
                    TemplateAccessRoles = table.Column<byte>(nullable: true),
                    DefaultRecipientGroup = table.Column<byte>(nullable: true),
                    SubjectLine = table.Column<string>(maxLength: 150, nullable: true),
                    TemplateHtml = table.Column<string>(nullable: true),
                    TemplateAttachment01 = table.Column<int>(nullable: true),
                    TemplateAttachment02 = table.Column<int>(nullable: true),
                    TemplateAttachment03 = table.Column<int>(nullable: true),
                    TemplateAttachment04 = table.Column<int>(nullable: true),
                    ReplyEmailAddress = table.Column<string>(maxLength: 100, nullable: true),
                    TemplateStatus = table.Column<byte>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmailTemplates", x => x.EmailTemplateId);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EmailTemplates");
        }
    }
}
