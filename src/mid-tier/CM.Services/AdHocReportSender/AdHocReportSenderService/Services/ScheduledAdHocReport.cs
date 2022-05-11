using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Entities;
using CM.Services.AdHocReportSender.AdHocReportSenderService.EntityFramework;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Models;
using CsvHelper;
using MailKit.Net.Smtp;
using MimeKit;
using Serilog;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Services;

public class ScheduledAdHocReport : IScheduledAdHocReport
{
    private readonly AdHocReportContext _adHocReportContext;
    private readonly ILogger _logger;
    private readonly RtbDmsContext _rtbDmsContext;

    public ScheduledAdHocReport(AdHocReportContext adHocReportContext, RtbDmsContext rtbDmsContext, ILogger logger)
    {
        _logger = logger;
        _rtbDmsContext = rtbDmsContext;
        _adHocReportContext = adHocReportContext;
    }

    public async Task RunAdHocReport(AdHocReport adHocReport)
    {
        if (string.IsNullOrWhiteSpace(adHocReport.EmailTo))
        {
            _logger.Warning("EmailTo should not be empty");
            return;
        }

        var adHocReportAttachments = await _adHocReportContext.AdHocReportAttachments
            .Where(x => x.AdHocReportId == adHocReport.AdHocReportId && x.IsActive)
            .ToListAsync();

        if (adHocReportAttachments.Any())
        {
            var emailConfiguration = await EmailConfiguration.GetConfiguration(_rtbDmsContext);

            var attachmentsSet = new Dictionary<string, byte[]>();

            foreach (var item in adHocReportAttachments)
            {
                var caption = GetAdHocReportName(item);
                var report = await GetAdHocReport(item);

                if (report != null)
                {
                    attachmentsSet.Add(caption, report);
                }
            }

            if (attachmentsSet.Any())
            {
                var success = await SendMail(adHocReport, attachmentsSet, emailConfiguration);
                await TrackEmailActivity(adHocReport, success);
                return;
            }
        }

        await TrackEmailActivity(adHocReport, AdHocReportStatus.Idle);
    }

    private string GetAdHocReportName(AdHocReportAttachment adHocReportAttachment)
    {
        return _rtbDmsContext.ScalarFromSql(adHocReportAttachment.QueryForName, null);
    }

    private async Task<byte[]> GetAdHocReport(AdHocReportAttachment adHocReportAttachment)
    {
        var items = _rtbDmsContext.CollectionFromSql(adHocReportAttachment.QueryForAttachment, null).ToList();

        if (!items.Any())
        {
            return null;
        }

        var memoryStream = new MemoryStream();

        await using (var writer = new StreamWriter(memoryStream))
        {
            await using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);
            await csv.WriteRecordsAsync(items);
        }

        memoryStream.Flush();

        return memoryStream.ToArray();
    }

    private async Task<AdHocReportStatus> SendMail(AdHocReport adHocReport, Dictionary<string, byte[]> attachments, EmailConfiguration smtpConfiguration)
    {
        using var client = new SmtpClient();

        try
        {
            var mimeMessage = new MimeMessage();
            mimeMessage.From.Add(new MailboxAddress(adHocReport.EmailSubject, adHocReport.EmailFrom));
            mimeMessage.To.Add(MailboxAddress.Parse(adHocReport.EmailTo));

            mimeMessage.Subject = adHocReport.EmailSubject;

            var builder = new BodyBuilder { HtmlBody = adHocReport.EmailBody };

            foreach (var(key, value) in attachments)
            {
                builder.Attachments.Add(key, value);
            }

            mimeMessage.Body = builder.ToMessageBody();

            client.ServerCertificateValidationCallback = (_, _, _, _) => true;

            client.Timeout = smtpConfiguration.Timeout;

            await client.ConnectAsync(smtpConfiguration.Host, smtpConfiguration.Port);

            if (!string.IsNullOrWhiteSpace(smtpConfiguration.User) && !string.IsNullOrWhiteSpace(smtpConfiguration.Password))
            {
                await client.AuthenticateAsync(smtpConfiguration.User, smtpConfiguration.Password);
            }

            await client.SendAsync(mimeMessage);

            await client.DisconnectAsync(true);
        }
        catch (Exception exc)
        {
            _logger.Error(exc, "SMTP Exception");

            return AdHocReportStatus.Failed;
        }

        return AdHocReportStatus.Sent;
    }

    private async Task TrackEmailActivity(AdHocReport adHocReport, AdHocReportStatus adHocReportStatus)
    {
        var adHocReportTracking = new AdHocReportTracking
        {
            AdHocReportId = adHocReport.AdHocReportId,
            SentDate = DateTime.UtcNow,
            Status = adHocReportStatus
        };

        _adHocReportContext.AdHocReportsTracking.Add(adHocReportTracking);
        await _adHocReportContext.SaveChangesAsync();
    }
}