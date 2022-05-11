namespace DataWarehouseReporting.GraphQL.Infrastructure;

public interface IQueryResolver
{
    void Resolve(GraphQlQuery graphQlQuery);
}