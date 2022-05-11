using System;
using System.Collections.Generic;
using System.Net;
using CM.Business.Entities.Models.Dispute;
using CM.Business.Entities.Models.Parties;
using CM.Business.Entities.Models.SubmissionReceipt;
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
    public void GetSubmissionReceipt()
    {
        Client.Authenticate(Users.Admin, Users.Admin);

        var staff1UserRequest = new UserLoginRequest
        {
            Username = "staff_sr",
            Password = "staff_sr",
            SystemUserRoleId = (int)Roles.StaffUser,
            Scheduler = true,
            IsActive = true,
            AcceptsTextMessages = true,
            AdminAccess = false
        };

        var staffUser1 = UserManager.CreateUser(Client, staff1UserRequest);
        staffUser1.CheckStatusCode();

        Client.Authenticate(staff1UserRequest.Username, staff1UserRequest.Password);

        var disputeRequest = new DisputeRequest
        {
            OwnerSystemUserId = staffUser1.ResponseObject.SystemUserId,
            DisputeType = (byte)DisputeType.Rta,
            DisputeSubType = (byte)DisputeSubType.ApplicantIsLandlord,
            DisputeUrgency = (byte)DisputeUrgency.Regular,
            TenancyAddress = "3350 IntSched01 St",
            TenancyCity = "IntSched01",
            TenancyZipPostal = "T1T 1T1",
            TenancyGeozoneId = 3
        };
        var disputeResponse = DisputeManager.CreateDisputeWithData(Client, disputeRequest);
        disputeResponse.CheckStatusCode();

        var participant1Request = new ParticipantRequest
        {
            ParticipantType = (byte)ParticipantType.Business,
            ParticipantStatus = (byte)ParticipantStatus.ValidatedAndParticipating,
            FirstName = "IntSched01",
            LastName = "Participant01",
            Address = "P01 Street",
            City = "P01 City",
            ProvinceState = "BC",
            PostalZip = "P1P 1P1",
            Country = "Canada",
            AcceptedTou = true
        };

        var partyRequest = new List<ParticipantRequest> { participant1Request };
        var participantResponse = ParticipantManager.CreateParticipant(Client, disputeResponse.ResponseObject.DisputeGuid, partyRequest);
        participantResponse.CheckStatusCode();

        var submissionReceiptPostRequestFalse = new SubmissionReceiptPostRequest
        {
            ParticipantId = participantResponse.ResponseObject[0].ParticipantId,
            ReceiptBody = "SubmissionReceipt Body",
            ReceiptTitle = "ABCD",
            ReceiptDate = DateTime.UtcNow,
            ReceiptEmailed = true,
            ReceiptPrinted = false,
            ReceiptSubType = 2,
            ReceiptType = 1
        };

        var submissionReceiptPostResponse = SubmissionReceiptManager.CreateSubmissionReceipt(Client, disputeResponse.ResponseObject.DisputeGuid, submissionReceiptPostRequestFalse);
        submissionReceiptPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        submissionReceiptPostRequestFalse = new SubmissionReceiptPostRequest
        {
            ParticipantId = participantResponse.ResponseObject[0].ParticipantId,
            ReceiptBody = "SubmissionReceipt Body SubmissionReceipt Body SubmissionReceipt Body SubmissionReceipt Body SubmissionReceipt Body SubmissionReceipt Body",
            ReceiptTitle = "AB",
            ReceiptDate = DateTime.UtcNow,
            ReceiptEmailed = true,
            ReceiptPrinted = false,
            ReceiptSubType = 2,
            ReceiptType = 1
        };

        submissionReceiptPostResponse = SubmissionReceiptManager.CreateSubmissionReceipt(Client, disputeResponse.ResponseObject.DisputeGuid, submissionReceiptPostRequestFalse);
        submissionReceiptPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var submissionReceiptPostRequest = new SubmissionReceiptPostRequest
        {
            ParticipantId = participantResponse.ResponseObject[0].ParticipantId,
            ReceiptBody = "SubmissionReceipt Body SubmissionReceipt Body SubmissionReceipt Body SubmissionReceipt Body SubmissionReceipt Body SubmissionReceipt Body",
            ReceiptTitle = "ABCD",
            ReceiptDate = DateTime.UtcNow,
            ReceiptEmailed = true,
            ReceiptPrinted = false,
            ReceiptSubType = 2,
            ReceiptType = 1
        };

        submissionReceiptPostResponse = SubmissionReceiptManager.CreateSubmissionReceipt(Client, disputeResponse.ResponseObject.DisputeGuid, submissionReceiptPostRequest);
        submissionReceiptPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

        var submissionReceiptPostRequest1 = new SubmissionReceiptPostRequest
        {
            ParticipantId = participantResponse.ResponseObject[0].ParticipantId,
            ReceiptBody = "SubmissionReceipt Body1 SubmissionReceipt Body SubmissionReceipt Body SubmissionReceipt Body SubmissionReceipt Body SubmissionReceipt Body",
            ReceiptTitle = "ABCD1",
            ReceiptDate = DateTime.UtcNow,
            ReceiptEmailed = true,
            ReceiptPrinted = false,
            ReceiptSubType = 2,
            ReceiptType = 1
        };

        var submissionReceiptPostResponse1 = SubmissionReceiptManager.CreateSubmissionReceipt(Client, disputeResponse.ResponseObject.DisputeGuid, submissionReceiptPostRequest1);
        submissionReceiptPostResponse1.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

        var submissionReceiptPatchResponse = SubmissionReceiptManager.UpdateSubmissionReceipt(Client, submissionReceiptPostResponse1.ResponseObject.SubmissionReceiptId, new SubmissionReceiptPatchRequest { ReceiptPrinted = true });
        submissionReceiptPatchResponse.ResponseObject.ReceiptPrinted.Should().Be(true);

        var submissionReceiptGetResponse = SubmissionReceiptManager.GetSubmissionReceipt(Client, submissionReceiptPostResponse1.ResponseObject.SubmissionReceiptId);
        submissionReceiptGetResponse.ResponseObject.ReceiptTitle.Should().Be("ABCD1");

        var submissionReceiptsGetResponse = SubmissionReceiptManager.GetSubmissionReceipts(Client, disputeResponse.ResponseObject.DisputeGuid);
        submissionReceiptsGetResponse.ResponseObject.Count.Should().Be(2);

        var submissionReceiptDeleteResponse = SubmissionReceiptManager.DeleteSubmissionReceipt(Client, submissionReceiptPostResponse1.ResponseObject.SubmissionReceiptId);
        submissionReceiptDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        submissionReceiptsGetResponse = SubmissionReceiptManager.GetSubmissionReceipts(Client, disputeResponse.ResponseObject.DisputeGuid);
        submissionReceiptsGetResponse.ResponseObject.Count.Should().Be(1);
    }
}