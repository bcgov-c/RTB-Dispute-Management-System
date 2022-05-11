using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class UpdateDisputeLastModifiedForOldRecords : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"INSERT INTO public.""DisputesLastModified""(""DisputeGuid"", ""LastModifiedDate"", ""LastModifiedBy"", ""LastModifiedSource"")
                                    SELECT ""DisputeGuid"", ""ChangeDate"", '-999', '[""Data Migration""]'
                                    from public.""AuditLogs"" where ""AuditLogId"" in (SELECT max(""AuditLogId"") as ""AuditLogId"" FROM public.""AuditLogs""
                                    group by ""DisputeGuid"")
                                    AND ""DisputeGuid"" not in (SELECT ""DisputeGuid"" from public.""DisputesLastModified"")");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
