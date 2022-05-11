using System.Threading.Tasks;
using CM.Services.EmailNotification.EmailNotificationService.Configuration;
using MailKit;
using MailKit.Net.Smtp;
using MimeKit;
using Serilog;

namespace CM.Services.EmailNotification.EmailNotificationService.Utils;

public static class EmailSmtp
{
    public static async Task SendSmtpAsync(MimeMessage mimeMessage, EmailConfiguration emailConfiguration, ILogger logger)
    {
        try
        {
            using var client = new SmtpClient();

            client.ServerCertificateValidationCallback = (_, _, _, _) => true;

            client.Timeout = emailConfiguration.Timeout;

            await client.ConnectAsync(emailConfiguration.Host, emailConfiguration.Port);

            if (!string.IsNullOrWhiteSpace(emailConfiguration.User) &&
                !string.IsNullOrWhiteSpace(emailConfiguration.Password))
            {
                await client.AuthenticateAsync(emailConfiguration.User, emailConfiguration.Password);
            }

            await client.SendAsync(mimeMessage);

            await client.DisconnectAsync(true);
        }
        catch (ServiceNotConnectedException serviceNotConnectedException)
        {
            logger.Error(serviceNotConnectedException, "Failed to deliver message to {Cc}", mimeMessage.Cc );
            throw;
        }
        catch (ProtocolException protocolException)
        {
            logger.Error(protocolException, "Failed to deliver message");
            throw;
        }
    }
}