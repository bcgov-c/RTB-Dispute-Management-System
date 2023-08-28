using System;
using System.IO;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.EntityFramework;

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
        AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
        var builder = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json")
            .AddJsonFile($"appsettings.{environmentName}.json", true)
            .AddEnvironmentVariables();

        var config = builder.Build();

        var connectionString = config.GetConnectionString("DwConnection");

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "Could not find a connection string named 'DwConnection'.");
        }

        return Create(connectionString);
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
    : DesignTimeDbContextFactoryBase<DataWarehouseContext>
{
    protected override DataWarehouseContext CreateNewInstance(
        DbContextOptions<DataWarehouseContext> options)
    {
        return new DataWarehouseContext(options);
    }
}