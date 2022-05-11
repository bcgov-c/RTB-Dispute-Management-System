using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class AddIntakeQuestion : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "IntakeQuestion",
                columns: table => new
                {
                    IntakeQuestionId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    DisputeGuid = table.Column<Guid>(nullable: false),
                    GroupId = table.Column<byte>(nullable: false),
                    QuestionName = table.Column<string>(maxLength: 255, nullable: false),
                    QuestionAnswer = table.Column<string>(maxLength: 6, nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IntakeQuestion", x => x.IntakeQuestionId);
                    table.ForeignKey(
                        name: "FK_IntakeQuestion_Disputes_DisputeGuid",
                        column: x => x.DisputeGuid,
                        principalTable: "Disputes",
                        principalColumn: "DisputeGuid",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_IntakeQuestion_DisputeGuid_QuestionName",
                table: "IntakeQuestion",
                columns: new[] { "DisputeGuid", "QuestionName" },
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "IntakeQuestion");
        }
    }
}
