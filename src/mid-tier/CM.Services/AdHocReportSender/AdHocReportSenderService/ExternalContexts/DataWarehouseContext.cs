using Microsoft.EntityFrameworkCore;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.ExternalContexts;

public class DataWarehouseContext : DbContext
{
    public DataWarehouseContext(DbContextOptions<DataWarehouseContext> options)
        : base(options)
    {
    }
}