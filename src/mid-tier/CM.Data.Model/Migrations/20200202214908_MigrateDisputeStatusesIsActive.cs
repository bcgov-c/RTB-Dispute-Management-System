using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class MigrateDisputeStatusesIsActive : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql($@"
                UPDATE public.""DisputeStatuses""
                SET ""IsActive""=true
                WHERE ""DisputeStatusId"" IN ( 
                    SELECT DISTINCT ON (ds.""DisputeGuid"")
                    ds.""DisputeStatusId""
                    FROM ""DisputeStatuses"" ds
                    ORDER BY ds.""DisputeGuid"", ds.""DisputeStatusId"" DESC
                )
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
