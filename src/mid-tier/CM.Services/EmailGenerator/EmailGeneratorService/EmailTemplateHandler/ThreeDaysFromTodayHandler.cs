using System;
using System.Text;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using CM.Services.EmailGenerator.EmailGeneratorService.Tags;

namespace CM.Services.EmailGenerator.EmailGeneratorService.EmailTemplateHandler;

public class ThreeDaysFromTodayHandler : AbstractEmailMessageHandler
{
    public ThreeDaysFromTodayHandler(IUnitOfWork unitOfWork)
        : base(unitOfWork)
    {
    }

    public override async Task<StringBuilder> Handle(StringBuilder htmlBody, Dispute dispute, Participant participant)
    {
        htmlBody = htmlBody.Replace(TagDictionary.GetTag(Tag.ThreeFromToday), DateTime.Now.Date.AddDays(3).ToPstDateTime());
        return await base.Handle(htmlBody, dispute, participant);
    }
}