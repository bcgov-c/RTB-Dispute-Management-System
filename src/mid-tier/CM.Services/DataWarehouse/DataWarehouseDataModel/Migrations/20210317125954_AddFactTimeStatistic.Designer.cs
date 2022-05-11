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
    [Migration("20210317125954_AddFactTimeStatistic")]
    partial class AddFactTimeStatistic
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .UseIdentityByDefaultColumns()
                .HasAnnotation("Relational:MaxIdentifierLength", 63)
                .HasAnnotation("ProductVersion", "5.0.0");

            modelBuilder.Entity("CM.Services.DataWarehouse.DataWarehouseDataModel.Models.DimCity", b =>
                {
                    b.Property<int>("DimCityId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .UseIdentityByDefaultColumn();

                    b.Property<string>("CityName")
                        .HasMaxLength(50)
                        .HasColumnType("character varying(50)");

                    b.Property<string>("CityNameSoundEx")
                        .HasMaxLength(5)
                        .HasColumnType("character varying(5)");

                    b.Property<int?>("CityPopulation")
                        .HasColumnType("integer");

                    b.Property<int>("CountryId")
                        .HasColumnType("integer");

                    b.Property<string>("CountryName")
                        .HasMaxLength(50)
                        .HasColumnType("character varying(50)");

                    b.Property<DateTime>("DateInserted")
                        .HasColumnType("timestamp without time zone");

                    b.Property<int>("ProvinceId")
                        .HasColumnType("integer");

                    b.Property<string>("ProvinceName")
                        .HasMaxLength(50)
                        .HasColumnType("character varying(50)");

                    b.Property<int?>("RegionId")
                        .HasColumnType("integer");

                    b.Property<string>("RegionName")
                        .HasMaxLength(50)
                        .HasColumnType("character varying(50)");

                    b.Property<int>("SubRegionId")
                        .HasColumnType("integer");

                    b.Property<string>("SubRegionName")
                        .HasMaxLength(50)
                        .HasColumnType("character varying(50)");

                    b.HasKey("DimCityId");

                    b.ToTable("DimCities");
                });

            modelBuilder.Entity("CM.Services.DataWarehouse.DataWarehouseDataModel.Models.DimTime", b =>
                {
                    b.Property<int>("DimTimeId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .UseIdentityByDefaultColumn();

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

            modelBuilder.Entity("CM.Services.DataWarehouse.DataWarehouseDataModel.Models.FactDisputeSummary", b =>
                {
                    b.Property<int>("DisputeSummaryRecordId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .UseIdentityByDefaultColumn();

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

                    b.Property<int>("AwardedMonetaryOrders")
                        .HasColumnType("integer");

                    b.Property<int>("AwardedPosessions")
                        .HasColumnType("integer");

                    b.Property<DateTime>("CreatedDate")
                        .HasColumnType("timestamp without time zone");

                    b.Property<byte?>("CreationMethod")
                        .HasColumnType("smallint");

                    b.Property<int>("CrossHearings")
                        .HasColumnType("integer");

                    b.Property<int>("DecisionsAndOrders")
                        .HasColumnType("integer");

                    b.Property<decimal>("DecisionsAndOrdersMb")
                        .HasColumnType("numeric");

                    b.Property<int>("DecisionsInterim")
                        .HasColumnType("integer");

                    b.Property<int>("DisputeCityId")
                        .HasColumnType("integer");

                    b.Property<Guid>("DisputeGuid")
                        .HasColumnType("uuid");

                    b.Property<byte>("DisputeSubType")
                        .HasColumnType("smallint");

                    b.Property<byte?>("DisputeType")
                        .HasColumnType("smallint");

                    b.Property<byte?>("DisputeUrgency")
                        .HasColumnType("smallint");

                    b.Property<int>("DocumentSets")
                        .HasColumnType("integer");

                    b.Property<int>("DocumentsDelivered")
                        .HasColumnType("integer");

                    b.Property<int>("EvidenceFiles")
                        .HasColumnType("integer");

                    b.Property<int>("EvidenceFilesFromApplicant")
                        .HasColumnType("integer");

                    b.Property<int>("EvidenceFilesMBFromApplicant")
                        .HasColumnType("integer");

                    b.Property<int>("EvidenceFilesMBFromRespondent")
                        .HasColumnType("integer");

                    b.Property<decimal>("EvidenceFilesMb")
                        .HasColumnType("numeric");

                    b.Property<int>("EvidenceOverrides")
                        .HasColumnType("integer");

                    b.Property<int>("EvidencePackageServices")
                        .HasColumnType("integer");

                    b.Property<int>("EvidencePackages")
                        .HasColumnType("integer");

                    b.Property<int>("EvidencePackagesFromApplicant")
                        .HasColumnType("integer");

                    b.Property<int>("EvidencePackagesFromRespondent")
                        .HasColumnType("integer");

                    b.Property<int>("EvidencefilesFromRespondent")
                        .HasColumnType("integer");

                    b.Property<int>("HearingParticipations")
                        .HasColumnType("integer");

                    b.Property<int>("Hearings")
                        .HasColumnType("integer");

                    b.Property<DateTime?>("InitialPaymentDateTime")
                        .HasColumnType("timestamp without time zone");

                    b.Property<byte?>("InitialPaymentMethod")
                        .HasColumnType("smallint");

                    b.Property<bool>("IsActive")
                        .HasColumnType("boolean");

                    b.Property<int>("IsAdjourned")
                        .HasColumnType("integer");

                    b.Property<bool>("IsPublic")
                        .HasColumnType("boolean");

                    b.Property<int>("Issues")
                        .HasColumnType("integer");

                    b.Property<DateTime?>("LastParticipatoryHearingDateTime")
                        .HasColumnType("timestamp without time zone");

                    b.Property<int?>("LastParticipatoryHearingTimeId")
                        .HasColumnType("integer");

                    b.Property<int?>("LastProcess")
                        .HasColumnType("integer");

                    b.Property<int?>("LastStage")
                        .HasColumnType("integer");

                    b.Property<int>("LastStatus")
                        .HasColumnType("integer");

                    b.Property<DateTime>("LastStatusDateTime")
                        .HasColumnType("timestamp without time zone");

                    b.Property<int?>("LastStatusTimeId")
                        .HasColumnType("integer");

                    b.Property<DateTime>("LoadDateTime")
                        .HasColumnType("timestamp without time zone");

                    b.Property<byte?>("MigrationSourceOfTruth")
                        .HasColumnType("smallint");

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

                    b.Property<int>("OrdersMonetary")
                        .HasColumnType("integer");

                    b.Property<int>("OrdersPossession")
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

                    b.Property<int>("RequestedAmount")
                        .HasColumnType("integer");

                    b.Property<int>("Respondents")
                        .HasColumnType("integer");

                    b.Property<int>("SentEmailMessages")
                        .HasColumnType("integer");

                    b.Property<int>("Statuses")
                        .HasColumnType("integer");

                    b.Property<int>("SubServiceRequests")
                        .HasColumnType("integer");

                    b.Property<DateTime?>("SubmittedDateTime")
                        .HasColumnType("timestamp without time zone");

                    b.Property<int?>("SubmittedTimeId")
                        .HasColumnType("integer");

                    b.Property<int>("Tasks")
                        .HasColumnType("integer");

                    b.Property<bool?>("TenancyEnded")
                        .HasColumnType("boolean");

                    b.Property<int>("TotalArbOwners")
                        .HasColumnType("integer");

                    b.Property<int>("TotalArbTimeMin")
                        .HasColumnType("integer");

                    b.Property<int>("TotalCitizenStatusTimeMin")
                        .HasColumnType("integer");

                    b.Property<int>("TotalHearingTimeMin")
                        .HasColumnType("integer");

                    b.Property<int>("TotalIOOwners")
                        .HasColumnType("integer");

                    b.Property<int>("TotalIoTimeMin")
                        .HasColumnType("integer");

                    b.Property<int>("TotalOpenTimeMin")
                        .HasColumnType("integer");

                    b.Property<int>("TotalPreparationTimeMin")
                        .HasColumnType("integer");

                    b.Property<int>("TotalStage0TimeMin")
                        .HasColumnType("integer");

                    b.Property<int>("TotalStage10TimeMin")
                        .HasColumnType("integer");

                    b.Property<int>("TotalStage2TimeMin")
                        .HasColumnType("integer");

                    b.Property<int>("TotalStage4TimeMin")
                        .HasColumnType("integer");

                    b.Property<int>("TotalStage6TimeMin")
                        .HasColumnType("integer");

                    b.Property<int>("TotalStage8TimeMin")
                        .HasColumnType("integer");

                    b.Property<int>("TotalStatus102TimeMin")
                        .HasColumnType("integer");

                    b.Property<int>("TotalStatus22TimeMin")
                        .HasColumnType("integer");

                    b.Property<int>("TotalStatus41TimeMin")
                        .HasColumnType("integer");

                    b.Property<int>("TotalWritingTimeMin")
                        .HasColumnType("integer");

                    b.Property<int>("Transactions")
                        .HasColumnType("integer");

                    b.HasKey("DisputeSummaryRecordId");

                    b.HasIndex("LoadDateTime")
                        .IncludeProperties(new[] { "CreationMethod" });

                    b.ToTable("FactDisputeSummaries");
                });

            modelBuilder.Entity("CM.Services.DataWarehouse.DataWarehouseDataModel.Models.FactTimeStatistic", b =>
                {
                    b.Property<int>("DisputeSummaryRecordId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .UseIdentityByDefaultColumn();

                    b.Property<int>("AmendmentsSubmitted")
                        .HasColumnType("integer");

                    b.Property<int>("ArbIncompleteTasksAssigned")
                        .HasColumnType("integer");

                    b.Property<int>("ArbIncompleteTasksUnassigned")
                        .HasColumnType("integer");

                    b.Property<DateTime>("ArbIncompleteTasksUnassignedOldest")
                        .HasColumnType("timestamp without time zone");

                    b.Property<int>("ArbTasksCompleted")
                        .HasColumnType("integer");

                    b.Property<DateTime>("AssociatedDate")
                        .HasColumnType("timestamp without time zone");

                    b.Property<int>("AssociatedDateId")
                        .HasColumnType("integer");

                    b.Property<int>("AssociatedOffice")
                        .HasColumnType("integer");

                    b.Property<int>("AvgNext10DeferredHearingDays")
                        .HasColumnType("integer");

                    b.Property<int>("AvgNext10EmergHearingDays")
                        .HasColumnType("integer");

                    b.Property<int>("AvgNext10StandardHearingDays")
                        .HasColumnType("integer");

                    b.Property<int>("ClarificationRequests")
                        .HasColumnType("integer");

                    b.Property<int>("CorrectionRequests")
                        .HasColumnType("integer");

                    b.Property<int>("DeferredDisputesPaid")
                        .HasColumnType("integer");

                    b.Property<int>("DisputeHearings")
                        .HasColumnType("integer");

                    b.Property<int>("DocumentsDelivered")
                        .HasColumnType("integer");

                    b.Property<int>("DocumentsUndelivered")
                        .HasColumnType("integer");

                    b.Property<DateTime>("DocumentsUndeliveredOldest")
                        .HasColumnType("timestamp without time zone");

                    b.Property<int>("DocumentsUndeliveredUrgent")
                        .HasColumnType("integer");

                    b.Property<DateTime>("DocumentsUndeliveredUrgentOldest")
                        .HasColumnType("timestamp without time zone");

                    b.Property<int>("EmergencyDisputesPaid")
                        .HasColumnType("integer");

                    b.Property<int>("EmptyHearings")
                        .HasColumnType("integer");

                    b.Property<int>("EvidenceFiles")
                        .HasColumnType("integer");

                    b.Property<int>("EvidenceFilesMB")
                        .HasColumnType("integer");

                    b.Property<int>("Files")
                        .HasColumnType("integer");

                    b.Property<int>("FilesMB")
                        .HasColumnType("integer");

                    b.Property<int>("IOIncompleteTasksAssigned")
                        .HasColumnType("integer");

                    b.Property<int>("IOIncompleteTasksUnassigned")
                        .HasColumnType("integer");

                    b.Property<DateTime>("IOIncompleteTasksUnassignedOldest")
                        .HasColumnType("timestamp without time zone");

                    b.Property<int>("IOTasksCompleted")
                        .HasColumnType("integer");

                    b.Property<int>("IntakePayments")
                        .HasColumnType("integer");

                    b.Property<bool>("IsActive")
                        .HasColumnType("boolean");

                    b.Property<bool>("IsPublic")
                        .HasColumnType("boolean");

                    b.Property<int>("LandlordDisputesPaid")
                        .HasColumnType("integer");

                    b.Property<DateTime>("LoadDateTime")
                        .HasColumnType("timestamp without time zone");

                    b.Property<int>("OfficeDisputesPaid")
                        .HasColumnType("integer");

                    b.Property<int>("OnlineDisputesPaid")
                        .HasColumnType("integer");

                    b.Property<int>("OpenFiles")
                        .HasColumnType("integer");

                    b.Property<int>("OtherIncompleteTasks")
                        .HasColumnType("integer");

                    b.Property<int>("PerUnitPayments")
                        .HasColumnType("integer");

                    b.Property<int>("Process1DisputesPaid")
                        .HasColumnType("integer");

                    b.Property<int>("Process2DisputesPaid")
                        .HasColumnType("integer");

                    b.Property<int>("ReviewPayments")
                        .HasColumnType("integer");

                    b.Property<int>("ReviewRequests")
                        .HasColumnType("integer");

                    b.Property<int>("Stage0Open")
                        .HasColumnType("integer");

                    b.Property<int>("Stage10Open")
                        .HasColumnType("integer");

                    b.Property<int>("Stage2Assigned")
                        .HasColumnType("integer");

                    b.Property<DateTime>("Stage2AssignedOldest")
                        .HasColumnType("timestamp without time zone");

                    b.Property<int>("Stage2Open")
                        .HasColumnType("integer");

                    b.Property<int>("Stage2Unassigned")
                        .HasColumnType("integer");

                    b.Property<DateTime>("Stage2UnassignedOldest")
                        .HasColumnType("timestamp without time zone");

                    b.Property<int>("Stage4Open")
                        .HasColumnType("integer");

                    b.Property<int>("Stage6Open")
                        .HasColumnType("integer");

                    b.Property<int>("Stage8Open")
                        .HasColumnType("integer");

                    b.Property<int>("StandardDisputesPaid")
                        .HasColumnType("integer");

                    b.Property<byte>("StatisticsType")
                        .HasColumnType("smallint");

                    b.Property<int>("StatusAbandonedNeedsUpdate")
                        .HasColumnType("integer");

                    b.Property<int>("StatusAbandonedNoService")
                        .HasColumnType("integer");

                    b.Property<int>("StatusCancelled")
                        .HasColumnType("integer");

                    b.Property<int>("StatusClosed")
                        .HasColumnType("integer");

                    b.Property<int>("StatusDecisionsReadyToSend")
                        .HasColumnType("integer");

                    b.Property<int>("StatusNeedsUpdate")
                        .HasColumnType("integer");

                    b.Property<int>("StatusRescheduledAssigned")
                        .HasColumnType("integer");

                    b.Property<int>("StatusRescheduledUnassigned")
                        .HasColumnType("integer");

                    b.Property<int>("StatusWaitingForDecision")
                        .HasColumnType("integer");

                    b.Property<DateTime>("StatusWaitingForDecisionOldest")
                        .HasColumnType("timestamp without time zone");

                    b.Property<int>("StatusWaitingProofService")
                        .HasColumnType("integer");

                    b.Property<int>("StatusWithdrawn")
                        .HasColumnType("integer");

                    b.Property<int>("SubServicesSubmitted")
                        .HasColumnType("integer");

                    b.Property<int>("TenantDisputesPaid")
                        .HasColumnType("integer");

                    b.HasKey("DisputeSummaryRecordId");

                    b.ToTable("FactTimeStatistics");
                });

            modelBuilder.Entity("CM.Services.DataWarehouse.DataWarehouseDataModel.Models.LoadingHistory", b =>
                {
                    b.Property<int>("LoadingEventId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .UseIdentityByDefaultColumn();

                    b.Property<int>("FactTableId")
                        .HasColumnType("integer");

                    b.Property<string>("FactTableName")
                        .HasMaxLength(75)
                        .HasColumnType("character varying(75)");

                    b.Property<int>("LastStatus")
                        .HasColumnType("integer");

                    b.Property<DateTime?>("LoadEndDateTime")
                        .HasColumnType("timestamp without time zone");

                    b.Property<DateTime>("LoadStartDateTime")
                        .HasColumnType("timestamp without time zone");

                    b.Property<string>("OutcomeText")
                        .HasMaxLength(200)
                        .HasColumnType("character varying(200)");

                    b.Property<int?>("TotalRecordsLoaded")
                        .HasColumnType("integer");

                    b.HasKey("LoadingEventId");

                    b.ToTable("LoadingHistories");
                });

            modelBuilder.Entity("CM.Services.DataWarehouse.DataWarehouseDataModel.Models.SystemUser", b =>
                {
                    b.Property<int>("SystemUserId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .UseIdentityByDefaultColumn();

                    b.Property<string>("AccountEmail")
                        .HasMaxLength(100)
                        .HasColumnType("character varying(100)");

                    b.Property<string>("FullName")
                        .HasMaxLength(100)
                        .HasColumnType("character varying(100)");

                    b.Property<bool?>("IsActive")
                        .HasColumnType("boolean");

                    b.Property<string>("Password")
                        .HasMaxLength(250)
                        .HasColumnType("character varying(250)");

                    b.Property<string>("Username")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("character varying(50)");

                    b.HasKey("SystemUserId");

                    b.ToTable("SystemUsers");
                });

            modelBuilder.Entity("CM.Services.DataWarehouse.DataWarehouseDataModel.Models.UserToken", b =>
                {
                    b.Property<int>("UserTokenId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .UseIdentityByDefaultColumn();

                    b.Property<string>("AuthToken")
                        .IsRequired()
                        .HasMaxLength(250)
                        .HasColumnType("character varying(250)");

                    b.Property<DateTime>("ExpiresOn")
                        .HasColumnType("timestamp without time zone");

                    b.Property<DateTime>("IssuedOn")
                        .HasColumnType("timestamp without time zone");

                    b.Property<int?>("SystemUserId")
                        .HasColumnType("integer");

                    b.HasKey("UserTokenId");

                    b.HasIndex("SystemUserId");

                    b.ToTable("UserTokens");
                });

            modelBuilder.Entity("CM.Services.DataWarehouse.DataWarehouseDataModel.Models.UserToken", b =>
                {
                    b.HasOne("CM.Services.DataWarehouse.DataWarehouseDataModel.Models.SystemUser", "SystemUser")
                        .WithMany()
                        .HasForeignKey("SystemUserId");

                    b.Navigation("SystemUser");
                });
#pragma warning restore 612, 618
        }
    }
}
