using System;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Services.AdHocReportSender.AdHocReportSenderService.ExternalContexts;
using Microsoft.EntityFrameworkCore;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Entities;

public class EmailConfiguration
{
    public string Host { get; set; }

    public int Port { get; set; }

    public bool EnableSsl { get; set; }

    public int Timeout { get; set; }

    public string User { get; set; }

    public string Password { get; set; }

    public static async Task<EmailConfiguration> GetConfiguration(RtbDmsContext rtbDmsContext)
    {
        var password = string.Empty;
        var user = await GetSettingAsync<string>(rtbDmsContext, SettingKeys.SmtpClientUsername);

        if (!string.IsNullOrWhiteSpace(user))
        {
            var encryptedPassword = await GetSettingAsync<string>(rtbDmsContext, SettingKeys.SmtpClientPassword);
            password = HashHelper.DecryptPassword(encryptedPassword, user);
        }

        var emailConfiguration = new EmailConfiguration
        {
            Host = await GetSettingAsync<string>(rtbDmsContext, SettingKeys.SmtpClientHost),
            Port = await GetSettingAsync<int>(rtbDmsContext, SettingKeys.SmtpClientPort),
            EnableSsl = await GetSettingAsync<bool>(rtbDmsContext, SettingKeys.SmtpClientEnableSsl),
            Timeout = await GetSettingAsync<int>(rtbDmsContext, SettingKeys.SmtpClientTimeout),
            User = user,
            Password = password
        };

        return emailConfiguration;
    }

    private static async Task<T> GetSettingAsync<T>(RtbDmsContext rtbDmsContext, string key)
    {
        var setting = await rtbDmsContext.SystemSettings.FirstOrDefaultAsync(x => x.Key == key);
        return (T)Convert.ChangeType(setting?.Value, typeof(T));
    }
}