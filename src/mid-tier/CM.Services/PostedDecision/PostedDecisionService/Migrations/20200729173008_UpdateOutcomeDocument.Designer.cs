﻿// <auto-generated />

using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Services.PostedDecision.PostedDecisionDataService.Migrations
{
    [DbContext(typeof(PostedDecisionContext))]
    [Migration("20200729173008_UpdateOutcomeDocument")]
    partial class UpdateOutcomeDocument
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                .HasAnnotation("ProductVersion", "3.1.3")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            modelBuilder.Entity("CM.Services.PostedDecision.PostedDecisionDataService.Models.PostedDecision", b =>
                {
                    b.Property<int>("PostedDecisionId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

                    b.Property<byte?>("ApplicantHearingAttendance")
                        .HasColumnType("smallint");

                    b.Property<DateTime?>("ApplicationSubmittedDate")
                        .HasColumnType("timestamp without time zone");

                    b.Property<byte?>("AssociateProcessId")
                        .HasColumnType("smallint");

                    b.Property<string>("AssociatedProcessName")
                        .HasColumnType("character varying(100)")
                        .HasMaxLength(100);

                    b.Property<int?>("CountApplicantEvidenceFiles")
                        .HasColumnType("integer");

                    b.Property<int?>("CountRespondentEvidenceFiles")
                        .HasColumnType("integer");

                    b.Property<byte?>("CreatedMethod")
                        .HasColumnType("smallint");

                    b.Property<DateTime>("DecisionDate")
                        .HasColumnType("timestamp without time zone");

                    b.Property<int>("DecisionFileId")
                        .HasColumnType("integer");

                    b.Property<int>("DisputeId")
                        .HasColumnType("integer");

                    b.Property<byte?>("DisputeProcess")
                        .HasColumnType("smallint");

                    b.Property<byte?>("DisputeSubType")
                        .HasColumnType("smallint");

                    b.Property<byte?>("DisputeType")
                        .HasColumnType("smallint");

                    b.Property<byte?>("DisputeUrgency")
                        .HasColumnType("smallint");

                    b.Property<int>("FileNumber")
                        .HasColumnType("integer");

                    b.Property<string>("FilePath")
                        .HasColumnType("text");

                    b.Property<byte?>("InitialPaymentMethod")
                        .HasColumnType("smallint");

                    b.Property<bool?>("IsDeleted")
                        .HasColumnType("boolean");

                    b.Property<bool?>("NoteWorthy")
                        .HasColumnType("boolean");

                    b.Property<byte?>("NumberAdvocates")
                        .HasColumnType("smallint");

                    b.Property<byte?>("NumberAgents")
                        .HasColumnType("smallint");

                    b.Property<byte?>("NumberApplicants")
                        .HasColumnType("smallint");

                    b.Property<byte?>("NumberBusinesses")
                        .HasColumnType("smallint");

                    b.Property<byte?>("NumberIndividuals")
                        .HasColumnType("smallint");

                    b.Property<byte?>("NumberRespondents")
                        .HasColumnType("smallint");

                    b.Property<DateTime?>("OriginalNoticeDate")
                        .HasColumnType("timestamp without time zone");

                    b.Property<bool?>("OriginalNoticeDelivered")
                        .HasColumnType("boolean");

                    b.Property<decimal?>("PetDamageDepositAmount")
                        .HasColumnType("numeric");

                    b.Property<int?>("PostedBy")
                        .HasColumnType("integer");

                    b.Property<DateTime?>("PostingDate")
                        .HasColumnType("timestamp without time zone");

                    b.Property<DateTime?>("PreviousHearingDate")
                        .HasColumnType("timestamp without time zone");

                    b.Property<byte?>("PreviousHearingLinkingType")
                        .HasColumnType("smallint");

                    b.Property<int?>("PreviousHearingProcessDuration")
                        .HasColumnType("integer");

                    b.Property<byte?>("PreviousHearingProcessMethod")
                        .HasColumnType("smallint");

                    b.Property<byte?>("PrimaryApplicantType")
                        .HasColumnType("smallint");

                    b.Property<decimal?>("RentPaymentAmount")
                        .HasColumnType("numeric");

                    b.Property<string>("RentPaymentInterval")
                        .HasColumnType("text");

                    b.Property<byte?>("RespondentHearingAttendance")
                        .HasColumnType("smallint");

                    b.Property<string>("SearchKeyWords")
                        .HasColumnType("character varying(255)")
                        .HasMaxLength(255);

                    b.Property<string>("SearchResultSummary")
                        .HasColumnType("character varying(750)")
                        .HasMaxLength(750);

                    b.Property<string>("SearchTags")
                        .HasColumnType("character varying(255)")
                        .HasMaxLength(255);

                    b.Property<string>("SearchText")
                        .HasColumnType("text");

                    b.Property<decimal?>("SecurityDepositAmount")
                        .HasColumnType("numeric");

                    b.Property<byte?>("TenancyAgreementSignedBy")
                        .HasColumnType("smallint");

                    b.Property<string>("TenancyCity")
                        .HasColumnType("character varying(50)")
                        .HasMaxLength(50);

                    b.Property<DateTime?>("TenancyEndDate")
                        .HasColumnType("timestamp without time zone");

                    b.Property<byte?>("TenancyEnded")
                        .HasColumnType("smallint");

                    b.Property<byte?>("TenancyGeozone")
                        .HasColumnType("smallint");

                    b.Property<DateTime?>("TenancyStartDate")
                        .HasColumnType("timestamp without time zone");

                    b.Property<DateTime?>("UrlExpirationDate")
                        .HasColumnType("timestamp without time zone");

                    b.HasKey("PostedDecisionId");

                    b.ToTable("PostedDecisions");
                });

            modelBuilder.Entity("CM.Services.PostedDecision.PostedDecisionDataService.Models.PostedDecisionOutcome", b =>
                {
                    b.Property<int>("PostedDecisionOutcomeId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

                    b.Property<byte?>("ClaimCode")
                        .HasColumnType("smallint");

                    b.Property<int?>("ClaimId")
                        .HasColumnType("integer");

                    b.Property<string>("ClaimTitle")
                        .HasColumnType("character varying(255)")
                        .HasMaxLength(255);

                    b.Property<byte?>("ClaimType")
                        .HasColumnType("smallint");

                    b.Property<bool?>("IsDeleted")
                        .HasColumnType("boolean");

                    b.Property<int>("PostedBy")
                        .HasColumnType("integer");

                    b.Property<int>("PostedDecisionId")
                        .HasColumnType("integer");

                    b.Property<DateTime?>("PostingDate")
                        .HasColumnType("timestamp without time zone");

                    b.Property<string>("RelatedSections")
                        .HasColumnType("character varying(255)")
                        .HasMaxLength(255);

                    b.Property<decimal?>("RemedyAmountAwarded")
                        .HasColumnType("numeric");

                    b.Property<decimal?>("RemedyAmountRequested")
                        .HasColumnType("numeric");

                    b.Property<int?>("RemedyId")
                        .HasColumnType("integer");

                    b.Property<byte>("RemedyStatus")
                        .HasColumnType("smallint");

                    b.Property<byte?>("RemedySubStatus")
                        .HasColumnType("smallint");

                    b.Property<byte>("RemedyType")
                        .HasColumnType("smallint");

                    b.HasKey("PostedDecisionOutcomeId");

                    b.HasIndex("PostedDecisionId");

                    b.ToTable("PostedDecisionOutcomes");
                });

            modelBuilder.Entity("CM.Services.PostedDecision.PostedDecisionDataService.Models.PostedDecisionOutcome", b =>
                {
                    b.HasOne("CM.Services.PostedDecision.PostedDecisionDataService.Models.PostedDecision", "PostedDecision")
                        .WithMany("PostedDecisionOutcomes")
                        .HasForeignKey("PostedDecisionId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });
#pragma warning restore 612, 618
        }
    }
}
