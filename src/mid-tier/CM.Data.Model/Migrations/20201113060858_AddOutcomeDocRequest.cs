using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class AddOutcomeDocRequest : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "OutcomeDocRequests",
                columns: table => new
                {
                    OutcomeDocRequestId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    DisputeGuid = table.Column<Guid>(nullable: false),
                    RequestType = table.Column<int>(nullable: false),
                    RequestSubType = table.Column<int>(nullable: true),
                    AffectedDocuments = table.Column<int>(nullable: false),
                    AffectedDocumentsText = table.Column<string>(maxLength: 255, nullable: true),
                    DateDocumentsReceived = table.Column<DateTime>(nullable: false),
                    RequestDescription = table.Column<string>(maxLength: 500, nullable: true),
                    SubmitterId = table.Column<int>(nullable: false),
                    OutcomeDocGroupId = table.Column<int>(nullable: true),
                    FileDescriptionId = table.Column<int>(nullable: true),
                    RequestStatus = table.Column<byte>(nullable: true),
                    OtherStatusDescription = table.Column<string>(maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OutcomeDocRequests", x => x.OutcomeDocRequestId);
                    table.ForeignKey(
                        name: "FK_OutcomeDocRequests_Disputes_DisputeGuid",
                        column: x => x.DisputeGuid,
                        principalTable: "Disputes",
                        principalColumn: "DisputeGuid",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OutcomeDocRequests_FileDescriptions_FileDescriptionId",
                        column: x => x.FileDescriptionId,
                        principalTable: "FileDescriptions",
                        principalColumn: "FileDescriptionId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OutcomeDocRequests_SystemUsers_SubmitterId",
                        column: x => x.SubmitterId,
                        principalTable: "SystemUsers",
                        principalColumn: "SystemUserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OutcomeDocReqItems",
                columns: table => new
                {
                    OutcomeDocReqItemId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    OutcomeDocChangeRequestId = table.Column<int>(nullable: false),
                    ItemType = table.Column<int>(nullable: false),
                    ItemSubType = table.Column<int>(nullable: true),
                    ItemStatus = table.Column<byte>(nullable: true),
                    ItemTitle = table.Column<string>(maxLength: 70, nullable: true),
                    ItemDescription = table.Column<string>(maxLength: 500, nullable: true),
                    FileDescriptionId = table.Column<int>(nullable: true),
                    ItemNote = table.Column<string>(maxLength: 500, nullable: true),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OutcomeDocReqItems", x => x.OutcomeDocReqItemId);
                    table.ForeignKey(
                        name: "FK_OutcomeDocReqItems_OutcomeDocRequests_OutcomeDocChangeReque~",
                        column: x => x.OutcomeDocChangeRequestId,
                        principalTable: "OutcomeDocRequests",
                        principalColumn: "OutcomeDocRequestId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OutcomeDocReqItems_OutcomeDocChangeRequestId",
                table: "OutcomeDocReqItems",
                column: "OutcomeDocChangeRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_OutcomeDocRequests_DisputeGuid",
                table: "OutcomeDocRequests",
                column: "DisputeGuid");

            migrationBuilder.CreateIndex(
                name: "IX_OutcomeDocRequests_FileDescriptionId",
                table: "OutcomeDocRequests",
                column: "FileDescriptionId");

            migrationBuilder.CreateIndex(
                name: "IX_OutcomeDocRequests_SubmitterId",
                table: "OutcomeDocRequests",
                column: "SubmitterId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OutcomeDocReqItems");

            migrationBuilder.DropTable(
                name: "OutcomeDocRequests");
        }
    }
}
