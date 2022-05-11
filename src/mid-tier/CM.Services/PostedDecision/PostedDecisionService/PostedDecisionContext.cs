using CM.Services.PostedDecision.PostedDecisionDataService.Models;
using Microsoft.EntityFrameworkCore;

namespace CM.Services.PostedDecision.PostedDecisionDataService;

public class PostedDecisionContext : DbContext
{
    public PostedDecisionContext(DbContextOptions<PostedDecisionContext> options)
        : base(options)
    {
    }

    public DbSet<Models.PostedDecision> PostedDecisions { get; set; }

    public DbSet<PostedDecisionOutcome> PostedDecisionOutcomes { get; set; }
}