using System;
using System.Net.Http;
using CM.Business.Entities.Models.Task;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers;

public static class TaskManager
{
    public static EntityWithStatus<TaskResponse> CreateTask(HttpClient client, Guid disputeGuid, TaskRequest request)
    {
        return client.PostAsync<TaskResponse>(RouteHelper.PostTask + disputeGuid, request);
    }

    public static EntityWithStatus<TaskResponse> UpdateTask(HttpClient client, int taskId, TaskRequest request)
    {
        var patchDoc = new JsonPatchDocument<TaskRequest>();
        if (request.TaskStatus != null)
        {
            patchDoc.Replace(e => e.TaskStatus, request.TaskStatus);
        }

        return client.PatchAsync<TaskResponse>(RouteHelper.PatchTask + taskId, patchDoc);
    }

    public static HttpResponseMessage DeleteTask(HttpClient client, int taskId)
    {
        var response = client.DeleteAsync(RouteHelper.DeleteTask + taskId).Result;
        return response;
    }

    public static EntityWithStatus<TaskResponse> GetTask(HttpClient client, int taskId)
    {
        return client.GetAsync<TaskResponse>(RouteHelper.GetTask + taskId);
    }

    public static EntityWithStatus<TaskFullResponse> GetDisputeTasks(HttpClient client, Guid disputeGuid)
    {
        return client.GetAsync<TaskFullResponse>(RouteHelper.GetDisputeTasks + disputeGuid);
    }

    public static EntityWithStatus<TaskFullResponse> GetOwnerTasks(HttpClient client, int taskOwnerId)
    {
        return client.GetAsync<TaskFullResponse>(RouteHelper.GetOwnerTasks + taskOwnerId);
    }

    public static EntityWithStatus<TaskFullResponse> GetUnassignedTasks(HttpClient client)
    {
        return client.GetAsync<TaskFullResponse>(RouteHelper.GetUnassignedTasks);
    }
}