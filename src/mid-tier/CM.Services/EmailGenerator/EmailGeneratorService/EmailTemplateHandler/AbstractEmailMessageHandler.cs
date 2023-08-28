using System;
using System.Text;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Services.EmailGenerator.EmailGeneratorService.EmailTemplateHandler;

public abstract class AbstractEmailMessageHandler : IHandler
{
    private IHandler _nextHandler;

    protected AbstractEmailMessageHandler(IUnitOfWork unitOfWork, int assignedTemplateId)
    {
        UnitOfWork = unitOfWork;
        AssignedTemplateId = assignedTemplateId;
    }

    protected AbstractEmailMessageHandler(IUnitOfWork unitOfWork)
    {
        UnitOfWork = unitOfWork;
    }

    protected IUnitOfWork UnitOfWork { get; }

    protected int AssignedTemplateId { get; }

    public IHandler SetNext(IHandler handler)
    {
        _nextHandler = handler;
        return handler;
    }

    public virtual async Task<StringBuilder> Handle(StringBuilder htmlBody, Dispute dispute, Participant participant)
    {
        if (_nextHandler != null)
        {
            return await _nextHandler.Handle(htmlBody, dispute, participant);
        }

        return htmlBody;
    }
}