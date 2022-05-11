using System.Net;
using CM.Business.Entities.Models.SchedulePeriod;
using CM.Common.Utilities;
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
    public void CheckSchedulePeriodSecurity(string userName, string password, HttpStatusCode httpStatusCode)
    {
        Client.Authenticate(userName, password);

        var schedulePeriodPostResponse = SchedulePeriodManager.CreateSchedulePeriod(Client, new SchedulePeriodPostRequest { PeriodTimeZone = CmTimeZone.PacificTime });
        schedulePeriodPostResponse.ResponseMessage.StatusCode.Should().Be(httpStatusCode);

        var schedulePeriodPatchResponse = SchedulePeriodManager.UpdateSchedulePeriod(Client, Data.SchedulePeriods[0].SchedulePeriodId, new SchedulePeriodPatchRequest { PeriodStatus = PeriodStatus.OpenForEditing });
        schedulePeriodPatchResponse.ResponseMessage.StatusCode.Should().Be(httpStatusCode);

        var schedulePeriodGetResponse = SchedulePeriodManager.GetSchedulePeriod(Client, Data.SchedulePeriods[0].SchedulePeriodId);
        schedulePeriodGetResponse.ResponseMessage.StatusCode.Should().Be(httpStatusCode);

        var schedulePeriodFilterResponse = SchedulePeriodManager.GetSchedulePeriodByFilter(Client, new SchedulePeriodGetRequest { ContainsPeriodStatuses = new[] { 0, 1, 100, 101 } });
        schedulePeriodFilterResponse.ResponseMessage.StatusCode.Should().Be(httpStatusCode);
    }
}