using System.Net;
using CM.Business.Entities.Models.Payment;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Fact]
    public void CheckPaymentSecurity()
    {
        // LOGIN AS STAFF
        Client.Authenticate(Users.Admin, Users.Admin);

        var paymentPostResponse = PaymentManager.CreatePayment(Client, Data.DisputeFees[0].DisputeFeeId, new PaymentTransactionRequest());
        paymentPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var paymentPatchResponse = PaymentManager.UpdatePayment(Client, Data.PaymentTransactions[0].PaymentTransactionId, new PaymentTransactionPatchRequest());
        paymentPatchResponse.CheckStatusCode();

        var paymentDeleteResponse = PaymentManager.DeletePayment(Client, Data.PaymentTransactions[1].PaymentTransactionId);
        paymentDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var paymentCheckResponse = PaymentManager.CheckPayment(Client, Data.PaymentTransactions[0].PaymentTransactionId);
        paymentCheckResponse.CheckStatusCode();

        // LOGIN AS EXTERNAL
        Client.Authenticate(Users.User, Users.User);

        paymentPostResponse = PaymentManager.CreatePayment(Client, Data.DisputeFees[0].DisputeFeeId, new PaymentTransactionRequest());
        paymentPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        paymentPatchResponse = PaymentManager.UpdatePayment(Client, Data.PaymentTransactions[0].PaymentTransactionId, new PaymentTransactionPatchRequest());
        paymentPatchResponse.CheckStatusCode();

        paymentDeleteResponse = PaymentManager.DeletePayment(Client, Data.PaymentTransactions[2].PaymentTransactionId);
        paymentDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        paymentCheckResponse = PaymentManager.CheckPayment(Client, Data.PaymentTransactions[0].PaymentTransactionId);
        paymentCheckResponse.CheckStatusCode();

        // LOGIN AS UNAUTHORIZED EXTERNAL USER //
        Client.Authenticate(Users.User2, Users.User2);

        paymentPostResponse = PaymentManager.CreatePayment(Client, Data.DisputeFees[0].DisputeFeeId, new PaymentTransactionRequest());
        paymentPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        paymentPatchResponse = PaymentManager.UpdatePayment(Client, Data.PaymentTransactions[0].PaymentTransactionId, new PaymentTransactionPatchRequest());
        paymentPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        paymentCheckResponse = PaymentManager.CheckPayment(Client, Data.PaymentTransactions[0].PaymentTransactionId);
        paymentCheckResponse.CheckStatusCode();

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        paymentPostResponse = PaymentManager.CreatePayment(Client, Data.DisputeFees[0].DisputeFeeId, new PaymentTransactionRequest());
        paymentPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        paymentPatchResponse = PaymentManager.UpdatePayment(Client, Data.PaymentTransactions[0].PaymentTransactionId, new PaymentTransactionPatchRequest());
        paymentPatchResponse.CheckStatusCode();

        paymentDeleteResponse = PaymentManager.DeletePayment(Client, Data.PaymentTransactions[2].PaymentTransactionId);
        paymentDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        paymentCheckResponse = PaymentManager.CheckPayment(Client, Data.PaymentTransactions[0].PaymentTransactionId);
        paymentCheckResponse.CheckStatusCode();

        // LOGIN AS OFFICE PAY
        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        paymentPostResponse = PaymentManager.CreatePayment(Client, Data.DisputeFees[0].DisputeFeeId, new PaymentTransactionRequest());
        paymentPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        paymentPatchResponse = PaymentManager.UpdatePayment(Client, Data.PaymentTransactions[0].PaymentTransactionId, new PaymentTransactionPatchRequest());
        paymentPatchResponse.CheckStatusCode();

        paymentDeleteResponse = PaymentManager.DeletePayment(Client, Data.PaymentTransactions[2].PaymentTransactionId);
        paymentDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        paymentCheckResponse = PaymentManager.CheckPayment(Client, Data.PaymentTransactions[0].PaymentTransactionId);
        paymentCheckResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}