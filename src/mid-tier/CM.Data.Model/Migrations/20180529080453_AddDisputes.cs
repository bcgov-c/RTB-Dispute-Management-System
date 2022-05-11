using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class AddDisputes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Disputes",
                columns: table => new
                {
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    DisputeId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    DisputeGuid = table.Column<Guid>(nullable: false),
                    FileNumber = table.Column<int>(nullable: true),
                    DisputeType = table.Column<byte>(nullable: true),
                    DisputeSubType = table.Column<byte>(nullable: true),
                    DisputeUrgency = table.Column<byte>(nullable: true),
                    TenancyAddress = table.Column<string>(maxLength: 80, nullable: true),
                    TenancyCity = table.Column<string>(maxLength: 50, nullable: true),
                    TenancyCountry = table.Column<string>(maxLength: 50, nullable: true),
                    TenancyZipPostal = table.Column<string>(maxLength: 7, nullable: true),
                    TenancyEnded = table.Column<byte>(nullable: true),
                    TenancyEndDate = table.Column<DateTime>(nullable: true),
                    TenancyGeozoneId = table.Column<byte>(nullable: true),
                    CrossAppFileNumber = table.Column<int>(nullable: true),
                    CrossAppDisputeGuid = table.Column<Guid>(nullable: true),
                    OriginalNoticeDelivered = table.Column<bool>(nullable: true),
                    OriginalNoticeDate = table.Column<DateTime>(nullable: true),
                    OriginalNoticeId = table.Column<int>(nullable: true),
                    EvidenceOverride = table.Column<byte>(nullable: true),
                    CreationMethod = table.Column<byte>(nullable: true),
                    SubmittedDate = table.Column<DateTime>(nullable: true),
                    SubmittedBy = table.Column<int>(nullable: true),
                    IsAmended = table.Column<bool>(nullable: true),
                    InitialPaymentDate = table.Column<DateTime>(nullable: true),
                    InitialPaymentBy = table.Column<int>(nullable: true),
                    TenancyStartDate = table.Column<DateTime>(nullable: true),
                    SecurityDepositAmount = table.Column<int>(nullable: true),
                    PetDamageDepositAmount = table.Column<int>(nullable: true),
                    RentPaymentInterval = table.Column<string>(maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Disputes", x => x.DisputeId);
                    table.UniqueConstraint("AK_Disputes_DisputeGuid", x => x.DisputeGuid);
                });

            migrationBuilder.CreateTable(
                name: "DisputeStatuses",
                columns: table => new
                {
                    DisputeStatusId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    DisputeGuid = table.Column<Guid>(nullable: false),
                    Status = table.Column<byte>(nullable: false),
                    Stage = table.Column<byte>(nullable: true),
                    Process = table.Column<byte>(nullable: true),
                    Owner = table.Column<int>(nullable: true),
                    DurationSeconds = table.Column<int>(nullable: true),
                    StatusNote = table.Column<string>(maxLength: 255, nullable: true),
                    StatusStartDate = table.Column<DateTime>(nullable: false),
                    StatusSetBy = table.Column<string>(maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DisputeStatuses", x => x.DisputeStatusId);
                    table.ForeignKey(
                        name: "FK_DisputeStatuses_Disputes_DisputeGuid",
                        column: x => x.DisputeGuid,
                        principalTable: "Disputes",
                        principalColumn: "DisputeGuid",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DisputeStatuses_DisputeGuid",
                table: "DisputeStatuses",
                column: "DisputeGuid");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DisputeStatuses");

            migrationBuilder.DropTable(
                name: "Disputes");
        }
    }
}
