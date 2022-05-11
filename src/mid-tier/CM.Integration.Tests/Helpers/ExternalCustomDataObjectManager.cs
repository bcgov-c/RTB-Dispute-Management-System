using System;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http;
using System.Security.Claims;
using System.Text;
using CM.Business.Entities.Models.ExternalCustomDataObject;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.IdentityModel.Tokens;

namespace CM.Integration.Tests.Helpers;

public static class ExternalCustomDataObjectManager
{
    public static EntityWithStatus<ExternalCustomDataObjectResponse> CreateExternalCustomDataObject(HttpClient client, ExternalCustomDataObjectRequest request)
    {
        return client.PostAsync<ExternalCustomDataObjectResponse>(RouteHelper.PostExternalCustomDataObject, request);
    }

    public static EntityWithStatus<ExternalCustomDataObjectResponse> UpdateExternalCustomDataObject(HttpClient client, int externalCustomDataObjectId, ExternalCustomObjectPatchRequest request)
    {
        var patchDoc = new JsonPatchDocument<ExternalCustomObjectPatchRequest>();
        if (!string.IsNullOrEmpty(request.Title))
        {
            patchDoc.Replace(e => e.Title, request.Title);
        }

        return client.PatchAsync<ExternalCustomDataObjectResponse>(RouteHelper.PatchExternalCustomDataObject + externalCustomDataObjectId, patchDoc);
    }

    public static HttpResponseMessage DeleteExternalCustomDataObject(HttpClient client, int externalCustomDataObjectId)
    {
        var response = client.DeleteAsync(RouteHelper.DeleteExternalCustomDataObject + externalCustomDataObjectId).Result;
        return response;
    }

    public static EntityWithStatus<ExternalCustomDataObjectResponse> GetExternalCustomDataObject(HttpClient client, int externalCustomDataObjectId)
    {
        return client.GetAsync<ExternalCustomDataObjectResponse>(RouteHelper.GetExternalCustomDataObject + externalCustomDataObjectId);
    }

    public static EntityWithStatus<ExternalCustomDataObjectGetResponse> GetExternalCustomDataObjects(HttpClient client)
    {
        return client.GetAsync<ExternalCustomDataObjectGetResponse>(RouteHelper.GetExternalCustomDataObjects);
    }

    #region One time token

    public static string CreateToken()
    {
        var sessionGuid = Guid.NewGuid();
        const string keyVal = "secret-key-keep-it-safe";

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(keyVal);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[] { new Claim("id", sessionGuid.ToString()) }),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }

    public static EntityWithStatus<ExternalCustomDataObjectResponse> CreateExternalCustomDataObject(HttpClient client, string token, ExternalCustomDataObjectRequest request)
    {
        return client.PostAsync<ExternalCustomDataObjectResponse>(string.Format(RouteHelper.PostExternalCustomDataObjectOtt, token), request);
    }

    public static EntityWithStatus<ExternalCustomDataObjectResponse> UpdateExternalCustomDataObject(HttpClient client, string token, int externalCustomDataObjectId, ExternalCustomObjectPatchRequest request)
    {
        var patchDoc = new JsonPatchDocument<ExternalCustomObjectPatchRequest>();
        if (string.IsNullOrEmpty(request.Title))
        {
            patchDoc.Replace(e => e.Title, request.Title);
        }

        return client.PatchAsync<ExternalCustomDataObjectResponse>(string.Format(RouteHelper.PatchExternalCustomDataObjectOtt, externalCustomDataObjectId, token), patchDoc);
    }

    public static HttpResponseMessage DeleteExternalCustomDataObject(HttpClient client, string token, int externalCustomDataObjectId)
    {
        var response = client.DeleteAsync(string.Format(RouteHelper.DeleteExternalCustomDataObjectOtt, externalCustomDataObjectId, token)).Result;
        return response;
    }

    #endregion
}