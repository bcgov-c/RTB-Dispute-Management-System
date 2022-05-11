using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class NamingConvention : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PaymentTransactions_DisputeFees_DisputeFeeid",
                table: "PaymentTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_ScheduleBlocks_SystemUsers_SystemUserID",
                table: "ScheduleBlocks");

            migrationBuilder.RenameColumn(
                name: "RoleDescritption",
                table: "SystemUserRoles",
                newName: "RoleDescription");

            migrationBuilder.RenameColumn(
                name: "UIVersionDate",
                table: "SiteVersion",
                newName: "UiVersionDate");

            migrationBuilder.RenameColumn(
                name: "UIVersion",
                table: "SiteVersion",
                newName: "UiVersion");

            migrationBuilder.RenameColumn(
                name: "PDFVersionDate",
                table: "SiteVersion",
                newName: "PdfVersionDate");

            migrationBuilder.RenameColumn(
                name: "PDFVersion",
                table: "SiteVersion",
                newName: "PdfVersion");

            migrationBuilder.RenameColumn(
                name: "OfficeTimezoneUTCOffset",
                table: "ServiceOffices",
                newName: "OfficeTimezoneUtcOffset");

            migrationBuilder.RenameColumn(
                name: "SystemUserID",
                table: "ScheduleBlocks",
                newName: "SystemUserId");

            migrationBuilder.RenameIndex(
                name: "IX_ScheduleBlocks_SystemUserID",
                table: "ScheduleBlocks",
                newName: "IX_ScheduleBlocks_SystemUserId");

            migrationBuilder.RenameColumn(
                name: "DisputeFeeid",
                table: "PaymentTransactions",
                newName: "DisputeFeeId");

            migrationBuilder.RenameIndex(
                name: "IX_PaymentTransactions_DisputeFeeid",
                table: "PaymentTransactions",
                newName: "IX_PaymentTransactions_DisputeFeeId");

            migrationBuilder.RenameColumn(
                name: "AcceptedTOUDate",
                table: "Participants",
                newName: "AcceptedTouDate");

            migrationBuilder.RenameColumn(
                name: "AcceptedTOU",
                table: "Participants",
                newName: "AcceptedTou");

            migrationBuilder.RenameColumn(
                name: "MailAddres",
                table: "Participants",
                newName: "MailAddress");

            migrationBuilder.RenameColumn(
                name: "OtherParticpantTitle",
                table: "NoticeServices",
                newName: "OtherParticipantTitle");

            migrationBuilder.AddForeignKey(
                name: "FK_PaymentTransactions_DisputeFees_DisputeFeeId",
                table: "PaymentTransactions",
                column: "DisputeFeeId",
                principalTable: "DisputeFees",
                principalColumn: "DisputeFeeId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ScheduleBlocks_SystemUsers_SystemUserId",
                table: "ScheduleBlocks",
                column: "SystemUserId",
                principalTable: "SystemUsers",
                principalColumn: "SystemUserId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PaymentTransactions_DisputeFees_DisputeFeeId",
                table: "PaymentTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_ScheduleBlocks_SystemUsers_SystemUserId",
                table: "ScheduleBlocks");

            migrationBuilder.RenameColumn(
                name: "RoleDescription",
                table: "SystemUserRoles",
                newName: "RoleDescritption");

            migrationBuilder.RenameColumn(
                name: "UiVersionDate",
                table: "SiteVersion",
                newName: "UIVersionDate");

            migrationBuilder.RenameColumn(
                name: "UiVersion",
                table: "SiteVersion",
                newName: "UIVersion");

            migrationBuilder.RenameColumn(
                name: "PdfVersionDate",
                table: "SiteVersion",
                newName: "PDFVersionDate");

            migrationBuilder.RenameColumn(
                name: "PdfVersion",
                table: "SiteVersion",
                newName: "PDFVersion");

            migrationBuilder.RenameColumn(
                name: "OfficeTimezoneUtcOffset",
                table: "ServiceOffices",
                newName: "OfficeTimezoneUTCOffset");

            migrationBuilder.RenameColumn(
                name: "SystemUserId",
                table: "ScheduleBlocks",
                newName: "SystemUserID");

            migrationBuilder.RenameIndex(
                name: "IX_ScheduleBlocks_SystemUserId",
                table: "ScheduleBlocks",
                newName: "IX_ScheduleBlocks_SystemUserID");

            migrationBuilder.RenameColumn(
                name: "DisputeFeeId",
                table: "PaymentTransactions",
                newName: "DisputeFeeid");

            migrationBuilder.RenameIndex(
                name: "IX_PaymentTransactions_DisputeFeeId",
                table: "PaymentTransactions",
                newName: "IX_PaymentTransactions_DisputeFeeid");

            migrationBuilder.RenameColumn(
                name: "AcceptedTouDate",
                table: "Participants",
                newName: "AcceptedTOUDate");

            migrationBuilder.RenameColumn(
                name: "AcceptedTou",
                table: "Participants",
                newName: "AcceptedTOU");

            migrationBuilder.RenameColumn(
                name: "MailAddress",
                table: "Participants",
                newName: "MailAddres");

            migrationBuilder.RenameColumn(
                name: "OtherParticipantTitle",
                table: "NoticeServices",
                newName: "OtherParticpantTitle");

            migrationBuilder.AddForeignKey(
                name: "FK_PaymentTransactions_DisputeFees_DisputeFeeid",
                table: "PaymentTransactions",
                column: "DisputeFeeid",
                principalTable: "DisputeFees",
                principalColumn: "DisputeFeeId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ScheduleBlocks_SystemUsers_SystemUserID",
                table: "ScheduleBlocks",
                column: "SystemUserID",
                principalTable: "SystemUsers",
                principalColumn: "SystemUserId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
