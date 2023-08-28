﻿// <auto-generated />
using System;
using CM.Services.AdHocReportSender.AdHocReportSenderService;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Migrations
{
    [DbContext(typeof(AdHocReportContext))]
    [Migration("20220523095437_AddTargetDatabaseColumns")]
    partial class AddTargetDatabaseColumns
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "6.0.1")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("CM.Services.AdHocReportSender.AdHocReportSenderService.Models.AdHocDlReport", b =>
                {
                    b.Property<long>("AdHocDlReportId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("AdHocDlReportId"));

                    b.Property<DateTime>("CreatedDate")
                        .HasColumnType("timestamp without time zone");

                    b.Property<string>("Description")
                        .HasColumnType("text");

                    b.Property<bool?>("ExcelTemplateExists")
                        .HasColumnType("boolean");

                    b.Property<int?>("ExcelTemplateId")
                        .HasColumnType("integer");

                    b.Property<string>("HtmlDataDictionary")
                        .HasColumnType("text");

                    b.Property<bool>("IsActive")
                        .HasColumnType("boolean");

                    b.Property<string>("QueryForName")
                        .HasColumnType("text");

                    b.Property<string>("QueryForReport")
                        .HasColumnType("text");

                    b.Property<byte?>("ReportUserGroup")
                        .HasColumnType("smallint");

                    b.Property<byte>("SubType")
                        .HasColumnType("smallint");

                    b.Property<byte>("TargetDatabase")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("smallint")
                        .HasDefaultValue((byte)1);

                    b.Property<string>("Title")
                        .HasColumnType("text");

                    b.Property<byte>("Type")
                        .HasColumnType("smallint");

                    b.HasKey("AdHocDlReportId");

                    b.ToTable("AdHocDlReports");
                });

            modelBuilder.Entity("CM.Services.AdHocReportSender.AdHocReportSenderService.Models.AdHocReport", b =>
                {
                    b.Property<long>("AdHocReportId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("AdHocReportId"));

                    b.Property<DateTime>("CreatedDate")
                        .HasColumnType("timestamp without time zone");

                    b.Property<string>("CronJob")
                        .HasColumnType("text");

                    b.Property<string>("Description")
                        .HasColumnType("text");

                    b.Property<string>("EmailBody")
                        .HasColumnType("text");

                    b.Property<string>("EmailFrom")
                        .HasColumnType("text");

                    b.Property<string>("EmailSubject")
                        .HasColumnType("text");

                    b.Property<string>("EmailTo")
                        .HasColumnType("text");

                    b.Property<bool>("IsActive")
                        .HasColumnType("boolean");

                    b.HasKey("AdHocReportId");

                    b.ToTable("AdHocReports");
                });

            modelBuilder.Entity("CM.Services.AdHocReportSender.AdHocReportSenderService.Models.AdHocReportAttachment", b =>
                {
                    b.Property<long>("AdHocReportAttachmentId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("AdHocReportAttachmentId"));

                    b.Property<long>("AdHocReportId")
                        .HasColumnType("bigint");

                    b.Property<DateTime>("CreatedDate")
                        .HasColumnType("timestamp without time zone");

                    b.Property<string>("Description")
                        .HasColumnType("text");

                    b.Property<bool>("IsActive")
                        .HasColumnType("boolean");

                    b.Property<string>("QueryForAttachment")
                        .HasColumnType("text");

                    b.Property<string>("QueryForName")
                        .HasColumnType("text");

                    b.Property<byte>("TargetDatabase")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("smallint")
                        .HasDefaultValue((byte)1);

                    b.HasKey("AdHocReportAttachmentId");

                    b.HasIndex("AdHocReportId");

                    b.ToTable("AdHocReportAttachments");
                });

            modelBuilder.Entity("CM.Services.AdHocReportSender.AdHocReportSenderService.Models.AdHocReportTracking", b =>
                {
                    b.Property<long>("AdHocReportTrackingId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("AdHocReportTrackingId"));

                    b.Property<long>("AdHocReportId")
                        .HasColumnType("bigint");

                    b.Property<DateTime?>("SentDate")
                        .HasColumnType("timestamp without time zone");

                    b.Property<byte>("Status")
                        .HasColumnType("smallint");

                    b.HasKey("AdHocReportTrackingId");

                    b.HasIndex("AdHocReportId");

                    b.ToTable("AdHocReportsTracking");
                });

            modelBuilder.Entity("CM.Services.AdHocReportSender.AdHocReportSenderService.Models.AdHocReportAttachment", b =>
                {
                    b.HasOne("CM.Services.AdHocReportSender.AdHocReportSenderService.Models.AdHocReport", null)
                        .WithOne("AdHocReportAttachment")
                        .HasForeignKey("CM.Services.AdHocReportSender.AdHocReportSenderService.Models.AdHocReportAttachment", "AdHocReportId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("CM.Services.AdHocReportSender.AdHocReportSenderService.Models.AdHocReportTracking", b =>
                {
                    b.HasOne("CM.Services.AdHocReportSender.AdHocReportSenderService.Models.AdHocReport", null)
                        .WithOne("AdHocReportsTracking")
                        .HasForeignKey("CM.Services.AdHocReportSender.AdHocReportSenderService.Models.AdHocReportTracking", "AdHocReportId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("CM.Services.AdHocReportSender.AdHocReportSenderService.Models.AdHocReport", b =>
                {
                    b.Navigation("AdHocReportAttachment");

                    b.Navigation("AdHocReportsTracking");
                });
#pragma warning restore 612, 618
        }
    }
}
