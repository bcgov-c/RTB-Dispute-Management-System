using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddDefaultValuesAndCustomTypes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<byte>(
                name: "TaskPriority",
                table: "Tasks",
                nullable: false,
                defaultValue: (byte)1,
                oldClrType: typeof(byte));

            migrationBuilder.AlterColumn<byte>(
                name: "TaskLinkedTo",
                table: "Tasks",
                nullable: false,
                defaultValue: (byte)0,
                oldClrType: typeof(byte));

            migrationBuilder.AlterColumn<int>(
                name: "SessionDuration",
                table: "SystemUserRoles",
                nullable: false,
                defaultValue: 900,
                oldClrType: typeof(int));

            migrationBuilder.AlterColumn<decimal>(
                name: "Amount",
                table: "RemedyDetails",
                type: "decimal(10,2)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldNullable: true);

            migrationBuilder.AlterColumn<byte>(
                name: "TransactionMethod",
                table: "PaymentTransactions",
                nullable: false,
                oldClrType: typeof(byte));

            migrationBuilder.AlterColumn<decimal>(
                name: "TransactionAmount",
                table: "PaymentTransactions",
                type: "decimal(10,2)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "FeeWaiverIncome",
                table: "PaymentTransactions",
                type: "decimal(10,2)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CardType",
                table: "PaymentTransactions",
                type: "char(2)",
                nullable: true,
                oldClrType: typeof(string),
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "SecondaryPhoneVerified",
                table: "Participants",
                nullable: true,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "PrimaryPhoneVerified",
                table: "Participants",
                nullable: true,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldNullable: true);

            migrationBuilder.AlterColumn<byte>(
                name: "ParticipantStatus",
                table: "Participants",
                nullable: false,
                defaultValue: (byte)1,
                oldClrType: typeof(byte));

            migrationBuilder.AlterColumn<bool>(
                name: "NoEmail",
                table: "Participants",
                nullable: true,
                defaultValue: true,
                oldClrType: typeof(bool),
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "EmailVerified",
                table: "Participants",
                nullable: true,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "IsServed",
                table: "NoticeServices",
                nullable: true,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldNullable: true);

            migrationBuilder.AlterColumn<byte>(
                name: "NoticeVersion",
                table: "Notices",
                nullable: true,
                defaultValue: (byte)0,
                oldClrType: typeof(byte),
                oldNullable: true);

            migrationBuilder.AlterColumn<byte>(
                name: "NoteStatus",
                table: "Notes",
                nullable: false,
                defaultValue: (byte)1,
                oldClrType: typeof(byte));

            migrationBuilder.AlterColumn<byte>(
                name: "NoteLinkedTo",
                table: "Notes",
                nullable: false,
                defaultValue: (byte)0,
                oldClrType: typeof(byte));

            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                table: "InternalUserRoles",
                nullable: true,
                defaultValue: true,
                oldClrType: typeof(bool),
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "UseSpecialInstructions",
                table: "Hearings",
                nullable: true,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "UseCustomSchedule",
                table: "Hearings",
                nullable: true,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldNullable: true);

            migrationBuilder.AlterColumn<byte>(
                name: "FileType",
                table: "Files",
                nullable: false,
                defaultValue: (byte)0,
                oldClrType: typeof(byte));

            migrationBuilder.AlterColumn<byte>(
                name: "FileStatus",
                table: "Files",
                nullable: true,
                defaultValue: (byte)0,
                oldClrType: typeof(byte),
                oldNullable: true);

            migrationBuilder.AlterColumn<byte>(
                name: "TemplateId",
                table: "EmailMessages",
                nullable: false,
                defaultValue: (byte)0,
                oldClrType: typeof(byte));

            migrationBuilder.AlterColumn<byte>(
                name: "Retries",
                table: "EmailMessages",
                nullable: false,
                defaultValue: (byte)0,
                oldClrType: typeof(byte));

            migrationBuilder.AlterColumn<byte>(
                name: "BodyType",
                table: "EmailMessages",
                nullable: false,
                defaultValue: (byte)1,
                oldClrType: typeof(byte));

            migrationBuilder.AlterColumn<decimal>(
                name: "AmountDue",
                table: "DisputeFees",
                type: "decimal(10,2)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldNullable: true);

            migrationBuilder.AlterColumn<byte>(
                name: "AmendmentStatus",
                table: "Amendments",
                nullable: false,
                defaultValue: (byte)0,
                oldClrType: typeof(byte));
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<byte>(
                name: "TaskPriority",
                table: "Tasks",
                nullable: false,
                oldClrType: typeof(byte),
                oldDefaultValue: (byte)1);

            migrationBuilder.AlterColumn<byte>(
                name: "TaskLinkedTo",
                table: "Tasks",
                nullable: false,
                oldClrType: typeof(byte),
                oldDefaultValue: (byte)0);

            migrationBuilder.AlterColumn<int>(
                name: "SessionDuration",
                table: "SystemUserRoles",
                nullable: false,
                oldClrType: typeof(int),
                oldDefaultValue: 900);

            migrationBuilder.AlterColumn<decimal>(
                name: "Amount",
                table: "RemedyDetails",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(10,2)",
                oldNullable: true);

            migrationBuilder.AlterColumn<byte>(
                name: "TransactionMethod",
                table: "PaymentTransactions",
                nullable: false,
                oldClrType: typeof(byte));

            migrationBuilder.AlterColumn<decimal>(
                name: "TransactionAmount",
                table: "PaymentTransactions",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(10,2)",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "FeeWaiverIncome",
                table: "PaymentTransactions",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(10,2)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CardType",
                table: "PaymentTransactions",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "char(2)",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "SecondaryPhoneVerified",
                table: "Participants",
                nullable: true,
                oldClrType: typeof(bool),
                oldNullable: true,
                oldDefaultValue: false);

            migrationBuilder.AlterColumn<bool>(
                name: "PrimaryPhoneVerified",
                table: "Participants",
                nullable: true,
                oldClrType: typeof(bool),
                oldNullable: true,
                oldDefaultValue: false);

            migrationBuilder.AlterColumn<byte>(
                name: "ParticipantStatus",
                table: "Participants",
                nullable: false,
                oldClrType: typeof(byte),
                oldDefaultValue: (byte)1);

            migrationBuilder.AlterColumn<bool>(
                name: "NoEmail",
                table: "Participants",
                nullable: true,
                oldClrType: typeof(bool),
                oldNullable: true,
                oldDefaultValue: true);

            migrationBuilder.AlterColumn<bool>(
                name: "EmailVerified",
                table: "Participants",
                nullable: true,
                oldClrType: typeof(bool),
                oldNullable: true,
                oldDefaultValue: false);

            migrationBuilder.AlterColumn<bool>(
                name: "IsServed",
                table: "NoticeServices",
                nullable: true,
                oldClrType: typeof(bool),
                oldNullable: true,
                oldDefaultValue: false);

            migrationBuilder.AlterColumn<byte>(
                name: "NoticeVersion",
                table: "Notices",
                nullable: true,
                oldClrType: typeof(byte),
                oldNullable: true,
                oldDefaultValue: (byte)0);

            migrationBuilder.AlterColumn<byte>(
                name: "NoteStatus",
                table: "Notes",
                nullable: false,
                oldClrType: typeof(byte),
                oldDefaultValue: (byte)1);

            migrationBuilder.AlterColumn<byte>(
                name: "NoteLinkedTo",
                table: "Notes",
                nullable: false,
                oldClrType: typeof(byte),
                oldDefaultValue: (byte)0);

            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                table: "InternalUserRoles",
                nullable: true,
                oldClrType: typeof(bool),
                oldNullable: true,
                oldDefaultValue: true);

            migrationBuilder.AlterColumn<bool>(
                name: "UseSpecialInstructions",
                table: "Hearings",
                nullable: true,
                oldClrType: typeof(bool),
                oldNullable: true,
                oldDefaultValue: false);

            migrationBuilder.AlterColumn<bool>(
                name: "UseCustomSchedule",
                table: "Hearings",
                nullable: true,
                oldClrType: typeof(bool),
                oldNullable: true,
                oldDefaultValue: false);

            migrationBuilder.AlterColumn<byte>(
                name: "FileType",
                table: "Files",
                nullable: false,
                oldClrType: typeof(byte),
                oldDefaultValue: (byte)0);

            migrationBuilder.AlterColumn<byte>(
                name: "FileStatus",
                table: "Files",
                nullable: true,
                oldClrType: typeof(byte),
                oldNullable: true,
                oldDefaultValue: (byte)0);

            migrationBuilder.AlterColumn<byte>(
                name: "TemplateId",
                table: "EmailMessages",
                nullable: false,
                oldClrType: typeof(byte),
                oldDefaultValue: (byte)0);

            migrationBuilder.AlterColumn<byte>(
                name: "Retries",
                table: "EmailMessages",
                nullable: false,
                oldClrType: typeof(byte),
                oldDefaultValue: (byte)0);

            migrationBuilder.AlterColumn<byte>(
                name: "BodyType",
                table: "EmailMessages",
                nullable: false,
                oldClrType: typeof(byte),
                oldDefaultValue: (byte)1);

            migrationBuilder.AlterColumn<decimal>(
                name: "AmountDue",
                table: "DisputeFees",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(10,2)",
                oldNullable: true);

            migrationBuilder.AlterColumn<byte>(
                name: "AmendmentStatus",
                table: "Amendments",
                nullable: false,
                oldClrType: typeof(byte),
                oldDefaultValue: (byte)0);
        }
    }
}
