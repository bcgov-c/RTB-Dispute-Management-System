using System.Net.Http;
using System.Text;
using Newtonsoft.Json;
using static System.Net.Mime.MediaTypeNames;

namespace CM.Common.Utilities
{
    public static class ObjectExtensions
    {
        public static StringContent GetContent(this object request, string mimeType = Application.Json)
        {
            var json = JsonConvert.SerializeObject(request);
            var content = new StringContent(json, Encoding.UTF8, mimeType);
            return content;
        }
    }
}
