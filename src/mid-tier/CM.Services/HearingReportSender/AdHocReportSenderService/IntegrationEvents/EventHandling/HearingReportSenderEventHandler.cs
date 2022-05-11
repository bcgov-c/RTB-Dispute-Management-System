using System;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using CM.Data.Repositories.UnitOfWork;
using CM.Messages.AdHocReport.Event;
using CM.Messages.Validation;
using CM.ServiceBase;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Configuration;
using CsvHelper;
using EasyNetQ.AutoSubscribe;
using MailKit;
using MailKit.Net.Smtp;
using MimeKit;
using Serilog;
using Task = System.Threading.Tasks.Task;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.IntegrationEvents.EventHandling
{
    public class AdHocReportSenderEventHandler : IConsumeAsync<AdHocReportIntegrationEvent>
    {
        private readonly IUnitOfWork _unitOfWork;

        private readonly ILogger _logger;

        public AdHocReportSenderEventHandler(IUnitOfWork unitOfWork, ILogger logger)
        {
            _logger = logger;
            _unitOfWork = unitOfWork;
        }

        [AutoSubscriberConsumer(SubscriptionId = "AdHocReportSender")]
        public async Task ConsumeAsync(AdHocReportIntegrationEvent message)
        {
            message.Validate();

            var log = _logger.ForContext("CorrelationGuid", message.CorrelationGuid);
            log.EventMessage("Hearing Report Integration Event Received", message);

            var configuration = SmtpConfiguration.GetConfiguration(_unitOfWork);
            var hearings = await GetArbitrationScheduleHearings();
            var issues = await GetArbitrationScheduleIssues();
            if (hearings == null || issues == null)
            {
                _logger.EventMessage("Hearing Report not generated", message);
                return;
            }

            var sent = await SendMail(hearings, issues, configuration);
            if (sent)
            {
                log.EventMessage("Hearing Report Integration Event Sent", message);
            }
        }

        private async Task<bool> SendMail(byte[] fileHearing, byte[] fileIssues, SmtpConfiguration smtpConfiguration)
        {
            using (var client = new SmtpClient())
            {
                try
                {
                    var mimeMessage = new MimeMessage();
                    mimeMessage.From.Add(new MailboxAddress(Constants.HearingDisasterRecoveryReportSubject, smtpConfiguration.SmtpClientFromEmail));
                    mimeMessage.To.Add(new MailboxAddress(smtpConfiguration.ArbScheduleEmailReportsTo));

                    mimeMessage.Subject = Constants.HearingDisasterRecoveryReportSubject;

                    var builder = new BodyBuilder { TextBody = Constants.HearingDisasterRecoveryReportBody, HtmlBody = Constants.HearingDisasterRecoveryReportBody };

                    var date = DateTime.Now.ToString("yyyy MMMM dd");
                    builder.Attachments.Add($"2WeekArbSchedule_Issues_{date}.xlsx", fileIssues);
                    builder.Attachments.Add($"2WeekArbSchedule_Hearings_{date}.xlsx", fileHearing);
                    mimeMessage.Body = builder.ToMessageBody();

                    client.ServerCertificateValidationCallback = (s, c, h, e) => true;

                    client.Timeout = smtpConfiguration.Timeout;

                    client.Connect(smtpConfiguration.Host, smtpConfiguration.Port);

                    if (!string.IsNullOrWhiteSpace(smtpConfiguration.User) && !string.IsNullOrWhiteSpace(smtpConfiguration.Password))
                    {
                        await client.AuthenticateAsync(smtpConfiguration.User, smtpConfiguration.Password);
                    }

                    await client.SendAsync(mimeMessage);

                    client.Disconnect(true);
                }
                catch (ServiceNotConnectedException serviceNotConnectedException)
                {
                    _logger.Error(serviceNotConnectedException.Message + Environment.NewLine + "Failed to deliver message to " + smtpConfiguration.ArbScheduleEmailReportsTo, serviceNotConnectedException);

                    throw;
                }
                catch (ProtocolException protocolException)
                {
                    _logger.Error(protocolException.Message + Environment.NewLine + "Failed to deliver message", protocolException);

                    throw;
                }
                catch (Exception exc)
                {
                    _logger.Error(exc.Message + Environment.NewLine + "Unknown error", exc);

                    throw;
                }
            }

            return true;
        }

        private async Task<byte[]> GetArbitrationScheduleHearings()
        {
            var arbitrationScheduleHearings = await _unitOfWork.HearingReportRepository.GetArbitrationScheduleHearings();
            if (!arbitrationScheduleHearings.Any())
            {
                return null;
            }

            var memoryStream = new MemoryStream();

            await using (var writer = new StreamWriter(memoryStream))
            {
                await using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);
                csv.WriteRecords(arbitrationScheduleHearings);
            }

            memoryStream.Flush();

            return memoryStream.ToArray();
        }

        private async Task<byte[]> GetArbitrationScheduleIssues()
        {
            var arbitrationScheduleIssues = await _unitOfWork.HearingReportRepository.GetArbitrationScheduleIssues();
            if (!arbitrationScheduleIssues.Any())
            {
                return null;
            }

            var memoryStream = new MemoryStream();

            await using (var writer = new StreamWriter(memoryStream))
            {
                await using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);
                csv.WriteRecords(arbitrationScheduleIssues);
            }

            memoryStream.Flush();

            return memoryStream.ToArray();
        }
    }
}
