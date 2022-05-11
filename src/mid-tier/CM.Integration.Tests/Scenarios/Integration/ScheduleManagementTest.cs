using System;
using System.Net;
using CM.Business.Entities.Models.ScheduleBlock;
using CM.Business.Entities.Models.SchedulePeriod;
using CM.Business.Entities.Models.ScheduleRequest;
using CM.Business.Entities.Models.User;
using CM.Common.Utilities;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Integration;

public partial class IntegrationTests
{
    [Fact]
    public void CheckPeriods()
    {
        Client.Authenticate(Users.Admin, Users.Admin);

        var schedulePeriodPostResponse1 = SchedulePeriodManager.CreateSchedulePeriod(Client, new SchedulePeriodPostRequest { PeriodTimeZone = CmTimeZone.PacificTime });
        schedulePeriodPostResponse1.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

        var schedulePeriodPostResponse2 = SchedulePeriodManager.CreateSchedulePeriod(Client, new SchedulePeriodPostRequest { PeriodTimeZone = CmTimeZone.PacificTime });
        schedulePeriodPostResponse2.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

        var schedulePeriodPatchResponse1 = SchedulePeriodManager.UpdateSchedulePeriod(Client, schedulePeriodPostResponse1.ResponseObject.SchedulePeriodId, new SchedulePeriodPatchRequest { PeriodStatus = PeriodStatus.OpenForEditing });
        schedulePeriodPatchResponse1.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);
        schedulePeriodPatchResponse1.ResponseObject.PeriodStatus.Should().Be(PeriodStatus.OpenForEditing);

        var schedulePeriodGetResponse1 = SchedulePeriodManager.GetSchedulePeriod(Client, schedulePeriodPostResponse1.ResponseObject.SchedulePeriodId);
        schedulePeriodGetResponse1.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);
        schedulePeriodGetResponse1.ResponseObject.PeriodStatus.Should().Be(PeriodStatus.OpenForEditing);

        // Schedule Blocks part
        var time1 = TimeSpan.Parse("06:00");
        var startTime = DateTime.UtcNow.AddDays(1);
        startTime = startTime.Date.AddDays(1) + time1;

        var adminForBlocks = UserManager.CreateUser(Client, new UserLoginRequest { AcceptsTextMessages = true, IsActive = true, AdminAccess = true, Username = "blockAdmin", Password = "blockAdmin-123456", Scheduler = true, SystemUserRoleId = 1 });

        var scheduleBlockPostResponse1 = ScheduleBlockManager.CreateScheduleBlock(Client, schedulePeriodPatchResponse1.ResponseObject.SchedulePeriodId, new ScheduleBlockPostRequest { BlockStart = startTime, BlockEnd = startTime.AddHours(2), SystemUserId = adminForBlocks.ResponseObject.SystemUserId, BlockDescription = "Block Desc Test 1" });
        scheduleBlockPostResponse1.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);
        var scheduleBlockPostResponse2 = ScheduleBlockManager.CreateScheduleBlock(Client, schedulePeriodPostResponse1.ResponseObject.SchedulePeriodId, new ScheduleBlockPostRequest { BlockStart = startTime.AddHours(3), BlockEnd = startTime.AddHours(5), SystemUserId = 1, BlockDescription = "Block Desc Test 2" });
        scheduleBlockPostResponse2.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

        var scheduleBlockPatchResponse = ScheduleBlockManager.UpdateScheduleBlock(Client, scheduleBlockPostResponse1.ResponseObject.ScheduleBlockId, new ScheduleBlockPatchRequest { BlockNote = "ASDF" });
        scheduleBlockPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

        var scheduleBlockGetResponse = ScheduleBlockManager.GetScheduleBlock(Client, scheduleBlockPostResponse1.ResponseObject.ScheduleBlockId);
        scheduleBlockGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

        var scheduleBlockPeriodResponse = ScheduleBlockManager.GetSchedulePeriodByPeriod(Client, schedulePeriodPostResponse1.ResponseObject.SchedulePeriodId);
        scheduleBlockPeriodResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);
        scheduleBlockPeriodResponse.ResponseObject.ScheduleBlocks.Count.Should().Be(2);

        var after = DateTime.Now.AddYears(-5);
        var before = DateTime.Now.AddYears(5);
        var scheduleBlockDateRangeResponse = ScheduleBlockManager.GetSchedulePeriodByDateRange(Client, new ScheduleBlockGetByDateRangeRequest { BlockStartingAfter = after, BlockStartingBefore = before });
        scheduleBlockDateRangeResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);
        scheduleBlockDateRangeResponse.ResponseObject.ScheduleBlocks.Count.Should().Be(2);

        var scheduleBlockDeleteResponse = ScheduleBlockManager.DeleteBlock(Client, scheduleBlockPostResponse1.ResponseObject.ScheduleBlockId);
        scheduleBlockDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        scheduleBlockPeriodResponse = ScheduleBlockManager.GetSchedulePeriodByPeriod(Client, schedulePeriodPostResponse1.ResponseObject.SchedulePeriodId);
        scheduleBlockPeriodResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);
        scheduleBlockPeriodResponse.ResponseObject.ScheduleBlocks.Count.Should().Be(1);

        // Schedule Request
        var scheduleRequestPostResponse1 = ScheduleRequestManager.CreateScheduleRequest(Client, new ScheduleRequestPostRequest { RequestStart = DateTime.UtcNow.AddMinutes(5), RequestEnd = DateTime.UtcNow.AddHours(2), RequestDescription = "Desc Test", RequestSubmitter = 1, RequestType = 1 });
        scheduleRequestPostResponse1.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);
        var scheduleRequestPostResponse2 = ScheduleRequestManager.CreateScheduleRequest(Client, new ScheduleRequestPostRequest { RequestStart = DateTime.UtcNow.AddMinutes(5), RequestEnd = DateTime.UtcNow.AddHours(2), RequestDescription = "Desc Test", RequestSubmitter = 1, RequestType = 1 });
        scheduleRequestPostResponse2.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

        var scheduleRequestPatchResponse = ScheduleRequestManager.UpdateScheduleRequest(Client, scheduleRequestPostResponse1.ResponseObject.ScheduleRequestId, new ScheduleRequestPatchRequest { RequestNote = "Test Note" });
        scheduleRequestPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

        var scheduleRequestGetResponse = ScheduleRequestManager.GetScheduleRequest(Client, scheduleRequestPostResponse1.ResponseObject.ScheduleRequestId);
        scheduleRequestGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

        var scheduleRequestResponse = ScheduleRequestManager.GetScheduleRequests(Client, new ScheduleRequestsGetRequest { RequestType = new[] { 1 } });
        scheduleRequestResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);
        scheduleRequestResponse.ResponseObject.ScheduleRequests.Count.Should().Be(2);

        var scheduleRequestDeleteResponse = ScheduleRequestManager.DeleteRequest(Client, scheduleRequestPostResponse1.ResponseObject.ScheduleRequestId);
        scheduleRequestDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        scheduleRequestResponse = ScheduleRequestManager.GetScheduleRequests(Client, new ScheduleRequestsGetRequest { RequestType = new[] { 1 } });
        scheduleRequestResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);
        scheduleRequestResponse.ResponseObject.ScheduleRequests.Count.Should().Be(1);
    }
}