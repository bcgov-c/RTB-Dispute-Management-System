using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace CM.ServiceBase;

public static class HttpContextExtension
{
    public static async Task<string> GetRequestBodyAsync(this HttpContext context)
    {
        try
        {
            var stream = new StreamReader(context.Request.Body);
            stream.BaseStream.Seek(0, SeekOrigin.Begin);
            return await stream.ReadToEndAsync();
        }
        finally
        {
            context.Request.Body.Position = 0;
        }
    }
}