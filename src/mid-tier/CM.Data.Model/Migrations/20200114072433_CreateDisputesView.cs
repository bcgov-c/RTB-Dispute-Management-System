using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class CreateDisputesView : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            var script =
                        @"
                        CREATE VIEW public.""DisputesLastStatus""
                        AS SELECT DISTINCT ON (ds.""DisputeGuid"")
                        ds.""DisputeGuid"", ds.""Status"", ds.""Stage"", ds.""Process"", ds.""Owner"", ds.""StatusStartDate"", d.""SubmittedDate"", d.""CreatedDate"", d.""ModifiedDate""
                        FROM   public.""DisputeStatuses"" ds
                        LEFT JOIN public.""Disputes"" d ON ds.""DisputeGuid"" = d.""DisputeGuid""
                        ORDER by ""DisputeGuid"", ""DisputeStatusId"" DESC";
            migrationBuilder.Sql(script);

            var scriptForAll =
                        @"
                        CREATE VIEW public.""DisputesAllStatuses""
                        AS SELECT
                        ds.""DisputeGuid"", ds.""Status"", ds.""Stage"", ds.""Process"", ds.""Owner"", ds.""StatusStartDate"", d.""SubmittedDate"", d.""CreatedDate"", d.""ModifiedDate""
                        FROM   public.""DisputeStatuses"" ds
                        LEFT JOIN public.""Disputes"" d ON ds.""DisputeGuid"" = d.""DisputeGuid""
                        ORDER by ""DisputeGuid"", ""DisputeStatusId"" DESC";
            migrationBuilder.Sql(scriptForAll);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DROP VIEW public.DisputesStatus");
        }
    }
}
