using System.Collections.Generic;
using System.Net.Http;
using CM.Business.Entities.Models.InternalUserProfile;
using CM.Business.Entities.Models.InternalUserRole;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers;

public static class InternalUserManager
{
    public static EntityWithStatus<InternalUserProfileResponse> CreateInternalUser(HttpClient client, int userId, InternalUserProfileRequest request)
    {
        return client.PostAsync<InternalUserProfileResponse>(RouteHelper.PostInternalUser + userId, request);
    }

    public static EntityWithStatus<InternalUserProfileResponse> UpdateInternalUser(HttpClient client, int userId, InternalUserProfileRequest request)
    {
        var patchDoc = new JsonPatchDocument<InternalUserProfileRequest>();
        if (request.ProfileDescription != null)
        {
            patchDoc.Replace(e => e.ProfileDescription, request.ProfileDescription);
        }

        return client.PatchAsync<InternalUserProfileResponse>(RouteHelper.PatchInternalUser + userId, patchDoc);
    }

    public static EntityWithStatus<List<InternalUserProfileResponse>> GetInternalUsers(HttpClient client)
    {
        return client.GetAsync<List<InternalUserProfileResponse>>(RouteHelper.GetInternalUsers);
    }

    public static EntityWithStatus<InternalUserRoleResponse> CreateInternalUserRole(HttpClient client, int userId, InternalUserRoleRequest request)
    {
        return client.PostAsync<InternalUserRoleResponse>(RouteHelper.PostInternalUserRole + userId, request);
    }

    public static EntityWithStatus<InternalUserRoleResponse> UpdateInternalUserRole(HttpClient client, int internalUserRoleId, InternalUserRoleRequest request)
    {
        var patchDoc = new JsonPatchDocument<InternalUserRoleRequest>();
        if (request.RoleSubtypeId != null)
        {
            patchDoc.Replace(e => e.RoleSubtypeId, request.RoleSubtypeId);
        }

        return client.PatchAsync<InternalUserRoleResponse>(RouteHelper.PatchInternalUserRole + internalUserRoleId, patchDoc);
    }
}