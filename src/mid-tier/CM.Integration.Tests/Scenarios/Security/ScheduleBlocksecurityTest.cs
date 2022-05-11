using System;
using System.Net;
using CM.Business.Entities.Models.ScheduleBlock;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Theory]
    [InlineData(Users.Admin, Users.Admin, HttpStatusCode.OK)]
    [InlineData(Users.User, Users.User, HttpStatusCode.Unauthorized)]
    [InlineData(Users.User2, Users.User2, HttpStatusCode.Unauthorized)]
    [InlineData(Users.RemoteOffice, Users.RemoteOffice, HttpStatusCode.Unauthorized)]
    public void CheckScheduleBlockSecurity(string userName, string password, HttpStatusCode httpStatusCode)
    {
        Client.Authenticate(userName, password);

        var time1 = TimeSpan.Parse("06:00");
        var startTime = DateTime.UtcNow.AddDays(1);
        startTime = startTime.Date.AddDays(1) + time1;

        var scheduleBlockPostResponse = ScheduleBlockManager.CreateScheduleBlock(Client, Data.SchedulePeriods[0].SchedulePeriodId, new ScheduleBlockPostRequest { BlockStart = startTime, BlockEnd = startTime.AddHours(2), SystemUserId = 1, BlockDescription = "Block Desc Test" });
        scheduleBlockPostResponse.ResponseMessage.StatusCode.Should().Be(httpStatusCode);

        var scheduleBlockPatchResponse = ScheduleBlockManager.UpdateScheduleBlock(Client, Data.ScheduleBlocks[0].ScheduleBlockId, new ScheduleBlockPatchRequest { BlockNote = "ASDF" });
        scheduleBlockPatchResponse.ResponseMessage.StatusCode.Should().Be(httpStatusCode);

        var scheduleBlockGetResponse = ScheduleBlockManager.GetScheduleBlock(Client, Data.ScheduleBlocks[4].ScheduleBlockId);
        scheduleBlockGetResponse.ResponseMessage.StatusCode.Should().Be(httpStatusCode);

        var scheduleBlockPeriodResponse = ScheduleBlockManager.GetSchedulePeriodByPeriod(Client, Data.SchedulePeriods[2].SchedulePeriodId);
        scheduleBlockPeriodResponse.ResponseMessage.StatusCode.Should().Be(httpStatusCode);

        var after = DateTime.Now.AddYears(-5);
        var before = DateTime.Now.AddYears(5);
        var scheduleBlockDateRangeResponse = ScheduleBlockManager.GetSchedulePeriodByDateRange(Client, new ScheduleBlockGetByDateRangeRequest { BlockStartingAfter = after, BlockStartingBefore = before });
        scheduleBlockDateRangeResponse.ResponseMessage.StatusCode.Should().Be(httpStatusCode);

        var scheduleBlockDeleteResponse = ScheduleBlockManager.DeleteBlock(Client, Data.ScheduleBlocks[5].ScheduleBlockId);
        scheduleBlockDeleteResponse.StatusCode.Should().Be(httpStatusCode);
    }
}