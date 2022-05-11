namespace DataWarehouseReporting.GraphQL.Infrastructure;

public interface IMutationResolver
{
    void Resolve(GraphQlMutation graphQlMutation);
}