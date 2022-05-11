using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Web;
using Newtonsoft.Json;
using static System.Net.Mime.MediaTypeNames;

namespace CM.Integration.Tests.Infrastructure;

public static class IntegrationTestsExtensions
{
    public static EntityWithStatus<T> PostAsync<T>(this HttpClient httpClient, string requestUri, object request, MediaTypeHeaderValue contentType = null, bool checkSuccess = false)
        where T : class
    {
        var content = request.GetContent();
        if (contentType != null)
        {
            content.Headers.ContentType = contentType;
        }

        var response = httpClient.PostAsync(requestUri, content).Result;
        if (checkSuccess)
        {
            response.EnsureSuccessStatusCode();
        }

        if (response.StatusCode != System.Net.HttpStatusCode.OK)
        {
            return new EntityWithStatus<T> { ResponseMessage = response, ResponseObject = null };
        }

        var result = response.GetObjectFromResponse<T>();

        return new EntityWithStatus<T> { ResponseMessage = response, ResponseObject = result };
    }

    public static EntityWithStatus<T> PostAsync<T>(this HttpClient httpClient, string requestUri)
        where T : class
    {
        var response = httpClient.PostAsync(requestUri, null!).Result;

        if (response.StatusCode != System.Net.HttpStatusCode.OK)
        {
            return new EntityWithStatus<T> { ResponseMessage = response, ResponseObject = null };
        }

        var result = response.GetObjectFromResponse<T>();

        return new EntityWithStatus<T> { ResponseMessage = response, ResponseObject = result };
    }

    public static EntityWithStatus<T> PatchAsync<T>(this HttpClient httpClient, string requestUri, object request, bool checkSuccess = false)
        where T : class
    {
        var content = request.GetContent("application/json-patch+json");
        var response = httpClient.PatchAsync(requestUri, content).Result;
        if (checkSuccess)
        {
            response.EnsureSuccessStatusCode();
        }

        if (response.StatusCode != System.Net.HttpStatusCode.OK)
        {
            return new EntityWithStatus<T> { ResponseMessage = response, ResponseObject = null };
        }

        var result = response.GetObjectFromResponse<T>();
        return new EntityWithStatus<T> { ResponseMessage = response, ResponseObject = result };
    }

    public static EntityWithStatus<T> GetAsync<T>(this HttpClient httpClient, string requestUri, bool checkSuccess = false)
        where T : class
    {
        var response = httpClient.GetAsync(requestUri).Result;
        if (checkSuccess)
        {
            response.EnsureSuccessStatusCode();
        }

        if (response.StatusCode != System.Net.HttpStatusCode.OK)
        {
            return new EntityWithStatus<T> { ResponseMessage = response, ResponseObject = null };
        }

        var result = response.GetObjectFromResponse<T>();
        return new EntityWithStatus<T> { ResponseMessage = response, ResponseObject = result };
    }

    public static EntityWithStatus<T> GetAsync<T>(this HttpClient httpClient, string requestUri, object request, bool checkSuccess = false)
        where T : class
    {
        var requestMessage = new HttpRequestMessage(HttpMethod.Get, requestUri) { Content = request.GetContent() };
        var response = httpClient.SendAsync(requestMessage).Result;
        if (checkSuccess)
        {
            response.EnsureSuccessStatusCode();
        }

        if (response.StatusCode != System.Net.HttpStatusCode.OK)
        {
            return new EntityWithStatus<T> { ResponseMessage = response, ResponseObject = null };
        }

        var result = response.GetObjectFromResponse<T>();
        return new EntityWithStatus<T> { ResponseMessage = response, ResponseObject = result };
    }

    public static EntityWithStatus<T> SearchAsync<T>(this HttpClient httpClient, string requestUri, object request)
        where T : class
    {
        var queryString = request != null ? GetQueryString(request).Trim('&') : string.Empty;

        var response = httpClient.GetAsync(requestUri + queryString).Result;

        if (response.StatusCode != System.Net.HttpStatusCode.OK)
        {
            return new EntityWithStatus<T> { ResponseMessage = response, ResponseObject = null };
        }

        var result = response.GetObjectFromResponse<T>();
        return new EntityWithStatus<T> { ResponseMessage = response, ResponseObject = result };
    }

    public static FileStreamWithStatus GetFileAsync(this HttpClient httpClient, string requestUri, bool checkSuccess = false)
    {
        var response = httpClient.GetAsync(requestUri).Result;
        if (checkSuccess)
        {
            response.EnsureSuccessStatusCode();
        }

        if (response.StatusCode != System.Net.HttpStatusCode.OK)
        {
            return new FileStreamWithStatus { ResponseMessage = response, ResponseStream = null };
        }

        var result = response.GetFileFromContent();
        return new FileStreamWithStatus { ResponseMessage = response, ResponseStream = result };
    }

    private static T GetObjectFromResponse<T>(this HttpResponseMessage response)
    {
        return response.Content.ReadAsAsync<T>().Result;
    }

    private static StringContent GetContent(this object request, string mimeType = Application.Json)
    {
        var json = JsonConvert.SerializeObject(request);
        var content = new StringContent(json, Encoding.UTF8, mimeType);
        return content;
    }

    private static Stream GetFileFromContent(this HttpResponseMessage response)
    {
        return response.Content.ReadAsStreamAsync().Result;
    }

    private static string GetQueryString(object request)
    {
        var arrayProperties = request.GetType().GetProperties().Where(v => v.PropertyType.IsArray && v.GetValue(request) != null).ToList();
        var queryArray = string.Empty;

        foreach (var property in arrayProperties)
        {
            if (property.PropertyType.IsArray)
            {
                var array = (int[])property.GetValue(request);
                queryArray = string.Join(
                    "&",
                    array
                        .Select(p => property.Name + "=" + HttpUtility.UrlEncode(p.ToString())));
            }
        }

        var query = string.Join(
            "&",
            request.GetType().GetProperties().Where(v => !v.PropertyType.IsArray && v.GetValue(request) != null && !string.IsNullOrEmpty(v.GetValue(request).ToString()))
                .Select(p => p.Name + "=" + HttpUtility.UrlEncode(p.GetValue(request).ToString())));

        return queryArray + "&" + query;
    }
}