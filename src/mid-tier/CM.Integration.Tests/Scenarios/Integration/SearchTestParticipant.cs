using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using CM.Business.Entities.Models.Dispute;
using CM.Business.Entities.Models.InternalUserRole;
using CM.Business.Entities.Models.Parties;
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
public class SearchTestParticipant : IntegrationTestBase, IAsyncLifetime
{
    public SearchTestParticipant(TestContext context, ITestOutputHelper testOutput)
        : base(context, testOutput)
    {
    }

    private UserLoginResponse ExternalUser { get; set; }

    private string Dispute1Participant4AccessCode { get; set; }

    private string Dispute2Participant1AccessCode { get; set; }

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
    public void SearchByParticipantCase1()
    {
        Client.Authenticate(Users.Admin, Users.Admin);
        var disputeInfoSearchRequest = new ParticipantSearchRequest
        {
            BusinessName = "Property"
        };

        var searchResult = SearchManager.SearchByParticipant(Client, disputeInfoSearchRequest, 10, 0);
        searchResult.CheckStatusCode();
        searchResult.ResponseObject.TotalAvailableRecords.Should().Be(1);
    }

    [Fact]
    public void SearchByParticipantCase2()
    {
        Client.Authenticate(Users.Admin, Users.Admin);
        var disputeInfoSearchRequest = new ParticipantSearchRequest
        {
            AllPhone = "444-444-4444"
        };

        var searchResult = SearchManager.SearchByParticipant(Client, disputeInfoSearchRequest, 10, 0);
        searchResult.CheckStatusCode();
        searchResult.ResponseObject.TotalAvailableRecords.Should().Be(1);
    }

    [Fact]
    public void SearchByParticipantCase3()
    {
        Client.Authenticate(Users.Admin, Users.Admin);
        var disputeInfoSearchRequest = new ParticipantSearchRequest
        {
            AllLastName = "Smith"
        };

        var searchResult = SearchManager.SearchByParticipant(Client, disputeInfoSearchRequest, 10, 0);
        searchResult.CheckStatusCode();
        searchResult.ResponseObject.TotalAvailableRecords.Should().Be(1);
    }

    [Fact]
    public void SearchByParticipantCase4()
    {
        Client.Authenticate(Users.Admin, Users.Admin);
        var disputeInfoSearchRequest = new ParticipantSearchRequest
        {
            AllFirstName = "ELIZAB"
        };

        var searchResult = SearchManager.SearchByParticipant(Client, disputeInfoSearchRequest, 10, 0);
        searchResult.CheckStatusCode();
        searchResult.ResponseObject.TotalAvailableRecords.Should().Be(0);
    }

    [Fact]
    public void SearchByParticipantCase5()
    {
        Client.Authenticate(Users.Admin, Users.Admin);
        var disputeInfoSearchRequest = new AccessCodeSearchRequest
        {
            AccessCode = Dispute1Participant4AccessCode
        };

        var searchResult = SearchManager.SearchByAccessCode(Client, disputeInfoSearchRequest);
        searchResult.CheckStatusCode(HttpStatusCode.NoContent);
    }

    [Fact]
    public void SearchByParticipantCase6()
    {
        Client.Authenticate(Users.Admin, Users.Admin);
        var disputeInfoSearchRequest = new AccessCodeSearchRequest
        {
            AccessCode = Dispute2Participant1AccessCode
        };

        var searchResult = SearchManager.SearchByAccessCode(Client, disputeInfoSearchRequest);
        searchResult.CheckStatusCode();
        searchResult.ResponseObject.TotalAvailableRecords.Should().Be(1);
    }

    [Fact]
    public void SearchByParticipantCase7()
    {
        Client.Authenticate(Users.Admin, Users.Admin);
        var disputeInfoSearchRequest = new ParticipantSearchRequest
        {
            AllPhone = "333-333-3333"
        };

        var searchResult = SearchManager.SearchByParticipant(Client, disputeInfoSearchRequest, 10, 0);
        searchResult.CheckStatusCode();
        searchResult.ResponseObject.TotalAvailableRecords.Should().Be(0);
    }

    [Fact]
    public void SearchByParticipantCase8()
    {
        Client.Authenticate(Users.Admin, Users.Admin);
        var disputeInfoSearchRequest = new ParticipantSearchRequest
        {
            Email = "jacksmithabc11111@yahoo.com"
        };

        var searchResult = SearchManager.SearchByParticipant(Client, disputeInfoSearchRequest, 10, 0);
        searchResult.CheckStatusCode();
        searchResult.ResponseObject.TotalAvailableRecords.Should().Be(1);
    }

    [Fact]
    public void SearchByParticipantCase9()
    {
        Client.Authenticate(Users.Admin, Users.Admin);
        var disputeInfoSearchRequest = new ParticipantSearchRequest
        {
            Email = "jacksmithabc11111@yahoo.com"
        };

        var searchResult = SearchManager.SearchByParticipant(Client, disputeInfoSearchRequest, 1, 0);
        searchResult.CheckStatusCode();
        searchResult.ResponseObject.TotalAvailableRecords.Should().Be(1);
    }

    private void SeedData()
    {
        Client.Authenticate(Users.Admin, Users.Admin);

        var staffUserName = FakerInstance.Random.String2(30);
        var externalUserName = FakerInstance.Random.String2(30);

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
            TenancyAddress = "111 Participant Search Street",
            TenancyZipPostal = "P1P 1P1"
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
            DisputeSubType = (byte)DisputeSubType.ApplicantIsLandlord,
            TenancyAddress = "222 Participant Search Street",
            TenancyZipPostal = "P2P 2P2"
        };
        var dispute2Response = DisputeManager.CreateDisputeWithData(Client, dispute2);

        var disputeStatusRequest2 = new DisputeStatusPostRequest
        {
            Stage = (byte)DisputeStage.ApplicationScreening,
            Status = (byte)DisputeStatuses.Received
        };
        var disputeStatusResponse2 = DisputeManager.CreateDisputeStatus(Client, dispute2Response.ResponseObject.DisputeGuid, disputeStatusRequest2);
        Debug.Assert(disputeStatusResponse2.ResponseMessage.IsSuccessStatusCode, "Expected success");

        SetupParticipantsGroupForDispute1(dispute1Response.ResponseObject.DisputeGuid);
        SetupParticipantsGroupForDispute2(dispute2Response.ResponseObject.DisputeGuid);
    }

    private void SetupParticipantsGroupForDispute1(Guid disputeGuid)
    {
        var participantRequest1 = new List<ParticipantRequest>
        {
            new()
            {
                ParticipantType = (byte)ParticipantType.Business,
                ParticipantStatus = (byte)ParticipantStatus.ValidatedAndParticipating,
                BusinessName = "ABC Property Management",
                BusinessContactFirstName = "Jack",
                BusinessContactLastName = "Smith",
                Address = "01-01 Business",
                City = "Victoria",
                ProvinceState = "BC",
                PostalZip = "P1P 1P1",
                PrimaryPhone = "111-111-1111",
                SecondaryPhone = "111-222-2222",
                Email = "jacksmithabc11111@yahoo.com"
            }
        };
        var participantRequest2 = new List<ParticipantRequest>
        {
            new()
            {
                ParticipantType = (byte)ParticipantType.AgentOrLawyer,
                ParticipantStatus = (byte)ParticipantStatus.ValidatedAndParticipating,
                FirstName = "Stephen",
                LastName = "Neal",
                Address = "01-02 Agent",
                City = "Agent City",
                ProvinceState = "BC",
                PostalZip = "P1P 1P1",
                PrimaryPhone = "222-222-2222",
                Email = "stephen01_02@yahoo.com"
            }
        };
        var participantRequest3 = new List<ParticipantRequest>
        {
            new()
            {
                ParticipantType = (byte)ParticipantType.Individual,
                ParticipantStatus = (byte)ParticipantStatus.ValidatedAndParticipating,
                FirstName = "Elizabeth",
                LastName = "Bryan",
                Address = "01-03 Individual",
                City = "Individual City",
                ProvinceState = "BC",
                PostalZip = "P1P 1P1",
                Fax = "333-333-3333"
            }
        };
        var participantRequest4 = new List<ParticipantRequest>
        {
            new()
            {
                ParticipantType = (byte)ParticipantType.Individual,
                ParticipantStatus = (byte)ParticipantStatus.ValidatedAndParticipating,
                FirstName = "Joanne",
                LastName = "Smith",
                Address = "01-04 Individual",
                City = "Individual City",
                ProvinceState = "BC",
                PostalZip = "P1P 1P1",
                SecondaryPhone = "444-444-4444"
            }
        };

        var participantResponse1 = ParticipantManager.CreateParticipant(Client, disputeGuid, participantRequest1);
        var participantResponse2 = ParticipantManager.CreateParticipant(Client, disputeGuid, participantRequest2);
        var participantResponse3 = ParticipantManager.CreateParticipant(Client, disputeGuid, participantRequest3);
        var participantResponse4 = ParticipantManager.CreateParticipant(Client, disputeGuid, participantRequest4);

        var claimGroupResponse = ClaimManager.CreateClaimGroup(Client, disputeGuid);
        var claimGroupId = claimGroupResponse.ResponseObject.ClaimGroupId;

        var singleParty1 = participantResponse1.ResponseObject.FirstOrDefault();
        Debug.Assert(singleParty1 != null, nameof(singleParty1) + " != null");
        var singleParty2 = participantResponse2.ResponseObject.FirstOrDefault();
        Debug.Assert(singleParty2 != null, nameof(singleParty1) + " != null");
        var singleParty3 = participantResponse3.ResponseObject.FirstOrDefault();
        Debug.Assert(singleParty3 != null, nameof(singleParty1) + " != null");
        var singleParty4 = participantResponse4.ResponseObject.FirstOrDefault();
        Debug.Assert(singleParty4 != null, nameof(singleParty1) + " != null");
        var claimGroupParticipantRequest1 = new List<ClaimGroupParticipantRequest>
        {
            new()
            {
                ParticipantId = singleParty1.ParticipantId,
                GroupParticipantRole = (byte)ParticipantRole.Applicant,
                GroupPrimaryContactId = singleParty1.ParticipantId
            }
        };
        var claimGroupParticipantRequest2 = new List<ClaimGroupParticipantRequest>
        {
            new()
            {
                ParticipantId = singleParty2.ParticipantId,
                GroupParticipantRole = (byte)ParticipantRole.Applicant,
                GroupPrimaryContactId = singleParty2.ParticipantId
            }
        };
        var claimGroupParticipantRequest3 = new List<ClaimGroupParticipantRequest>
        {
            new()
            {
                ParticipantId = singleParty3.ParticipantId,
                GroupParticipantRole = (byte)ParticipantRole.Respondent,
                GroupPrimaryContactId = singleParty3.ParticipantId
            }
        };
        var claimGroupParticipantRequest4 = new List<ClaimGroupParticipantRequest>
        {
            new()
            {
                ParticipantId = singleParty4.ParticipantId,
                GroupParticipantRole = (byte)ParticipantRole.Respondent,
                GroupPrimaryContactId = singleParty4.ParticipantId
            }
        };

        var claimGroupParticipantResponse1 = ClaimManager.CreateClaimGroupParticipant(Client, claimGroupId, claimGroupParticipantRequest1);
        Debug.Assert(claimGroupParticipantResponse1.ResponseMessage.IsSuccessStatusCode, "Expected success");
        var claimGroupParticipantResponse2 = ClaimManager.CreateClaimGroupParticipant(Client, claimGroupId, claimGroupParticipantRequest2);
        Debug.Assert(claimGroupParticipantResponse2.ResponseMessage.IsSuccessStatusCode, "Expected success");
        var claimGroupParticipantResponse3 = ClaimManager.CreateClaimGroupParticipant(Client, claimGroupId, claimGroupParticipantRequest3);
        Debug.Assert(claimGroupParticipantResponse3.ResponseMessage.IsSuccessStatusCode, "Expected success");
        var claimGroupParticipantResponse4 = ClaimManager.CreateClaimGroupParticipant(Client, claimGroupId, claimGroupParticipantRequest4);
        Debug.Assert(claimGroupParticipantResponse4.ResponseMessage.IsSuccessStatusCode, "Expected success");

        Dispute1Participant4AccessCode = singleParty4.AccessCode;
        var singleClaimGroupParticipant = claimGroupParticipantResponse4.ResponseObject.FirstOrDefault();
        Debug.Assert(singleClaimGroupParticipant != null, nameof(singleClaimGroupParticipant) + " != null");
        var result = ClaimManager.DeleteClaimGroupParticipant(Client, singleClaimGroupParticipant.ClaimGroupParticipantId);
        Debug.Assert(result.IsSuccessStatusCode, "Expected success");
        var result1 = ParticipantManager.DeleteParticipant(Client, singleParty4.ParticipantId);
        Debug.Assert(result1.IsSuccessStatusCode, "Expected success");
    }

    private void SetupParticipantsGroupForDispute2(Guid disputeGuid)
    {
        var participantRequest1 = new List<ParticipantRequest>
        {
            new()
            {
                ParticipantType = (byte)ParticipantType.Individual,
                ParticipantStatus = (byte)ParticipantStatus.ValidatedAndParticipating,
                FirstName = "Joanne",
                LastName = "Wilson",
                Address = "02-01 Individual",
                City = "Individual City",
                ProvinceState = "BC",
                PostalZip = "P1P 1P1",
                SecondaryPhone = "444-444-4444"
            }
        };
        var participantRequest2 = new List<ParticipantRequest>
        {
            new()
            {
                ParticipantType = (byte)ParticipantType.Business,
                ParticipantStatus = (byte)ParticipantStatus.ValidatedAndParticipating,
                BusinessName = "ABC Property Management",
                BusinessContactFirstName = "Jack",
                BusinessContactLastName = "Smith",
                Address = "02-01 Business",
                City = "Victoria",
                ProvinceState = "BC",
                PostalZip = "P1P 1P1",
                PrimaryPhone = "111-111-1111",
                SecondaryPhone = "111-222-2222",
                Email = "jacksmithabc11111@yahoo.com"
            }
        };

        var participantResponse1 = ParticipantManager.CreateParticipant(Client, disputeGuid, participantRequest1);
        var participantResponse2 = ParticipantManager.CreateParticipant(Client, disputeGuid, participantRequest2);
        var singleParty1 = participantResponse1.ResponseObject.FirstOrDefault();
        Debug.Assert(singleParty1 != null, nameof(singleParty1) + " != null");
        var singleParty2 = participantResponse2.ResponseObject.FirstOrDefault();
        Debug.Assert(singleParty2 != null, nameof(singleParty1) + " != null");
        Dispute2Participant1AccessCode = singleParty1.AccessCode;
        var claimGroupResponse = ClaimManager.CreateClaimGroup(Client, disputeGuid);
        var claimGroupId = claimGroupResponse.ResponseObject.ClaimGroupId;

        var claimGroupParticipantRequest1 = new List<ClaimGroupParticipantRequest>
        {
            new()
            {
                ParticipantId = singleParty1.ParticipantId,
                GroupParticipantRole = (byte)ParticipantRole.Respondent,
                GroupPrimaryContactId = singleParty2.ParticipantId
            }
        };
        var claimGroupParticipantRequest2 = new List<ClaimGroupParticipantRequest>
        {
            new()
            {
                ParticipantId = singleParty2.ParticipantId,
                GroupParticipantRole = (byte)ParticipantRole.Applicant,
                GroupPrimaryContactId = singleParty2.ParticipantId
            }
        };

        var claimGroupParticipantResponse1 = ClaimManager.CreateClaimGroupParticipant(Client, claimGroupId, claimGroupParticipantRequest1);
        Debug.Assert(claimGroupParticipantResponse1.ResponseMessage.IsSuccessStatusCode, "Expected success");
        var claimGroupParticipantResponse2 = ClaimManager.CreateClaimGroupParticipant(Client, claimGroupId, claimGroupParticipantRequest2);
        Debug.Assert(claimGroupParticipantResponse2.ResponseMessage.IsSuccessStatusCode, "Expected success");
    }
}