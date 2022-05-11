using System;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Services.EmailNotification.EmailNotificationService.Configuration;

public class EmailConfiguration
{
    public string Host { get; set; }

    public int Port { get; set; }

    public bool EnableSsl { get; set; }

    public int Timeout { get; set; }

    public string User { get; set; }

    public string Password { get; set; }

    public string FileStorageRoot { get; set; }

    public string CommonFileStorageRoot { get; set; }

    public static async Task<EmailConfiguration> GetConfiguration(IUnitOfWork unitOfWork)
    {
        var password = string.Empty;
        var user = await GetSettingAsync<string>(unitOfWork, SettingKeys.SmtpClientUsername);
        if (!string.IsNullOrWhiteSpace(user))
        {
            var encryptedPassword = await GetSettingAsync<string>(unitOfWork, SettingKeys.SmtpClientPassword);
            password = HashHelper.DecryptPassword(encryptedPassword, user);
        }

        var emailConfiguration = new EmailConfiguration
        {
            Host = await GetSettingAsync<string>(unitOfWork, SettingKeys.SmtpClientHost),
            Port = await GetSettingAsync<int>(unitOfWork, SettingKeys.SmtpClientPort),
            EnableSsl = await GetSettingAsync<bool>(unitOfWork, SettingKeys.SmtpClientEnableSsl),
            Timeout = await GetSettingAsync<int>(unitOfWork, SettingKeys.SmtpClientTimeout),
            User = user,
            Password = password,
            FileStorageRoot = await GetSettingAsync<string>(unitOfWork, SettingKeys.FileStorageRoot),
            CommonFileStorageRoot = await GetSettingAsync<string>(unitOfWork, SettingKeys.CommonFileStorageRoot)
        };

        return emailConfiguration;
    }

    private static async Task<T> GetSettingAsync<T>(IUnitOfWork unitOfWork, string key)
    {
        var setting = await unitOfWork.SystemSettingsRepository.GetSetting(key);
        return (T)Convert.ChangeType(setting.Value, typeof(T));
    }
}