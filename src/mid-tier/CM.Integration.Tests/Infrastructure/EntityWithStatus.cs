using System.IO;
using System.Net;
using System.Net.Http;
using FluentAssertions;

namespace CM.Integration.Tests.Infrastructure;

public class EntityWithStatus<T>
    where T : class
{
    public T ResponseObject { get; set; }

    public HttpResponseMessage ResponseMessage { get; set; }

    public void CheckStatusCode(HttpStatusCode httpStatusCode = HttpStatusCode.OK)
    {
        var stream = ResponseMessage.Content.ReadAsStringAsync();
        ResponseMessage.StatusCode.Should().Be(httpStatusCode, stream.Result);
    }
}

public class FileStreamWithStatus
{
    public Stream ResponseStream { get; set; }

    public HttpResponseMessage ResponseMessage { get; set; }

    public void CheckStatusCode(HttpStatusCode httpStatusCode = HttpStatusCode.OK)
    {
        var stream = ResponseMessage.Content.ReadAsStringAsync();
        ResponseMessage.StatusCode.Should().Be(httpStatusCode, stream.Result);
    }
}