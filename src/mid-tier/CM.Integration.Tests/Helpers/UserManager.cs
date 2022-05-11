using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using CM.Business.Entities.Models.AccessCode;
using CM.Business.Entities.Models.Dispute;
using CM.Business.Entities.Models.InternalUserRole;
using CM.Business.Entities.Models.User;
using CM.Common.Utilities;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers;

public static class UserManager
{
    public static HttpStatusCode Logout(HttpClient client)
    {
        var userResponse = client.PostAsync(RouteHelper.Logout, null).Result;
        return userResponse.StatusCode;
    }

    public static void SetDisputeGuidHeaderToken(this HttpClient client, Guid disputeGuid)
    {
        var isTokenExist = client.DefaultRequestHeaders.Contains(ApiHeader.DisputeGuidToken);
        if (isTokenExist)
        {
            client.DefaultRequestHeaders.Remove(ApiHeader.DisputeGuidToken);
        }

        client.DefaultRequestHeaders.Add(ApiHeader.DisputeGuidToken, disputeGuid.ToString());
    }

    public static EntityWithStatus<string> Authenticate(this HttpClient client, string username, string password)
    {
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", Convert.ToBase64String(System.Text.Encoding.ASCII.GetBytes($"{username}:{password}")));
        var response = client.PostAsync(RouteHelper.Authenticate, null).Result;

        var token = ((string[])response.Headers.GetValues(ApiHeader.Token))[0];
        var isTokenExist = client.DefaultRequestHeaders.Contains(ApiHeader.Token);
        if (isTokenExist)
        {
            client.DefaultRequestHeaders.Remove(ApiHeader.Token);
        }

        client.DefaultRequestHeaders.Add(ApiHeader.Token, token);

        return new EntityWithStatus<string> { ResponseObject = token, ResponseMessage = response };
    }

    public static EntityWithStatus<object> Authenticate(this HttpClient client, string accessCode)
    {
        var response = client.PostAsync(RouteHelper.PostAccessCode + accessCode, null).Result;
        var json = response.Content.ReadAsStringAsync().Result;

        if (json.Length > 40)
        {
            var closedDispute = Newtonsoft.Json.JsonConvert.DeserializeObject<DisputeClosedResponse>(json);

            if (closedDispute != null)
            {
                return new EntityWithStatus<object> { ResponseObject = closedDispute, ResponseMessage = response };
            }
        }

        var token = Newtonsoft.Json.JsonConvert.DeserializeObject<string>(json);
        var isTokenExist = client.DefaultRequestHeaders.Contains(ApiHeader.Token);
        if (isTokenExist)
        {
            client.DefaultRequestHeaders.Remove(ApiHeader.Token);
        }

        client.DefaultRequestHeaders.Add(ApiHeader.Token, token);

        return new EntityWithStatus<object> { ResponseObject = token, ResponseMessage = response };
    }

    public static EntityWithStatus<string> ResetUser(HttpClient client, int userId, UserLoginResetRequest request)
    {
        var patchDoc = new JsonPatchDocument<UserLoginResetRequest>();
        if (request.Password != null)
        {
            patchDoc.Replace(e => e.Password, request.Password);
        }

        return client.PatchAsync<string>(RouteHelper.ResetUser + userId, patchDoc);
    }

    public static EntityWithStatus<UserLoginResponse> UpdateUser(HttpClient client, int userId, UserLoginPatchRequest request)
    {
        var patchDoc = new JsonPatchDocument<UserLoginPatchRequest>();
        if (request.AccountMobile != null)
        {
            patchDoc.Replace(e => e.AccountMobile, request.AccountMobile);
        }

        if (request.Scheduler || request.Scheduler == false)
        {
            patchDoc.Replace(e => e.Scheduler, request.Scheduler);
        }

        return client.PatchAsync<UserLoginResponse>(RouteHelper.UpdateUser + userId, patchDoc);
    }

    public static EntityWithStatus<UserLoginResponse> CreateUser(HttpClient client, UserLoginRequest request)
    {
        return client.PostAsync<UserLoginResponse>(RouteHelper.PostUser, request);
    }

    public static EntityWithStatus<InternalUserRoleResponse> CreateRoleGroup(HttpClient client, int userId, InternalUserRoleRequest request)
    {
        return client.PostAsync<InternalUserRoleResponse>(RouteHelper.PostRoleGroup + userId, request);
    }

    public static EntityWithStatus<UserResponse> GetUserInfo(HttpClient client)
    {
        return client.GetAsync<UserResponse>(RouteHelper.GetUserInfo);
    }

    public static EntityWithStatus<List<UserResponse>> GetInternalUsers(HttpClient client)
    {
        return client.GetAsync<List<UserResponse>>(RouteHelper.GetInternalUsers);
    }

    public static EntityWithStatus<UserResponse> UpdateInternalUserStatus(HttpClient client, int userId, PatchUserRequest request)
    {
        var patchDoc = new JsonPatchDocument<PatchUserRequest>();
        patchDoc.Replace(e => e.IsActive, request.IsActive);

        return client.PatchAsync<UserResponse>(RouteHelper.PatchInternalUserStatus + userId, patchDoc);
    }

    public static EntityWithStatus<SessionResponse> GetSessionInfo(HttpClient client)
    {
        return client.GetAsync<SessionResponse>(RouteHelper.GetSessionInfo);
    }

    public static EntityWithStatus<SessionResponse> ExtendSession(HttpClient client)
    {
        return client.PostAsync<SessionResponse>(RouteHelper.PostExtendSession);
    }

    public static EntityWithStatus<List<DisputeUserResponse>> GetDisputeUsers(HttpClient client, Guid disputeGuid)
    {
        return client.GetAsync<List<DisputeUserResponse>>(RouteHelper.GetDisputeUsers + disputeGuid);
    }
}