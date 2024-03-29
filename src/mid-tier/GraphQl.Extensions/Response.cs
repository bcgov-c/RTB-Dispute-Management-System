namespace GraphQl.Extensions;

public class Response
{
    public Response(object data)
    {
        StatusCode = StatusCodes.Success;
        Data = data;
    }

    public Response(string statusCode, string errorMessage)
    {
        StatusCode = statusCode;
        ErrorMessage = errorMessage;
    }

    public object Data { get; set; }

    public string StatusCode { get; set; }

    public string ErrorMessage { get; set; }
}