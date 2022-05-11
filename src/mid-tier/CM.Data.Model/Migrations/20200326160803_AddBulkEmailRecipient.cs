using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class AddBulkEmailRecipient : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BulkEmailRecipients",
                columns: table => new
                {
                    BulkEmailRecipientId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    BulkEmailBatchId = table.Column<int>(nullable: false),
                    AssociatedDisputeGuid = table.Column<Guid>(nullable: false),
                    AssociatedFileNumber = table.Column<int>(nullable: false),
                    RecipientEmailAddress = table.Column<string>(maxLength: 100, nullable: true),
                    RecipientParticipantId = table.Column<int>(nullable: true),
                    PreferredSendDate = table.Column<DateTime>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BulkEmailRecipients", x => x.BulkEmailRecipientId);
                    table.ForeignKey(
                        name: "FK_BulkEmailRecipients_Disputes_AssociatedDisputeGuid",
                        column: x => x.AssociatedDisputeGuid,
                        principalTable: "Disputes",
                        principalColumn: "DisputeGuid",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BulkEmailRecipients_AssociatedDisputeGuid",
                table: "BulkEmailRecipients",
                column: "AssociatedDisputeGuid");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BulkEmailRecipients");
        }
    }
}
