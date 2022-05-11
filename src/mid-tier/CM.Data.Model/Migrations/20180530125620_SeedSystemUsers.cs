using CM.Common.Utilities;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class SeedSystemUsers : Migration
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
                    (select ""SystemUserRoleId"" from public.""SystemUserRoles"" where ""RoleName"" = 'Staff User'), 
                    'administrator', 'admin', '{0}', true, true)", HashHelper.GetHash("admin")));

            migrationBuilder.Sql(string.Format(
                    @"CREATE EXTENSION IF NOT EXISTS ""uuid-ossp"";
                    INSERT INTO public.""SystemUsers""
                    (""IsActive"", ""UserGuid"", ""SystemUserRoleId"", ""FullName"", 
                     ""Username"", ""Password"", ""AcceptsTextMessages"", ""AdminAccess"" )
                    VALUES
                    (true, uuid_generate_v1(), 
                    (select ""SystemUserRoleId"" from public.""SystemUserRoles"" where ""RoleName"" = 'External User'), 
                    'user', 'user', '{0}', true, true)", HashHelper.GetHash("user")));

            migrationBuilder.Sql(string.Format(
                    @"CREATE EXTENSION IF NOT EXISTS ""uuid-ossp"";
                    INSERT INTO public.""SystemUsers""
                    (""IsActive"", ""UserGuid"", ""SystemUserRoleId"", ""FullName"", 
                     ""Username"", ""Password"", ""AcceptsTextMessages"", ""AdminAccess"" )
                    VALUES
                    (true, uuid_generate_v1(), 
                    (select ""SystemUserRoleId"" from public.""SystemUserRoles"" where ""RoleName"" = 'Staff User'), 
                    'administrator2', 'admin2', '{0}', true, true)", HashHelper.GetHash("admin2")));

            migrationBuilder.Sql(string.Format(
                    @"CREATE EXTENSION IF NOT EXISTS ""uuid-ossp"";
                    INSERT INTO public.""SystemUsers""
                    (""IsActive"", ""UserGuid"", ""SystemUserRoleId"", ""FullName"", 
                     ""Username"", ""Password"", ""AcceptsTextMessages"", ""AdminAccess"" )
                    VALUES
                    (true, uuid_generate_v1(), 
                    (select ""SystemUserRoleId"" from public.""SystemUserRoles"" where ""RoleName"" = 'Staff User'), 
                    'administrator3', 'admin3', '{0}', true, true)", HashHelper.GetHash("admin3")));

            migrationBuilder.Sql(string.Format(
                    @"CREATE EXTENSION IF NOT EXISTS ""uuid-ossp"";
                    INSERT INTO public.""SystemUsers""
                    (""IsActive"", ""UserGuid"", ""SystemUserRoleId"", ""FullName"", 
                     ""Username"", ""Password"", ""AcceptsTextMessages"", ""AdminAccess"" )
                    VALUES
                    (true, uuid_generate_v1(), 
                    (select ""SystemUserRoleId"" from public.""SystemUserRoles"" where ""RoleName"" = 'External User'), 
                    'user2', 'user2', '{0}', true, true)", HashHelper.GetHash("user2")));

            migrationBuilder.Sql(string.Format(
                    @"CREATE EXTENSION IF NOT EXISTS ""uuid-ossp"";
                    INSERT INTO public.""SystemUsers""
                    (""IsActive"", ""UserGuid"", ""SystemUserRoleId"", ""FullName"", 
                     ""Username"", ""Password"", ""AcceptsTextMessages"", ""AdminAccess"" )
                    VALUES
                    (true, uuid_generate_v1(), 
                    (select ""SystemUserRoleId"" from public.""SystemUserRoles"" where ""RoleName"" = 'External User'), 
                    'user3', 'user3', '{0}', true, true)", HashHelper.GetHash("user3")));
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"delete from public.""SystemUsers"" where ""Username"" = 'admin'");
            migrationBuilder.Sql(@"delete from public.""SystemUsers"" where ""Username"" = 'admin2'");
            migrationBuilder.Sql(@"delete from public.""SystemUsers"" where ""Username"" = 'admin3'");
            migrationBuilder.Sql(@"delete from public.""SystemUsers"" where ""Username"" = 'user'");
            migrationBuilder.Sql(@"delete from public.""SystemUsers"" where ""Username"" = 'user2'");
            migrationBuilder.Sql(@"delete from public.""SystemUsers"" where ""Username"" = 'user3'");
        }
    }
}
