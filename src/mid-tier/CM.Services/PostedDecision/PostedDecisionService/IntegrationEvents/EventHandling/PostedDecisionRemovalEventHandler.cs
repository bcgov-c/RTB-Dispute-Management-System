using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CM.Messages.PostedDecision.Events;
using CM.Messages.Validation;
using CM.ServiceBase;
using EasyNetQ.AutoSubscribe;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace CM.Services.PostedDecision.PostedDecisionDataService.IntegrationEvents.EventHandling;

public class PostedDecisionRemovalEventHandler : IConsumeAsync<PostedDecisionRemovalEvent>
{
    private readonly PostedDecisionContext _context;

    private readonly ILogger _logger;

    public PostedDecisionRemovalEventHandler(PostedDecisionContext context, ILogger logger)
    {
        _context = context;
        _logger = logger;
    }

    [AutoSubscriberConsumer(SubscriptionId = "PostedDecisionService")]
    public async Task ConsumeAsync(PostedDecisionRemovalEvent message, CancellationToken cancellationToken = default)
    {
        message.Validate();
        var log = _logger.ForContext("CorrelationGuid", message.CorrelationGuid);
        log.EventMessage("Posted Decision Removal Event Received", message);

        var postedDecisionsToRemove = await _context.PostedDecisions
            .Include(p => p.PostedDecisionOutcomes)
            .Where(p => p.DecisionFileId == message.OutcomeDocFileId)
            .ToListAsync(cancellationToken);

        foreach (var postedDecision in postedDecisionsToRemove)
        {
            postedDecision.IsDeleted = true;
            foreach (var postedDecisionOutcome in postedDecision.PostedDecisionOutcomes)
            {
                postedDecisionOutcome.IsDeleted = true;
                _context.PostedDecisionOutcomes.Attach(postedDecisionOutcome);
                _context.Entry(postedDecisionOutcome).State = EntityState.Modified;
            }

            _context.PostedDecisions.Attach(postedDecision);
            _context.Entry(postedDecision).State = EntityState.Modified;
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}