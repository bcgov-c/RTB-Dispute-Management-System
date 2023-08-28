using System;
using System.Net;
using CM.Business.Entities.Models.HearingReporting;
using CM.Business.Entities.Models.InternalUserRole;
using CM.Business.Entities.Models.User;
using CM.Common.Utilities;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Fact]
    public void CheckHearingReportingSecurity()
    {
        // LOGIN AS STAFF
        Client.Authenticate(Users.Admin, Users.Admin);
        var userName = FakerInstance.Random.String2(30);

        var staff1UserRequest = new UserLoginRequest
        {
            Username = userName,
            Password = userName,
            SystemUserRoleId = (int)Roles.StaffUser,
            Scheduler = true,
            IsActive = true,
            AcceptsTextMessages = true,
            AdminAccess = false
        };

        var staffUser1 = UserManager.CreateUser(Client, staff1UserRequest);

        var staffUser1RoleRequest = new InternalUserRoleRequest
        {
            RoleGroupId = (byte)RoleGroup.Arbitrator,
            RoleSubtypeId = (byte)RoleSubType.Level1,
            IsActive = true
        };
        UserManager.CreateRoleGroup(Client, staffUser1.ResponseObject.SystemUserId, staffUser1RoleRequest);

        Client.Authenticate(staff1UserRequest.Username, staff1UserRequest.Password);

        var hReportingYearlyResponse = HearingReportingManager.GetYearlyHearings(Client, DateTime.Now.Year, new HearingReportingRequest());
        hReportingYearlyResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var hReportingMonthlyResponse = HearingReportingManager.GetMonthlyHearings(Client, DateTime.Now.Month, DateTime.Now.Year, new HearingReportingRequest());
        hReportingMonthlyResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var hReportingDailyResponse = HearingReportingManager.GetDailyHearings(Client, new DateTime(2050, 1, 5), new HearingReportingRequest());
        hReportingDailyResponse.CheckStatusCode();

        var ownerHearingsDetailGetResponse = HearingReportingManager.GetOwnerHearingsDetail(Client, Data.HearingUsers[0].SystemUserId, new OwnerHearingsDetailRequest());
        ownerHearingsDetailGetResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

        var availableHearingsGetResponse = HearingReportingManager.GetAvailableHearings(Client, new AvailableHearingsRequest());
        availableHearingsGetResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

        // LOGIN AS EXTERNAL
        Client.Authenticate(Users.User, Users.User);

        hReportingYearlyResponse = HearingReportingManager.GetYearlyHearings(Client, DateTime.Now.Year, new HearingReportingRequest());
        hReportingYearlyResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        hReportingMonthlyResponse = HearingReportingManager.GetMonthlyHearings(Client, DateTime.Now.Month, DateTime.Now.Year, new HearingReportingRequest());
        hReportingMonthlyResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        hReportingDailyResponse = HearingReportingManager.GetDailyHearings(Client, new DateTime(2050, 1, 5), new HearingReportingRequest());
        hReportingDailyResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        ownerHearingsDetailGetResponse = HearingReportingManager.GetOwnerHearingsDetail(Client, Data.HearingUsers[0].SystemUserId, new OwnerHearingsDetailRequest());
        ownerHearingsDetailGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        availableHearingsGetResponse = HearingReportingManager.GetAvailableHearings(Client, new AvailableHearingsRequest());
        availableHearingsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        hReportingYearlyResponse = HearingReportingManager.GetYearlyHearings(Client, DateTime.Now.Year, new HearingReportingRequest());
        hReportingYearlyResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        hReportingMonthlyResponse = HearingReportingManager.GetMonthlyHearings(Client, DateTime.Now.Month, DateTime.Now.Year, new HearingReportingRequest());
        hReportingMonthlyResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        hReportingDailyResponse = HearingReportingManager.GetDailyHearings(Client, new DateTime(2050, 1, 5), new HearingReportingRequest());
        hReportingDailyResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        ownerHearingsDetailGetResponse = HearingReportingManager.GetOwnerHearingsDetail(Client, Data.HearingUsers[0].SystemUserId, new OwnerHearingsDetailRequest());
        ownerHearingsDetailGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        availableHearingsGetResponse = HearingReportingManager.GetAvailableHearings(Client, new AvailableHearingsRequest());
        availableHearingsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS OFFICE PAY
        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        hReportingYearlyResponse = HearingReportingManager.GetYearlyHearings(Client, DateTime.Now.Year, new HearingReportingRequest());
        hReportingYearlyResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        hReportingMonthlyResponse = HearingReportingManager.GetMonthlyHearings(Client, DateTime.Now.Month, DateTime.Now.Year, new HearingReportingRequest());
        hReportingMonthlyResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        hReportingDailyResponse = HearingReportingManager.GetDailyHearings(Client, new DateTime(2050, 1, 5), new HearingReportingRequest());
        hReportingDailyResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        ownerHearingsDetailGetResponse = HearingReportingManager.GetOwnerHearingsDetail(Client, Data.HearingUsers[0].SystemUserId, new OwnerHearingsDetailRequest());
        ownerHearingsDetailGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        availableHearingsGetResponse = HearingReportingManager.GetAvailableHearings(Client, new AvailableHearingsRequest());
        availableHearingsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}