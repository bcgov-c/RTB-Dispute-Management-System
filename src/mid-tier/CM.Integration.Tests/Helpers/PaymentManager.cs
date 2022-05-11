using System.Net.Http;
using CM.Business.Entities.Models.Payment;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers;

public static class PaymentManager
{
    public static EntityWithStatus<PaymentTransactionResponse> CreatePayment(HttpClient client, int disputeFeeId, PaymentTransactionRequest request)
    {
        return client.PostAsync<PaymentTransactionResponse>(RouteHelper.PostPaymentTransaction + disputeFeeId, request);
    }

    public static EntityWithStatus<PaymentTransactionResponse> UpdatePayment(HttpClient client, int transactionId, PaymentTransactionPatchRequest request)
    {
        var patchDoc = new JsonPatchDocument<PaymentTransactionPatchRequest>();
        if (request.PaymentNote != null)
        {
            patchDoc.Replace(e => e.PaymentNote, request.PaymentNote);
        }

        return client.PatchAsync<PaymentTransactionResponse>(RouteHelper.PatchPaymentTransaction + transactionId, patchDoc);
    }

    public static HttpResponseMessage DeletePayment(HttpClient client, int transactionId)
    {
        var response = client.DeleteAsync(RouteHelper.DeletePaymentTransaction + transactionId).Result;
        return response;
    }

    public static EntityWithStatus<PaymentTransactionResponse> CreatePaymentTransactionForExternalUpdate(HttpClient client, int disputeFeeId, PaymentTransactionRequest request)
    {
        return client.PostAsync<PaymentTransactionResponse>(RouteHelper.PostPaymentTransactionExternalUpdate + disputeFeeId, request);
    }

    public static EntityWithStatus<PaymentTransactionResponse> CheckPayment(HttpClient client, int transactionId)
    {
        return client.PostAsync<PaymentTransactionResponse>(RouteHelper.CheckPaymentTransaction + transactionId);
    }
}