using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class SeedSystemUserRoles : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"INSERT INTO public.""SystemUserRoles""(""RoleName"", ""RoleDescritption"", ""SessionDuration"") 
                                VALUES ('Staff User', 'Internal Staff User - Able to view all dispute information', 3600);");
            migrationBuilder.Sql(@"INSERT INTO public.""SystemUserRoles""(""RoleName"", ""RoleDescritption"", ""SessionDuration"") 
                                VALUES ('External User', 'External Dispute Participant - Can only access disputes that they are associated to', 900);");
            migrationBuilder.Sql(@"INSERT INTO public.""SystemUserRoles""(""RoleName"", ""RoleDescritption"", ""SessionDuration"") 
                                VALUES ('Guest User', 'Non Authenticated User - Not used in current system', 450);");
            migrationBuilder.Sql(@"INSERT INTO public.""SystemUserRoles""(""RoleName"", ""RoleDescritption"", ""SessionDuration"") 
                                VALUES ('Access Code User', 'External User - Associated to one dispute, provides limited dispute information but allows information submissions', 900);");
            migrationBuilder.Sql(@"INSERT INTO public.""SystemUserRoles""(""RoleName"", ""RoleDescritption"", ""SessionDuration"") 
                                VALUES ('Office Pay User', 'Internal Staff Users - Can see minimal dispute information and submit payments', 900);");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"delete from public.""SystemUserRoles"" where ""RoleName"" = 'Staff User'");
            migrationBuilder.Sql(@"delete from public.""SystemUserRoles"" where ""RoleName"" = 'External User'");
            migrationBuilder.Sql(@"delete from public.""SystemUserRoles"" where ""RoleName"" = 'Guest User'");
            migrationBuilder.Sql(@"delete from public.""SystemUserRoles"" where ""RoleName"" = 'Access Code User'");
            migrationBuilder.Sql(@"delete from public.""SystemUserRoles"" where ""RoleName"" = 'Office Pay User'");
        }
    }
}
