using CM.Services.AdHocReportSender.AdHocReportSenderService.Models;
using Microsoft.EntityFrameworkCore;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.ExternalContexts;

public class RtbDmsContext : DbContext
{
    public RtbDmsContext(DbContextOptions<RtbDmsContext> options)
        : base(options)
    {
    }

    public DbSet<SystemSettings> SystemSettings { get; set; }

    public DbSet<CommonFile> CommonFiles { get; set; }
}