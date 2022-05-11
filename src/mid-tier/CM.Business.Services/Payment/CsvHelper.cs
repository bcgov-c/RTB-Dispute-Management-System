using System;
using System.Collections.Generic;
using System.Linq;
using CM.Business.Entities.Models.Payment;

namespace CM.Business.Services.Payment;

public class CsvHelper
{
    public static BamboraTransaction GetTransactionFromResponse(string response)
    {
        var responseParameters = response.Split("&");
        var parametersDictionary = new Dictionary<string, string>();

        foreach (var responseParameter in responseParameters)
        {
            var paramPair = responseParameter.Split("=");
            parametersDictionary.Add(paramPair.FirstOrDefault() ?? throw new InvalidOperationException(), paramPair.LastOrDefault());
        }

        var transaction = new BamboraTransaction
        {
            TrnId = parametersDictionary["trnId"],
            TrnApproved = parametersDictionary["trnApproved"] == "1",
            TrnAuthCode = parametersDictionary["authCode"],
            TrnDateTime = parametersDictionary["trnDate"],
            ReceiptDate = parametersDictionary["trnDate"],
            TrnCardType = parametersDictionary["cardType"],
            TrnType = parametersDictionary["trnType"],
            TrnAmount = parametersDictionary["trnAmount"],
            TrnOrderNumber = parametersDictionary["trnOrderNumber"],
            TrnMessageId = parametersDictionary["messageId"],
            TrnMessageText = parametersDictionary["messageText"]
        };

        transaction = FormatDates(transaction);
        transaction = FormatTransactionAmount(transaction);
        return transaction;
    }

    private static BamboraTransaction FormatDates(BamboraTransaction transaction)
    {
        try
        {
            var transactionDate = transaction.TrnDateTime;

            transactionDate = transactionDate.Replace("%2F", "/");
            transactionDate = transactionDate.Replace("+", " ");
            transactionDate = transactionDate.Replace("%3A", ":");
            var regularDate = DateTime.Parse(transactionDate);

            transaction.ProcessedDate = regularDate;
            return transaction;
        }
        catch (Exception e)
        {
            throw new Exception(e.Message);
        }
    }

    private static BamboraTransaction FormatTransactionAmount(BamboraTransaction transaction)
    {
        var transactionAmount = transaction.TrnAmount;
        transactionAmount = transactionAmount.Replace("%2E", ".");
        transaction.RegularAmount = decimal.Parse(transactionAmount);
        return transaction;
    }
}