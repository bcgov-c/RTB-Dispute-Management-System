using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddSystemArbitratorUser : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"INSERT INTO public.""SystemUsers""
                    (""IsActive"", ""UserGuid"", ""SystemUserRoleId"", ""FullName"", 
                     ""Username"", ""Password"", ""AcceptsTextMessages"", ""AdminAccess"", ""Scheduler"" )
                    SELECT
                    true, '8f219a4a-5d53-4e66-b6d3-99674678bbc2', 
                    (select ""SystemUserRoleId"" from public.""SystemUserRoles"" where ""RoleName"" = 'Staff User'), 
                    'SystemArbitrator', 'SystemArbitrator', 'ded94173eaff2a941553b8bdcb36e621153ed41fa88c4521903b30da3f41a534', true, true, true
                    WHERE NOT EXISTS(SELECT ""SystemUserId"" FROM public.""SystemUsers"" WHERE ""UserGuid"" = '8f219a4a-5d53-4e66-b6d3-99674678bbc2')");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"delete from public.""SystemUsers"" where ""UserGuid"" = '8f219a4a-5d53-4e66-b6d3-99674678bbc2'");
        }
    }
}
