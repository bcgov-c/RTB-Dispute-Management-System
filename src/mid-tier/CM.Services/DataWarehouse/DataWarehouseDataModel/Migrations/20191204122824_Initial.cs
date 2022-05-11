using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.Migrations
{
    public partial class Initial : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DimCities",
                columns: table => new
                {
                    DimCityId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DateInserted = table.Column<DateTime>(nullable: false),
                    CityName = table.Column<string>(maxLength: 50, nullable: true),
                    CityNameSoundEx = table.Column<string>(maxLength: 5, nullable: true),
                    CityPopulation = table.Column<int>(nullable: false),
                    RegionId = table.Column<int>(nullable: false),
                    RegionName = table.Column<string>(maxLength: 50, nullable: true),
                    SubRegionId = table.Column<int>(nullable: false),
                    SubRegionName = table.Column<string>(maxLength: 50, nullable: true),
                    ProvinceId = table.Column<int>(nullable: false),
                    ProvinceName = table.Column<string>(maxLength: 50, nullable: true),
                    CountryId = table.Column<int>(nullable: false),
                    CountryName = table.Column<string>(maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DimCities", x => x.DimCityId);
                });

            migrationBuilder.CreateTable(
                name: "DimTimes",
                columns: table => new
                {
                    DimTimeId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DateInserted = table.Column<DateTime>(nullable: false),
                    AssociatedDate = table.Column<DateTime>(nullable: false),
                    DayOfWeekId = table.Column<int>(nullable: false),
                    WeekId = table.Column<int>(nullable: false),
                    MonthId = table.Column<int>(nullable: false),
                    QuarterId = table.Column<int>(nullable: false),
                    YearId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DimTimes", x => x.DimTimeId);
                });

            migrationBuilder.CreateTable(
                name: "FactDisputeSummaries",
                columns: table => new
                {
                    DisputeSummaryRecordId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    LoadDateTime = table.Column<DateTime>(nullable: false),
                    AssociatedOffice = table.Column<int>(nullable: false),
                    IsActive = table.Column<bool>(nullable: false),
                    IsPublic = table.Column<bool>(nullable: false),
                    FileNumber = table.Column<int>(nullable: false),
                    Participants = table.Column<int>(nullable: false),
                    AccessCodeUsers = table.Column<int>(nullable: false),
                    Applicants = table.Column<int>(nullable: false),
                    Respondents = table.Column<int>(nullable: false),
                    Issues = table.Column<int>(nullable: false),
                    AwardedIssues = table.Column<int>(nullable: false),
                    AwardedAmount = table.Column<int>(nullable: false),
                    Processes = table.Column<int>(nullable: false),
                    Statuses = table.Column<int>(nullable: false),
                    Notes = table.Column<int>(nullable: false),
                    Tasks = table.Column<int>(nullable: false),
                    AvgTaskOpenTimeMin = table.Column<int>(nullable: false),
                    SentEmailMessages = table.Column<int>(nullable: false),
                    EvidenceOverrides = table.Column<int>(nullable: false),
                    Hearings = table.Column<int>(nullable: false),
                    CrossHearings = table.Column<int>(nullable: false),
                    HearingParticipations = table.Column<int>(nullable: false),
                    Notices = table.Column<int>(nullable: false),
                    NoticeServices = table.Column<int>(nullable: false),
                    Amendments = table.Column<int>(nullable: false),
                    SubServiceRequests = table.Column<int>(nullable: false),
                    EvidenceFiles = table.Column<int>(nullable: false),
                    EvidencePackages = table.Column<int>(nullable: false),
                    EvidencePackageServices = table.Column<int>(nullable: false),
                    EvidenceFilesMb = table.Column<decimal>(nullable: false),
                    DecisionsAndOrders = table.Column<int>(nullable: false),
                    DecisionsAndOrdersMb = table.Column<decimal>(nullable: false),
                    AvgDocDeliveryTimeMin = table.Column<int>(nullable: false),
                    DocumentsDelivered = table.Column<int>(nullable: false),
                    TotalOpenTimeMin = table.Column<int>(nullable: false),
                    TotalCitizenStatusTimeMin = table.Column<int>(nullable: false),
                    TotalIoTimeMin = table.Column<int>(nullable: false),
                    TotalArbTimeMin = table.Column<int>(nullable: false),
                    SubmittedDateTime = table.Column<DateTime>(nullable: false),
                    InitialPaymentDateTime = table.Column<DateTime>(nullable: true),
                    InitialPaymentMethod = table.Column<int>(nullable: true),
                    Payments = table.Column<int>(nullable: false),
                    Transactions = table.Column<int>(nullable: false),
                    PaymentsAmount = table.Column<decimal>(nullable: false),
                    NoticeDeliveredDateTime = table.Column<DateTime>(nullable: true),
                    LastParticipatoryHearingDateTime = table.Column<DateTime>(nullable: true),
                    LastStatusDateTime = table.Column<DateTime>(nullable: false),
                    DisputeType = table.Column<int>(nullable: true),
                    DisputeSubType = table.Column<int>(nullable: false),
                    CreationMethod = table.Column<int>(nullable: true),
                    MigrationSourceOfTruth = table.Column<int>(nullable: true),
                    DisputeUrgency = table.Column<int>(nullable: false),
                    LastStage = table.Column<int>(nullable: false),
                    LastStatus = table.Column<int>(nullable: false),
                    LastProcess = table.Column<int>(nullable: false),
                    SubmittedTimeId = table.Column<int>(nullable: true),
                    PaymentTimeId = table.Column<int>(nullable: true),
                    NoticeDeliveredTimeId = table.Column<int>(nullable: true),
                    LastParticipatoryHearingTimeId = table.Column<int>(nullable: true),
                    LastStatusTimeId = table.Column<int>(nullable: true),
                    DisputeCityId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FactDisputeSummaries", x => x.DisputeSummaryRecordId);
                });

            migrationBuilder.CreateTable(
                name: "LoadingHistories",
                columns: table => new
                {
                    LoadingEventId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FactTableId = table.Column<int>(nullable: false),
                    FactTableName = table.Column<string>(maxLength: 75, nullable: true),
                    LoadStartDateTime = table.Column<DateTime>(nullable: false),
                    LoadEndDateTime = table.Column<DateTime>(nullable: true),
                    LastStatus = table.Column<int>(nullable: false),
                    TotalRecordsLoaded = table.Column<int>(nullable: true),
                    OutcomeText = table.Column<string>(maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LoadingHistories", x => x.LoadingEventId);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DimCities");

            migrationBuilder.DropTable(
                name: "DimTimes");

            migrationBuilder.DropTable(
                name: "FactDisputeSummaries");

            migrationBuilder.DropTable(
                name: "LoadingHistories");
        }
    }
}
