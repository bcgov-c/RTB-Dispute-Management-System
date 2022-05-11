using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;
using CM.Business.Entities.Models.Dispute;
using CM.Business.Entities.Models.InternalUserRole;
using CM.Business.Entities.Models.Search;
using CM.Business.Entities.Models.User;
using CM.Common.Utilities;
using CM.Integration.Tests.Fixtures;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Infrastructure;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Npgsql;
using Xunit;
using Xunit.Abstractions;

namespace CM.Integration.Tests.Scenarios.Integration;

[Collection("Fixture")]
public class SearchTestDisputeInfo : IntegrationTestBase, IAsyncLifetime
{
    public SearchTestDisputeInfo(TestContext context, ITestOutputHelper testOutput)
        : base(context, testOutput)
    {
    }

    private UserLoginResponse ExternalUser { get; set; }

    public Task InitializeAsync()
    {
        using (var conn = new NpgsqlConnection(ConnectionString))
        {
            conn.Open();
            Checkpoint.Reset(conn).Wait();
        }

        SeedData();

        return Task.CompletedTask;
    }

    public Task DisposeAsync()
    {
        Thread.Sleep(1000);

        return Task.CompletedTask;
    }

    [Fact]
    public void SearchByDisputeInfo1()
    {
        Client.Authenticate(Users.Admin, Users.Admin);
        var disputeInfoSearchRequest = new DisputeInfoSearchRequest
        {
            TenancyZipPostal = "V8T"
        };

        var searchResult = SearchManager.SearchByDisputeInfo(Client, disputeInfoSearchRequest, 10, 0);
        searchResult.CheckStatusCode();
        searchResult.ResponseObject.TotalAvailableRecords.Should().Be(1);
    }

    [Fact]
    public void SearchByDisputeInfo2()
    {
        Client.Authenticate(Users.Admin, Users.Admin);
        var disputeInfoSearchRequest = new DisputeInfoSearchRequest
        {
            TenancyAddress = "#100 999",
            IncludeNotActive = true
        };

        var searchResult = SearchManager.SearchByDisputeInfo(Client, disputeInfoSearchRequest, 10, 0);
        searchResult.CheckStatusCode();
        searchResult.ResponseObject.TotalAvailableRecords.Should().Be(2);
    }

    [Fact]
    public void SearchByDisputeInfo3()
    {
        Client.Authenticate(Users.Admin, Users.Admin);
        var disputeInfoSearchRequest = new DisputeInfoSearchRequest
        {
            TenancyZipPostal = "#100 999 Douglas",
            IncludeNotActive = false
        };

        var searchResult = SearchManager.SearchByDisputeInfo(Client, disputeInfoSearchRequest, 10, 0);
        searchResult.CheckStatusCode();
        searchResult.ResponseObject.TotalAvailableRecords.Should().Be(0);
    }

    [Fact]
    public void SearchByDisputeInfo4()
    {
        Client.Authenticate(Users.Admin, Users.Admin);
        var disputeInfoSearchRequest = new DisputeInfoSearchRequest
        {
            IncludeNotActive = false
        };

        var searchResult = SearchManager.SearchByDisputeInfo(Client, disputeInfoSearchRequest, 10, 0);
        searchResult.CheckStatusCode();
        searchResult.ResponseObject.TotalAvailableRecords.Should().Be(1);
    }

    [Fact]
    public void SearchByDisputeInfo5()
    {
        Client.Authenticate(Users.Admin, Users.Admin);
        var disputeInfoSearchRequest = new DisputeInfoSearchRequest
        {
            IncludeNotActive = true
        };

        var searchResult = SearchManager.SearchByDisputeInfo(Client, disputeInfoSearchRequest, 10, 0);
        searchResult.CheckStatusCode();
        searchResult.ResponseObject.TotalAvailableRecords.Should().Be(3);
    }

    [Fact]
    public void SearchByDisputeInfo8()
    {
        Client.Authenticate(Users.Admin, Users.Admin);
        var disputeInfoSearchRequest = new DisputeInfoSearchRequest
        {
            IncludeNotActive = true,
            SortDirection = SortDir.Desc
        };

        var searchResult = SearchManager.SearchByDisputeInfo(Client, disputeInfoSearchRequest, 10, 0);
        searchResult.CheckStatusCode();
        searchResult.ResponseObject.TotalAvailableRecords.Should().Be(3);
    }

    private void SeedData()
    {
        Client.Authenticate(Users.Admin, Users.Admin);

        var staffUserName = FakerInstance.Random.String2(30);
        var staffUserRequest = new UserLoginRequest
        {
            Username = staffUserName,
            Password = staffUserName,
            SystemUserRoleId = (int)Roles.StaffUser,
            Scheduler = true,
            IsActive = true,
            AcceptsTextMessages = true,
            AdminAccess = false
        };

        var staffUser = UserManager.CreateUser(Client, staffUserRequest);
        staffUser.CheckStatusCode();

        var staffUserRoleRequest = new InternalUserRoleRequest
        {
            RoleGroupId = (byte)RoleGroup.Arbitrator,
            RoleSubtypeId = (byte)RoleSubType.Level1,
            IsActive = true
        };

        var staffUserRole = UserManager.CreateRoleGroup(Client, staffUser.ResponseObject.SystemUserId, staffUserRoleRequest);
        staffUserRole.CheckStatusCode();

        var externalUserName = FakerInstance.Random.String2(30);
        var externalUserRequest = new UserLoginRequest
        {
            Username = externalUserName,
            Password = externalUserName,
            SystemUserRoleId = (int)Roles.ExternalUser,
            Scheduler = false,
            IsActive = true,
            AcceptsTextMessages = true,
            AdminAccess = false
        };

        var externalUser = UserManager.CreateUser(Client, externalUserRequest);
        externalUser.CheckStatusCode();

        ExternalUser = externalUser.ResponseObject;

        Client.Authenticate(ExternalUser.Username, ExternalUser.Username);

        SetupDisputes();
    }

    private void SetupDisputes()
    {
        var dispute1 = new DisputeRequest
        {
            OwnerSystemUserId = ExternalUser.SystemUserId,
            DisputeType = (byte)DisputeType.Rta,
            DisputeSubType = (byte)DisputeSubType.ApplicantIsTenant,
            TenancyAddress = "#100 999 Fort Street",
            TenancyZipPostal = "V8T 2B5"
        };
        var dispute1Response = DisputeManager.CreateDisputeWithData(Client, dispute1);

        var disputeStatusRequest1 = new DisputeStatusPostRequest
        {
            Stage = (byte)DisputeStage.ApplicationInProgress,
            Status = (byte)DisputeStatuses.OfficePaymentRequired
        };
        var disputeStatusResponse1 = DisputeManager.CreateDisputeStatus(Client, dispute1Response.ResponseObject.DisputeGuid, disputeStatusRequest1);
        Debug.Assert(disputeStatusResponse1.ResponseMessage.IsSuccessStatusCode, "Expected success");
        var dispute2 = new DisputeRequest
        {
            OwnerSystemUserId = ExternalUser.SystemUserId,
            DisputeType = (byte)DisputeType.Rta,
            DisputeSubType = (byte)DisputeSubType.ApplicantIsTenant,
            TenancyAddress = "#100 999 Douglas Ave",
            TenancyZipPostal = "V8T 4G8"
        };
        var dispute2Response = DisputeManager.CreateDisputeWithData(Client, dispute2);

        var disputeStatusRequest2 = new DisputeStatusPostRequest
        {
            Stage = (byte)DisputeStage.ApplicationScreening,
            Status = (byte)DisputeStatuses.Received
        };
        var disputeStatusResponse2 = DisputeManager.CreateDisputeStatus(Client, dispute2Response.ResponseObject.DisputeGuid, disputeStatusRequest2);
        Debug.Assert(disputeStatusResponse2.ResponseMessage.IsSuccessStatusCode, "Expected success");
        var dispute3 = new DisputeRequest
        {
            OwnerSystemUserId = ExternalUser.SystemUserId,
            DisputeType = (byte)DisputeType.Mhpta,
            DisputeSubType = (byte)DisputeSubType.ApplicantIsLandlord,
            TenancyAddress = "#101 999 Douglas Ave",
            TenancyZipPostal = "V8B 4G8"
        };
        var dispute3Response = DisputeManager.CreateDisputeWithData(Client, dispute3);

        var disputeStatusRequest3 = new DisputeStatusPostRequest
        {
            Stage = (byte)DisputeStage.ApplicationInProgress,
            Status = (byte)DisputeStatuses.Deleted
        };
        var disputeStatusResponse3 = DisputeManager.CreateDisputeStatus(Client, dispute3Response.ResponseObject.DisputeGuid, disputeStatusRequest3);
        Debug.Assert(disputeStatusResponse3.ResponseMessage.IsSuccessStatusCode, "Expected success");
    }
}