﻿using System;
using System.IO;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace DataWarehouseReporting.Data.EntityFramework;

public abstract class DesignTimeDbContextFactoryBase<TContext> :
    IDesignTimeDbContextFactory<TContext>
    where TContext : DbContext
{
    public TContext CreateDbContext(string[] args)
    {
        return Create(
            Directory.GetCurrentDirectory(),
            Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT"));
    }

    public TContext Create()
    {
        var environmentName =
            Environment.GetEnvironmentVariable(
                "ASPNETCORE_ENVIRONMENT");

        var basePath = AppContext.BaseDirectory;

        return Create(basePath, environmentName);
    }

    protected abstract TContext CreateNewInstance(DbContextOptions<TContext> options);

    private TContext Create(string basePath, string environmentName)
    {
        var builder = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json")
            .AddJsonFile($"appsettings.{environmentName}.json", true)
            .AddEnvironmentVariables();

        var config = builder.Build();

        var connection = config.GetConnectionString("DbConnection");

        if (string.IsNullOrWhiteSpace(connection))
        {
            throw new InvalidOperationException(
                "Could not find a connection string named 'DbConnection'.");
        }

        return Create(connection);
    }

    private TContext Create(string connectionString)
    {
        if (string.IsNullOrEmpty(connectionString))
        {
            throw new ArgumentException(
                $"{nameof(connectionString)} is null or empty.",
                nameof(connectionString));
        }

        var optionsBuilder = new DbContextOptionsBuilder<TContext>();

        optionsBuilder.UseNpgsql(connectionString);

        var options = optionsBuilder.Options;

        return CreateNewInstance(options);
    }
}

public class DbContextDesignTimeDbContextFactory
    : DesignTimeDbContextFactoryBase<DataWarehouseReportingContext>
{
    protected override DataWarehouseReportingContext CreateNewInstance(
        DbContextOptions<DataWarehouseReportingContext> options)
    {
        return new DataWarehouseReportingContext(options, null);
    }
}