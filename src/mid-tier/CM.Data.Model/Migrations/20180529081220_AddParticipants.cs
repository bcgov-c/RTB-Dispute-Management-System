using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class AddParticipants : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Participant",
                columns: table => new
                {
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    ParticipantId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    DisputeGuid = table.Column<Guid>(nullable: false),
                    ParticipantType = table.Column<byte>(nullable: true),
                    ParticipantStatus = table.Column<byte>(nullable: false),
                    AccessCode = table.Column<string>(maxLength: 10, nullable: true),
                    BusinessName = table.Column<string>(maxLength: 100, nullable: true),
                    BusinessContactFirstName = table.Column<string>(maxLength: 50, nullable: true),
                    BusinessContactLastName = table.Column<string>(maxLength: 70, nullable: true),
                    FirstName = table.Column<string>(maxLength: 50, nullable: true),
                    LastName = table.Column<string>(maxLength: 70, nullable: true),
                    AcceptedTOU = table.Column<bool>(nullable: false),
                    AcceptedTOUDate = table.Column<DateTime>(nullable: true),
                    Email = table.Column<string>(maxLength: 100, nullable: true),
                    NoEmail = table.Column<bool>(nullable: true),
                    EmailVerified = table.Column<bool>(nullable: true),
                    PrimaryPhone = table.Column<string>(maxLength: 15, nullable: true),
                    PrimaryPhoneExtension = table.Column<string>(maxLength: 4, nullable: true),
                    PrimaryPhoneType = table.Column<byte>(nullable: true),
                    PrimaryPhoneVerified = table.Column<bool>(nullable: true),
                    SecondaaryPhone = table.Column<string>(maxLength: 15, nullable: true),
                    SecondaryPhoneExtension = table.Column<string>(maxLength: 4, nullable: true),
                    SecondaryPhoneType = table.Column<byte>(nullable: true),
                    SecondaryPhoneVerified = table.Column<bool>(nullable: true),
                    Fax = table.Column<string>(maxLength: 15, nullable: true),
                    PrimaryContactMethod = table.Column<byte>(nullable: true),
                    SecondaryContactMethod = table.Column<byte>(nullable: true),
                    Address = table.Column<string>(maxLength: 125, nullable: true),
                    City = table.Column<string>(maxLength: 50, nullable: true),
                    ProvinceState = table.Column<string>(maxLength: 50, nullable: true),
                    ProvinceStateId = table.Column<byte>(nullable: true),
                    Country = table.Column<string>(maxLength: 50, nullable: true),
                    CountryId = table.Column<byte>(nullable: true),
                    PostalZip = table.Column<string>(maxLength: 15, nullable: true),
                    MailAddres = table.Column<string>(maxLength: 125, nullable: true),
                    MailCity = table.Column<string>(maxLength: 50, nullable: true),
                    MailProvinceState = table.Column<string>(maxLength: 50, nullable: true),
                    MailCountry = table.Column<string>(maxLength: 50, nullable: true),
                    MailPostalZip = table.Column<string>(maxLength: 15, nullable: true),
                    PackageDeliveryMethod = table.Column<byte>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: true),
                    IsAmended = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Participant", x => x.ParticipantId);
                    table.ForeignKey(
                        name: "FK_Participant_Disputes_DisputeGuid",
                        column: x => x.DisputeGuid,
                        principalTable: "Disputes",
                        principalColumn: "DisputeGuid",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Participant_DisputeGuid",
                table: "Participant",
                column: "DisputeGuid");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Participant");
        }
    }
}
