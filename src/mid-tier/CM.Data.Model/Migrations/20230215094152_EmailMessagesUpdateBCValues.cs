using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CM.Data.Model.Migrations
{
    public partial class EmailMessagesUpdateBCValues : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"UPDATE public.""EmailMessages"" SET ""PreferredSendDate"" = null WHERE ""PreferredSendDate"" < '0001-01-01 00:00:00'");
            migrationBuilder.Sql(@"UPDATE public.""EmailMessages"" SET ""ResponseDueDate"" = null WHERE ""ResponseDueDate"" < '0001-01-01 00:00:00'");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
