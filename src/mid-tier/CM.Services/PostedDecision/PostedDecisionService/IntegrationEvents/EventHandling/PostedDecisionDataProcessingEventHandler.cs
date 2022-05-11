using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using CM.Messages.PostedDecision.Events;
using CM.Messages.Validation;
using CM.ServiceBase;
using CM.Services.PostedDecision.PostedDecisionDataService.Entities;
using CM.Services.PostedDecision.PostedDecisionDataService.Models;
using EasyNetQ.AutoSubscribe;
using Microsoft.EntityFrameworkCore;
using Nest;
using Serilog;

namespace CM.Services.PostedDecision.PostedDecisionDataService.IntegrationEvents.EventHandling;

public class PostedDecisionDataProcessingEventHandler : IConsumeAsync<PostedDecisionDataProcessingEvent>
{
    private readonly PostedDecisionContext _context;

    private readonly ElasticClient _elasticClient;

    private readonly ILogger _logger;

    private readonly IMapper _mapper;

    public PostedDecisionDataProcessingEventHandler(PostedDecisionContext context, IMapper mapper, ElasticClient elasticClient, ILogger logger)
    {
        _context = context;
        _mapper = mapper;
        _elasticClient = elasticClient;
        _logger = logger;
    }

    [AutoSubscriberConsumer(SubscriptionId = "PostedDecisionService")]
    public async Task ConsumeAsync(PostedDecisionDataProcessingEvent message, CancellationToken cancellationToken = default)
    {
        message.Validate();
        var log = _logger.ForContext("CorrelationGuid", message.CorrelationGuid);
        log.EventMessage("Posted Decision Data Processing Event Received", message);

        var oldPostedDecisions = await _context.PostedDecisions
            .Include(p => p.PostedDecisionOutcomes)
            .Where(p => p.DisputeId == message.DisputeId && p.IsDeleted == false)
            .ToListAsync(cancellationToken);

        foreach (var oldPostedDecision in oldPostedDecisions)
        {
            oldPostedDecision.IsDeleted = true;
            foreach (var oldPostedDecisionOutcome in oldPostedDecision.PostedDecisionOutcomes)
            {
                oldPostedDecisionOutcome.IsDeleted = true;
                _context.PostedDecisionOutcomes.Attach(oldPostedDecisionOutcome);
                _context.Entry(oldPostedDecisionOutcome).State = EntityState.Modified;
            }

            _context.PostedDecisions.Attach(oldPostedDecision);
            _context.Entry(oldPostedDecision).State = EntityState.Modified;
            await _context.SaveChangesAsync(cancellationToken);
        }

        var postedDecision = _mapper.Map<PostedDecisionDataProcessingEvent, Models.PostedDecision>(message);
        postedDecision.IsDeleted = false;
        postedDecision.UrlExpirationDate = DateTime.UtcNow.AddDays(7);
        var postedDecisionResult = await _context.PostedDecisions.AddAsync(postedDecision, cancellationToken);
        var result = await _context.SaveChangesAsync(cancellationToken);

        if (result > 0)
        {
            await InsertPostedDecisionOutcome(postedDecisionResult.Entity.PostedDecisionId, message);

            var indexToAdd = _mapper.Map<PostedDecisionIndex>(postedDecision);
            await _elasticClient.IndexDocumentAsync(indexToAdd, cancellationToken);
        }
    }

    private async Task InsertPostedDecisionOutcome(int postedDecisionId, PostedDecisionDataProcessingEvent message)
    {
        foreach (var messagePostedDecisionOutcome in message.PostedDecisionOutcomeEvents)
        {
            var postedDecisionOutcome = new PostedDecisionOutcome
            {
                PostedDecisionId = postedDecisionId,
                ClaimId = messagePostedDecisionOutcome.ClaimId,
                ClaimType = messagePostedDecisionOutcome.ClaimType,
                ClaimTitle = messagePostedDecisionOutcome.ClaimTitle,
                ClaimCode = messagePostedDecisionOutcome.ClaimCode,
                RemedyId = messagePostedDecisionOutcome.RemedyId,
                RemedyStatus = messagePostedDecisionOutcome.RemedyStatus,
                RemedyType = messagePostedDecisionOutcome.RemedyType,
                RemedySubStatus = messagePostedDecisionOutcome.RemedySubStatus,
                RemedyAmountRequested = messagePostedDecisionOutcome.RemedyAmountRequested,
                RemedyAmountAwarded = messagePostedDecisionOutcome.RemedyAmountAwarded,
                RelatedSections = messagePostedDecisionOutcome.RelatedSections,
                PostingDate = message.PostingDate,
                IsDeleted = false
            };

            if (message.PostedBy != null)
            {
                postedDecisionOutcome.PostedBy = (int)message.PostedBy;
            }

            await _context.PostedDecisionOutcomes.AddAsync(postedDecisionOutcome);
        }

        await _context.SaveChangesAsync();
    }
}