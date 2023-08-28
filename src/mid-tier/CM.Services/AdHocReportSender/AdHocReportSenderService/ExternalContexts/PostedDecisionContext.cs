using Microsoft.EntityFrameworkCore;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.ExternalContexts;

public class PostedDecisionContext : DbContext
{
    public PostedDecisionContext(DbContextOptions<PostedDecisionContext> options)
        : base(options)
    {
    }
}