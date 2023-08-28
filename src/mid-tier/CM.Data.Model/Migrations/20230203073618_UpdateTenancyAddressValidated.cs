using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CM.Data.Model.Migrations
{
    public partial class UpdateTenancyAddressValidated : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"ALTER TABLE public.""Disputes"" ALTER COLUMN ""TenancyAddressValidated"" DROP DEFAULT");
            migrationBuilder.Sql(@"ALTER TABLE public.""Disputes"" ALTER ""TenancyAddressValidated"" TYPE bool USING CASE WHEN ""TenancyAddressValidated""=1 THEN TRUE ELSE FALSE END");
            migrationBuilder.Sql(@"ALTER TABLE public.""Disputes"" ALTER COLUMN ""TenancyAddressValidated"" SET DEFAULT FALSE");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<byte>(
                name: "TenancyAddressValidated",
                table: "Disputes",
                type: "smallint",
                nullable: true,
                defaultValue: (byte)0,
                oldClrType: typeof(bool),
                oldType: "boolean",
                oldNullable: true,
                oldDefaultValue: false);
        }
    }
}
