using System;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Nest;

namespace CM.ElasticSearch;

public static class ElasticSearchExtensions
{
    public static void AddElasticsearch<T>(this IServiceCollection services, IConfiguration configuration)
        where T : class
    {
        var url = configuration["elasticsearch:url"];
        var defaultIndex = configuration["elasticsearch:index"];

        var settings = new ConnectionSettings(new Uri(url)).DefaultIndex(defaultIndex);

        AddDefaultMappings<T>(settings);

        var client = new ElasticClient(settings);

        services.AddSingleton(client);

        CreateIndex<T>(client, defaultIndex);
    }

    private static void AddDefaultMappings<T>(ConnectionSettings settings)
        where T : class
    {
        settings.DefaultMappingFor<T>(m => m.IdProperty("Id"));
    }

    private static void CreateIndex<T>(IElasticClient client, string indexName)
        where T : class
    {
        client.Indices.Create(indexName, index => index.Map<T>(x => x.AutoMap()));
    }
}