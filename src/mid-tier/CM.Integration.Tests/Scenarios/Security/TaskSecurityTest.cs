using System.Net;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Fact]
    public void CheckTaskSecurity()
    {
        // LOGIN AS STAFF
        Client.Authenticate(Users.Admin, Users.Admin);

        var taskPostResponse = TaskManager.CreateTask(Client, Data.Dispute.DisputeGuid, new Business.Entities.Models.Task.TaskRequest());
        taskPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var taskPatchResponse = TaskManager.UpdateTask(Client, Data.Tasks[0].TaskId, new Business.Entities.Models.Task.TaskRequest());
        taskPatchResponse.CheckStatusCode();

        var taskDeleteResponse = TaskManager.DeleteTask(Client, Data.Tasks[0].TaskId);
        taskDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var taskGetResponse = TaskManager.GetTask(Client, Data.Tasks[5].TaskId);
        taskGetResponse.CheckStatusCode();

        var disputeTasksGetResponse = TaskManager.GetDisputeTasks(Client, Data.Dispute.DisputeGuid);
        disputeTasksGetResponse.CheckStatusCode();

        var taskOwnerId = Data.Tasks[5].TaskOwnerId;
        Assert.NotNull(taskOwnerId);

        var ownerTasksGetResponse = TaskManager.GetOwnerTasks(Client, taskOwnerId.Value);
        ownerTasksGetResponse.CheckStatusCode();

        var unassignedTasksGetResponse = TaskManager.GetUnassignedTasks(Client);
        unassignedTasksGetResponse.CheckStatusCode();

        // LOGIN AS EXTERNAL
        Client.Authenticate(Users.User, Users.User);

        taskPostResponse = TaskManager.CreateTask(Client, Data.Dispute.DisputeGuid, new Business.Entities.Models.Task.TaskRequest());
        taskPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        taskPatchResponse = TaskManager.UpdateTask(Client, Data.Tasks[2].TaskId, new Business.Entities.Models.Task.TaskRequest());
        taskPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        taskDeleteResponse = TaskManager.DeleteTask(Client, Data.Tasks[2].TaskId);
        taskDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        taskGetResponse = TaskManager.GetTask(Client, Data.Tasks[5].TaskId);
        taskGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeTasksGetResponse = TaskManager.GetDisputeTasks(Client, Data.Dispute.DisputeGuid);
        disputeTasksGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        ownerTasksGetResponse = TaskManager.GetOwnerTasks(Client, taskOwnerId.Value);
        ownerTasksGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        unassignedTasksGetResponse = TaskManager.GetUnassignedTasks(Client);
        unassignedTasksGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS UNAUTHORIZED EXTERNAL USER //
        Client.Authenticate(Users.User2, Users.User2);

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        taskPostResponse = TaskManager.CreateTask(Client, Data.Dispute.DisputeGuid, new Business.Entities.Models.Task.TaskRequest());
        taskPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        taskPatchResponse = TaskManager.UpdateTask(Client, Data.Tasks[3].TaskId, new Business.Entities.Models.Task.TaskRequest());
        taskPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        taskDeleteResponse = TaskManager.DeleteTask(Client, Data.Tasks[3].TaskId);
        taskDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        taskGetResponse = TaskManager.GetTask(Client, Data.Tasks[5].TaskId);
        taskGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeTasksGetResponse = TaskManager.GetDisputeTasks(Client, Data.Dispute.DisputeGuid);
        disputeTasksGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        ownerTasksGetResponse = TaskManager.GetOwnerTasks(Client, taskOwnerId.Value);
        ownerTasksGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        unassignedTasksGetResponse = TaskManager.GetUnassignedTasks(Client);
        unassignedTasksGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS OFFICE PAY
        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        taskPostResponse = TaskManager.CreateTask(Client, Data.Dispute.DisputeGuid, new Business.Entities.Models.Task.TaskRequest());
        taskPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        taskPatchResponse = TaskManager.UpdateTask(Client, Data.Tasks[4].TaskId, new Business.Entities.Models.Task.TaskRequest());
        taskPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        taskDeleteResponse = TaskManager.DeleteTask(Client, Data.Tasks[4].TaskId);
        taskDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        taskGetResponse = TaskManager.GetTask(Client, Data.Tasks[5].TaskId);
        taskGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeTasksGetResponse = TaskManager.GetDisputeTasks(Client, Data.Dispute.DisputeGuid);
        disputeTasksGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        ownerTasksGetResponse = TaskManager.GetOwnerTasks(Client, taskOwnerId.Value);
        ownerTasksGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        unassignedTasksGetResponse = TaskManager.GetUnassignedTasks(Client);
        unassignedTasksGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}