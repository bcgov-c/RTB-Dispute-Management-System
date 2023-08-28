using System;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Services.Base;
using CM.Business.Services.SystemSettingsService;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;
using EasyNetQ;
using Serilog;

namespace CM.Business.Services.EmailMessages;

public class RetryErrorSendEmailsService : CmServiceBase, IRetryErrorSendEmailsService
{
    public RetryErrorSendEmailsService(ISystemSettingsService systemSettingsService, IMapper mapper, IUnitOfWork unitOfWork, IBus bus)
        : base(unitOfWork, mapper)
    {
        Bus = bus;
        SystemSettingsService = systemSettingsService;
    }

    private IBus Bus { get; }

    private ISystemSettingsService SystemSettingsService { get; }

    public async Task<bool> Handle()
    {
        var emailErrorResentHoursAgo = await SystemSettingsService.GetValueAsync<int>(SettingKeys.EmailErrorResentHoursAgo);

        var emailMessages = await UnitOfWork.EmailMessageRepository.GetErrorEmails(emailErrorResentHoursAgo);
        foreach (var item in emailMessages)
        {
            try
            {
                var emailNotificationIntegrationEvent = await item.GenerateEmailNotificationIntegrationEvent(UnitOfWork);
                item.SendStatus = (byte)EmailStatus.Pending;
                await UnitOfWork.Complete();
                emailNotificationIntegrationEvent.Publish(Bus);
            }
            catch (Exception e)
            {
                Log.Error(e, "Error re-sending email");
            }
        }

        return true;
    }
}