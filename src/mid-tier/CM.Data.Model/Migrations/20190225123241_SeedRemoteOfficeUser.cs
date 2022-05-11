using CM.Common.Utilities;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class SeedRemoteOfficeUser : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(string.Format(
                @"CREATE EXTENSION IF NOT EXISTS ""uuid-ossp"";
                    INSERT INTO public.""SystemUsers""
                    (""IsActive"", ""UserGuid"", ""SystemUserRoleId"", ""FullName"", 
                     ""Username"", ""Password"", ""AcceptsTextMessages"", ""AdminAccess"" )
                    VALUES
                    (true, uuid_generate_v1(), 
                    (select ""SystemUserRoleId"" from public.""SystemUserRoles"" where ""RoleName"" = 'Office Pay User'), 
                    'remoteoffice', 'remoteoffice', '{0}', true, true)", HashHelper.GetHash("remoteoffice")));
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"delete from public.""SystemUsers"" where ""Username"" = 'remoteoffice'");
        }
    }
}
