﻿// <auto-generated />
using System;
using CM.Services.DataWarehouse.DataWarehouseDataModel;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.Migrations
{
    [DbContext(typeof(DataWarehouseContext))]
    [Migration("20191204122852_SeedDimTimes")]
    partial class SeedDimTimes
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                .HasAnnotation("ProductVersion", "3.1.0")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            modelBuilder.Entity("DataWarehouseDataModel.Models.DimCity", b =>
                {
                    b.Property<int>("DimCityId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

                    b.Property<string>("CityName")
                        .HasColumnType("character varying(50)")
                        .HasMaxLength(50);

                    b.Property<string>("CityNameSoundEx")
                        .HasColumnType("character varying(5)")
                        .HasMaxLength(5);

                    b.Property<int>("CityPopulation")
                        .HasColumnType("integer");

                    b.Property<int>("CountryId")
                        .HasColumnType("integer");

                    b.Property<string>("CountryName")
                        .HasColumnType("character varying(50)")
                        .HasMaxLength(50);

                    b.Property<DateTime>("DateInserted")
                        .HasColumnType("timestamp without time zone");

                    b.Property<int>("ProvinceId")
                        .HasColumnType("integer");

                    b.Property<string>("ProvinceName")
                        .HasColumnType("character varying(50)")
                        .HasMaxLength(50);

                    b.Property<int>("RegionId")
                        .HasColumnType("integer");

                    b.Property<string>("RegionName")
                        .HasColumnType("character varying(50)")
                        .HasMaxLength(50);

                    b.Property<int>("SubRegionId")
                        .HasColumnType("integer");

                    b.Property<string>("SubRegionName")
                        .HasColumnType("character varying(50)")
                        .HasMaxLength(50);

                    b.HasKey("DimCityId");

                    b.ToTable("DimCities");
                });

            modelBuilder.Entity("DataWarehouseDataModel.Models.DimTime", b =>
                {
                    b.Property<int>("DimTimeId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

                    b.Property<DateTime>("AssociatedDate")
                        .HasColumnType("timestamp without time zone");

                    b.Property<DateTime>("DateInserted")
                        .HasColumnType("timestamp without time zone");

                    b.Property<int>("DayOfWeekId")
                        .HasColumnType("integer");

                    b.Property<int>("MonthId")
                        .HasColumnType("integer");

                    b.Property<int>("QuarterId")
                        .HasColumnType("integer");

                    b.Property<int>("WeekId")
                        .HasColumnType("integer");

                    b.Property<int>("YearId")
                        .HasColumnType("integer");

                    b.HasKey("DimTimeId");

                    b.ToTable("DimTimes");
                });

            modelBuilder.Entity("DataWarehouseDataModel.Models.FactDisputeSummary", b =>
                {
                    b.Property<int>("DisputeSummaryRecordId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

                    b.Property<int>("AccessCodeUsers")
                        .HasColumnType("integer");

                    b.Property<int>("Amendments")
                        .HasColumnType("integer");

                    b.Property<int>("Applicants")
                        .HasColumnType("integer");

                    b.Property<int>("AssociatedOffice")
                        .HasColumnType("integer");

                    b.Property<int>("AvgDocDeliveryTimeMin")
                        .HasColumnType("integer");

                    b.Property<int>("AvgTaskOpenTimeMin")
                        .HasColumnType("integer");

                    b.Property<int>("AwardedAmount")
                        .HasColumnType("integer");

                    b.Property<int>("AwardedIssues")
                        .HasColumnType("integer");

                    b.Property<int?>("CreationMethod")
                        .HasColumnType("integer");

                    b.Property<int>("CrossHearings")
                        .HasColumnType("integer");

                    b.Property<int>("DecisionsAndOrders")
                        .HasColumnType("integer");

                    b.Property<decimal>("DecisionsAndOrdersMb")
                        .HasColumnType("numeric");

                    b.Property<int>("DisputeCityId")
                        .HasColumnType("integer");

                    b.Property<int>("DisputeSubType")
                        .HasColumnType("integer");

                    b.Property<int?>("DisputeType")
                        .HasColumnType("integer");

                    b.Property<int>("DisputeUrgency")
                        .HasColumnType("integer");

                    b.Property<int>("DocumentsDelivered")
                        .HasColumnType("integer");

                    b.Property<int>("EvidenceFiles")
                        .HasColumnType("integer");

                    b.Property<decimal>("EvidenceFilesMb")
                        .HasColumnType("numeric");

                    b.Property<int>("EvidenceOverrides")
                        .HasColumnType("integer");

                    b.Property<int>("EvidencePackageServices")
                        .HasColumnType("integer");

                    b.Property<int>("EvidencePackages")
                        .HasColumnType("integer");

                    b.Property<int>("FileNumber")
                        .HasColumnType("integer");

                    b.Property<int>("HearingParticipations")
                        .HasColumnType("integer");

                    b.Property<int>("Hearings")
                        .HasColumnType("integer");

                    b.Property<DateTime?>("InitialPaymentDateTime")
                        .HasColumnType("timestamp without time zone");

                    b.Property<int?>("InitialPaymentMethod")
                        .HasColumnType("integer");

                    b.Property<bool>("IsActive")
                        .HasColumnType("boolean");

                    b.Property<bool>("IsPublic")
                        .HasColumnType("boolean");

                    b.Property<int>("Issues")
                        .HasColumnType("integer");

                    b.Property<DateTime?>("LastParticipatoryHearingDateTime")
                        .HasColumnType("timestamp without time zone");

                    b.Property<int?>("LastParticipatoryHearingTimeId")
                        .HasColumnType("integer");

                    b.Property<int>("LastProcess")
                        .HasColumnType("integer");

                    b.Property<int>("LastStage")
                        .HasColumnType("integer");

                    b.Property<int>("LastStatus")
                        .HasColumnType("integer");

                    b.Property<DateTime>("LastStatusDateTime")
                        .HasColumnType("timestamp without time zone");

                    b.Property<int?>("LastStatusTimeId")
                        .HasColumnType("integer");

                    b.Property<DateTime>("LoadDateTime")
                        .HasColumnType("timestamp without time zone");

                    b.Property<int?>("MigrationSourceOfTruth")
                        .HasColumnType("integer");

                    b.Property<int>("Notes")
                        .HasColumnType("integer");

                    b.Property<DateTime?>("NoticeDeliveredDateTime")
                        .HasColumnType("timestamp without time zone");

                    b.Property<int?>("NoticeDeliveredTimeId")
                        .HasColumnType("integer");

                    b.Property<int>("NoticeServices")
                        .HasColumnType("integer");

                    b.Property<int>("Notices")
                        .HasColumnType("integer");

                    b.Property<int>("Participants")
                        .HasColumnType("integer");

                    b.Property<int?>("PaymentTimeId")
                        .HasColumnType("integer");

                    b.Property<int>("Payments")
                        .HasColumnType("integer");

                    b.Property<decimal>("PaymentsAmount")
                        .HasColumnType("numeric");

                    b.Property<int>("Processes")
                        .HasColumnType("integer");

                    b.Property<int>("Respondents")
                        .HasColumnType("integer");

                    b.Property<int>("SentEmailMessages")
                        .HasColumnType("integer");

                    b.Property<int>("Statuses")
                        .HasColumnType("integer");

                    b.Property<int>("SubServiceRequests")
                        .HasColumnType("integer");

                    b.Property<DateTime>("SubmittedDateTime")
                        .HasColumnType("timestamp without time zone");

                    b.Property<int?>("SubmittedTimeId")
                        .HasColumnType("integer");

                    b.Property<int>("Tasks")
                        .HasColumnType("integer");

                    b.Property<int>("TotalArbTimeMin")
                        .HasColumnType("integer");

                    b.Property<int>("TotalCitizenStatusTimeMin")
                        .HasColumnType("integer");

                    b.Property<int>("TotalIoTimeMin")
                        .HasColumnType("integer");

                    b.Property<int>("TotalOpenTimeMin")
                        .HasColumnType("integer");

                    b.Property<int>("Transactions")
                        .HasColumnType("integer");

                    b.HasKey("DisputeSummaryRecordId");

                    b.ToTable("FactDisputeSummaries");
                });

            modelBuilder.Entity("DataWarehouseDataModel.Models.LoadingHistory", b =>
                {
                    b.Property<int>("LoadingEventId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

                    b.Property<int>("FactTableId")
                        .HasColumnType("integer");

                    b.Property<string>("FactTableName")
                        .HasColumnType("character varying(75)")
                        .HasMaxLength(75);

                    b.Property<int>("LastStatus")
                        .HasColumnType("integer");

                    b.Property<DateTime?>("LoadEndDateTime")
                        .HasColumnType("timestamp without time zone");

                    b.Property<DateTime>("LoadStartDateTime")
                        .HasColumnType("timestamp without time zone");

                    b.Property<string>("OutcomeText")
                        .HasColumnType("character varying(200)")
                        .HasMaxLength(200);

                    b.Property<int?>("TotalRecordsLoaded")
                        .HasColumnType("integer");

                    b.HasKey("LoadingEventId");

                    b.ToTable("LoadingHistories");
                });
#pragma warning restore 612, 618
        }
    }
}
