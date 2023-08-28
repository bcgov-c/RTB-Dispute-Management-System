﻿using System;
using System.IO;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.EntityFramework;

public abstract class DesignTimeDbContextFactoryBase<TContext> : IDesignTimeDbContextFactory<TContext>
    where TContext : DbContext
{
    public TContext CreateDbContext(string[] args)
    {
        return CreateEx(Directory.GetCurrentDirectory());
    }

    public TContext Create()
    {
        var basePath = AppContext.BaseDirectory;

        return CreateEx(basePath);
    }

    protected abstract TContext CreateNewInstance(DbContextOptions<TContext> options);

    private TContext CreateEx(string basePath)
    {
        AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
        var builder = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json")
            .AddJsonFile("secrets/appsettings.json", true)
            .AddEnvironmentVariables();

        var config = builder.Build();

        var connectionString = config.GetConnectionString("AdHocReportConnection");

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException("Could not find a connection string named 'AdHocReportConnection'.");
        }

        return Create(connectionString);
    }

    private TContext Create(string connectionString)
    {
        if (string.IsNullOrEmpty(connectionString))
        {
            throw new ArgumentException($"{nameof(connectionString)} is null or empty.", nameof(connectionString));
        }

        var optionsBuilder = new DbContextOptionsBuilder<TContext>();

        optionsBuilder.UseNpgsql(connectionString);

        var options = optionsBuilder.Options;

        return CreateNewInstance(options);
    }
}

public class DbContextDesignTimeDbContextFactory : DesignTimeDbContextFactoryBase<AdHocReportContext>
{
    protected override AdHocReportContext CreateNewInstance(DbContextOptions<AdHocReportContext> options)
    {
        return new AdHocReportContext(options, null);
    }
}