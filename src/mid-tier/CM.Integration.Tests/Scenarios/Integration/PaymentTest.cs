using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using CM.Business.Entities.Models.Dispute;
using CM.Business.Entities.Models.Parties;
using CM.Business.Entities.Models.Payment;
using CM.Common.Utilities;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Infrastructure;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Integration;

public partial class IntegrationTests
{
    [Fact(Skip = "Not being build on server for some reason")]
    public void TestPayment()
    {
        var dispute = SetupDispute(1);
        var applicant = SetupApplicant(dispute);
        var singleApplicant = applicant.ResponseObject.FirstOrDefault();
        Debug.Assert(singleApplicant != null, nameof(singleApplicant) + " != null");
        var payorId = singleApplicant.ParticipantId;
        var disputeFee = SetupDisputeFee(dispute.ResponseObject.DisputeGuid, payorId);
        var disputeFeeId = disputeFee.ResponseObject.DisputeFeeId;

        var paymentTransactionRequest1 = new PaymentTransactionRequest
        {
            TransactionMethod = (byte)PaymentMethod.Office,
            TransactionBy = payorId,
            PaymentStatus = (byte)PaymentStatus.ApprovedOrPaid,
            TransactionAmount = 100
        };

        var paymentTransactionResponse1 = PaymentManager.CreatePayment(Client, disputeFeeId, paymentTransactionRequest1);
        paymentTransactionResponse1.CheckStatusCode();
        var disputeFeeResponse1 = DisputeFeeManager.GetDisputeFee(Client, paymentTransactionResponse1.ResponseObject.DisputeFeeId);
        disputeFeeResponse1.ResponseObject.IsPaid.Should().Be(true);

        var paymentTransactionRequest2 = new PaymentTransactionRequest
        {
            TransactionMethod = (byte)PaymentMethod.Office,
            TransactionBy = payorId,
            PaymentStatus = (byte)PaymentStatus.Pending,
            TransactionAmount = 100
        };

        var paymentTransactionResponse2 = PaymentManager.CreatePayment(Client, disputeFeeId, paymentTransactionRequest2);
        paymentTransactionResponse2.CheckStatusCode();
        var disputeFeeResponse2 = DisputeFeeManager.GetDisputeFee(Client, paymentTransactionResponse2.ResponseObject.DisputeFeeId);
        disputeFeeResponse2.ResponseObject.IsPaid.Should().Be(false);
    }

    [Fact(Skip = "Not being build on server for some reason")]
    public void TestExternalUpdatePayment()
    {
        var dispute = SetupDispute(1);
        var applicant = SetupApplicant(dispute);
        var singleApplicant = applicant.ResponseObject.FirstOrDefault();
        Debug.Assert(singleApplicant != null, nameof(singleApplicant) + " != null");
        var payorId = singleApplicant.ParticipantId;
        var disputeFee = SetupDisputeFee(dispute.ResponseObject.DisputeGuid, payorId);
        var disputeFeeId = disputeFee.ResponseObject.DisputeFeeId;

        Client.Authenticate(Users.Admin, Users.Admin);

        var paymentTransactionRequest1 = new PaymentTransactionRequest
        {
            TransactionMethod = (byte)PaymentMethod.Office,
            TransactionBy = payorId,
            PaymentStatus = (byte)PaymentStatus.ApprovedOrPaid,
            TransactionAmount = 100
        };

        var paymentTransactionResponse1 = PaymentManager.CreatePaymentTransactionForExternalUpdate(Client, disputeFeeId, paymentTransactionRequest1);
        paymentTransactionResponse1.CheckStatusCode();
        var disputeFeeResponse1 = DisputeFeeManager.GetDisputeFee(Client, paymentTransactionResponse1.ResponseObject.DisputeFeeId);
        disputeFeeResponse1.ResponseObject.IsPaid.Should().Be(true);
    }

    private EntityWithStatus<DisputeResponse> SetupDispute(int userId)
    {
        Client.Authenticate("Email_User", "Email_User");

        var dispute = new DisputeRequest
        {
            OwnerSystemUserId = userId,
            DisputeSubType = (byte)DisputeSubType.ApplicantIsLandlord,
            DisputeType = (byte)DisputeType.Rta,
            TenancyAddress = "main street",
            TenancyGeozoneId = 6
        };

        var disputeResponse = DisputeManager.CreateDisputeWithData(Client, dispute);
        disputeResponse.CheckStatusCode();
        return disputeResponse;
    }

    private EntityWithStatus<DisputeFeeResponse> SetupDisputeFee(Guid disputeGuid, int payorId)
    {
        var disputeFeeRequest = new DisputeFeeRequest
        {
            PayorId = payorId,
            IsActive = true,
            FeeType = (byte)DisputeFeeType.Intake,
            AmountDue = 100,
            FeeDescription = "Description"
        };

        var disputeFeeResponse = DisputeFeeManager.CreateDisputeFee(Client, disputeGuid, disputeFeeRequest);
        disputeFeeResponse.CheckStatusCode();
        return disputeFeeResponse;
    }

    private EntityWithStatus<List<ParticipantResponse>> SetupApplicant(EntityWithStatus<DisputeResponse> disputeResponse)
    {
        var participantRequest = new ParticipantRequest
        {
            ParticipantType = (byte)ParticipantType.Business,
            ParticipantStatus = (byte)ParticipantStatus.ValidatedAndParticipating,
            FirstName = "John",
            LastName = "Doe",
            Address = "Applicant Street",
            City = "Applicant City",
            ProvinceState = "BC",
            PostalZip = "P1P 1P1",
            Country = "Canada",
            AcceptedTou = true,
            Email = "rtb.dms.test@gmail.com"
        };

        var partyRequest = new List<ParticipantRequest> { participantRequest };
        var participant = ParticipantManager.CreateParticipant(Client, disputeResponse.ResponseObject.DisputeGuid, partyRequest);
        participant.CheckStatusCode();

        return participant;
    }
}