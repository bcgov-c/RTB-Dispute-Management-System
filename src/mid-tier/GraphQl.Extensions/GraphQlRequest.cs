using GraphQL;

namespace GraphQl.Extensions;

public class GraphQlRequest
{
    public string OperationName { get; set; }

    public string Query { get; set; }

    public Inputs Variables { get; set; }
}