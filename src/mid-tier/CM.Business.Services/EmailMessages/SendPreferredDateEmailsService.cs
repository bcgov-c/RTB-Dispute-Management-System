using System;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Services.Base;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;
using EasyNetQ;
using Log = Serilog.Log;

namespace CM.Business.Services.EmailMessages;

public class SendPreferredDateEmailsService : CmServiceBase, ISendPreferredDateEmailsService
{
    public SendPreferredDateEmailsService(IMapper mapper, IUnitOfWork unitOfWork, IBus bus)
        : base(unitOfWork, mapper)
    {
        Bus = bus;
    }

    private IBus Bus { get; }

    public async Task<bool> Handle()
    {
        var emailMessages = await UnitOfWork.EmailMessageRepository.GetUnsentEmails();
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