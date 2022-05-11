﻿// <auto-generated />
using System;
using CM.Services.AdHocReportSender.AdHocReportSenderService;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Migrations
{
    [DbContext(typeof(AdHocReportContext))]
    [Migration("20200401113044_Initial")]
    partial class Initial
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                .HasAnnotation("ProductVersion", "3.1.0")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            modelBuilder.Entity("CM.Services.AdHocReportSender.AdHocReportSenderService.Models.AdHocReport", b =>
                {
                    b.Property<long>("AdHocReportId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint")
                        .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

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
                        .HasColumnType("bigint")
                        .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

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

                    b.HasKey("AdHocReportAttachmentId");

                    b.HasIndex("AdHocReportId")
                        .IsUnique();

                    b.ToTable("AdHocReportAttachments");
                });

            modelBuilder.Entity("CM.Services.AdHocReportSender.AdHocReportSenderService.Models.AdHocReportTracking", b =>
                {
                    b.Property<long>("AdHocReportTrackingId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint")
                        .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

                    b.Property<long>("AdHocReportId")
                        .HasColumnType("bigint");

                    b.Property<DateTime?>("SentDate")
                        .HasColumnType("timestamp without time zone");

                    b.Property<byte>("Status")
                        .HasColumnType("smallint");

                    b.HasKey("AdHocReportTrackingId");

                    b.HasIndex("AdHocReportId")
                        .IsUnique();

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
#pragma warning restore 612, 618
        }
    }
}
