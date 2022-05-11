using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class AddArchiveTables : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CMSCorrections",
                columns: table => new
                {
                    ETL_CorrectionRow_ID = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    Request_ID = table.Column<string>(maxLength: 20, nullable: false),
                    File_Number = table.Column<string>(maxLength: 20, nullable: true),
                    Comment_Type = table.Column<byte>(nullable: true),
                    Comment_Submitted_Date = table.Column<DateTime>(nullable: true),
                    Comment_Submitter = table.Column<string>(maxLength: 50, nullable: true),
                    Comment = table.Column<string>(maxLength: 2000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CMSCorrections", x => x.ETL_CorrectionRow_ID);
                });

            migrationBuilder.CreateTable(
                name: "CMSData",
                columns: table => new
                {
                    ETL_DataRow_ID = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    ETL_FileNum_From_RefNum = table.Column<byte>(nullable: true),
                    Request_ID = table.Column<string>(maxLength: 20, nullable: false),
                    File_Number = table.Column<string>(maxLength: 20, nullable: true),
                    Reference_Number = table.Column<string>(maxLength: 15, nullable: true),
                    DMS_File_Number = table.Column<int>(nullable: true),
                    DMS_File_GUID = table.Column<Guid>(nullable: true),
                    Parent_File_Number = table.Column<string>(maxLength: 15, nullable: true),
                    Dispute_Type = table.Column<byte>(nullable: true),
                    Applicant_Type = table.Column<byte>(nullable: true),
                    Dispute_Status = table.Column<byte>(nullable: true),
                    File_Origin = table.Column<byte>(nullable: true),
                    Direct_Request = table.Column<byte>(nullable: true),
                    Joiner_Type = table.Column<byte>(nullable: true),
                    Filing_Fee = table.Column<string>(maxLength: 20, nullable: true),
                    Fee_Waiver_Requested = table.Column<byte>(nullable: true),
                    Fee_Refund = table.Column<string>(maxLength: 20, nullable: true),
                    Created = table.Column<DateTime>(nullable: true),
                    Dispute_Unit_Site = table.Column<string>(maxLength: 40, nullable: true),
                    Dispute_Address = table.Column<string>(maxLength: 255, nullable: true),
                    Dispute_City = table.Column<string>(maxLength: 100, nullable: true),
                    Dispute_Postal_Code = table.Column<string>(maxLength: 20, nullable: true),
                    Monetary_Order = table.Column<string>(maxLength: 20, nullable: true),
                    Date_NTE_Served = table.Column<DateTime>(nullable: true),
                    Fee_Recovery_Requested = table.Column<byte>(nullable: true),
                    How_It_Was_Served = table.Column<string>(maxLength: 500, nullable: true),
                    Dispute_Codes = table.Column<string>(maxLength: 500, nullable: true),
                    Details_of_the_Dispute = table.Column<string>(maxLength: 4000, nullable: true),
                    Hearing_Date = table.Column<DateTime>(nullable: true),
                    Hearing_Time = table.Column<string>(maxLength: 20, nullable: true),
                    Hearing_Type = table.Column<byte>(nullable: true),
                    Hearing_Location = table.Column<string>(maxLength: 500, nullable: true),
                    Cross_App_File_Number = table.Column<string>(maxLength: 20, nullable: true),
                    Online_Cross_App_File_Number = table.Column<string>(maxLength: 20, nullable: true),
                    Cross_Dispute_Issues = table.Column<string>(maxLength: 500, nullable: true),
                    Method_of_Service = table.Column<byte>(nullable: true),
                    Hearing_Pickup = table.Column<byte>(nullable: true),
                    Office_Location = table.Column<string>(maxLength: 40, nullable: true),
                    DRO_Code = table.Column<string>(maxLength: 20, nullable: true),
                    DRO_Name = table.Column<string>(maxLength: 40, nullable: true),
                    DRO_Location = table.Column<string>(maxLength: 40, nullable: true),
                    Conference_Bridge_Number = table.Column<string>(maxLength: 20, nullable: true),
                    Participant_Code = table.Column<string>(maxLength: 20, nullable: true),
                    Moderator_Code = table.Column<string>(maxLength: 20, nullable: true),
                    Special_Requirements = table.Column<string>(maxLength: 500, nullable: true),
                    Wheelchair_Access = table.Column<byte>(nullable: true),
                    Hearing_Duration = table.Column<int>(nullable: true),
                    Decision_Staff_Code = table.Column<string>(maxLength: 20, nullable: true),
                    Sections_Applied = table.Column<string>(maxLength: 200, nullable: true),
                    Decision_Details = table.Column<byte>(nullable: true),
                    Arbitrator_Comments = table.Column<string>(maxLength: 255, nullable: true),
                    Method_of_Resolution = table.Column<byte>(nullable: true),
                    Outcome_Commercial_Landlord = table.Column<byte>(nullable: true),
                    Decision_Issue_Date = table.Column<DateTime>(nullable: true),
                    Monetary_Amount_Requested = table.Column<string>(maxLength: 20, nullable: true),
                    Monetary_Amount_Awarded = table.Column<string>(maxLength: 20, nullable: true),
                    Order_of_Possession = table.Column<byte>(nullable: true),
                    Order_of_Possession_Date = table.Column<DateTime>(nullable: true),
                    Order_Effective = table.Column<byte>(nullable: true),
                    Fee_Repayment_Ordered = table.Column<byte>(nullable: true),
                    Rent_Redirection_Ordered = table.Column<byte>(nullable: true),
                    First_Review_Requested_By = table.Column<byte>(nullable: true),
                    First_Results_Of_Review = table.Column<string>(maxLength: 100, nullable: true),
                    First_Grounds_For_Review = table.Column<byte>(nullable: true),
                    Second_Review_Requested_By = table.Column<byte>(nullable: true),
                    Second_Results_Of_Review = table.Column<string>(maxLength: 15, nullable: true),
                    Second_Grounds_For_Review = table.Column<byte>(nullable: true),
                    RTB_Location = table.Column<string>(maxLength: 20, nullable: true),
                    Created_Date = table.Column<DateTime>(nullable: true),
                    Submitter = table.Column<string>(maxLength: 50, nullable: true),
                    Submitted_Date = table.Column<DateTime>(nullable: true),
                    Last_Modified_By = table.Column<string>(maxLength: 50, nullable: true),
                    Last_Modified_Date = table.Column<DateTime>(nullable: true),
                    Archive = table.Column<byte>(nullable: true),
                    New_Date = table.Column<DateTime>(nullable: true),
                    Date_Terminated = table.Column<DateTime>(nullable: true),
                    DR_Pending_Date = table.Column<DateTime>(nullable: true),
                    Needs_Update_Date = table.Column<DateTime>(nullable: true),
                    Ready_To_Pay_Date = table.Column<DateTime>(nullable: true),
                    Approved_Date = table.Column<DateTime>(nullable: true),
                    Scheduled_Date = table.Column<DateTime>(nullable: true),
                    Rescheduled_Date = table.Column<DateTime>(nullable: true),
                    Adjourned_Date = table.Column<DateTime>(nullable: true),
                    Closed_Date = table.Column<DateTime>(nullable: true),
                    Cancelled_Date = table.Column<DateTime>(nullable: true),
                    Reopened_1_Date = table.Column<DateTime>(nullable: true),
                    Reopened_2_Date = table.Column<DateTime>(nullable: true),
                    Abandoned_Date = table.Column<DateTime>(nullable: true),
                    Notes = table.Column<string>(nullable: true),
                    Notes_History = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CMSData", x => x.ETL_DataRow_ID);
                });

            migrationBuilder.CreateTable(
                name: "CMSFiles",
                columns: table => new
                {
                    ETL_File_ID = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    File_Number = table.Column<string>(maxLength: 20, nullable: true),
                    CMS_File_ID = table.Column<string>(maxLength: 20, nullable: true),
                    File_Name = table.Column<string>(maxLength: 255, nullable: true),
                    File_Type = table.Column<byte>(nullable: false),
                    File_GUID = table.Column<Guid>(nullable: false),
                    File_Mime_Type = table.Column<string>(maxLength: 255, nullable: true),
                    File_Size = table.Column<int>(nullable: true),
                    File_Path = table.Column<string>(nullable: true),
                    Submitter = table.Column<string>(maxLength: 50, nullable: true),
                    Created_Date = table.Column<DateTime>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CMSFiles", x => x.ETL_File_ID);
                });

            migrationBuilder.CreateTable(
                name: "CMSParticipants",
                columns: table => new
                {
                    ETL_ParticipantRow_ID = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    Request_ID = table.Column<string>(maxLength: 20, nullable: false),
                    File_Number = table.Column<string>(maxLength: 20, nullable: true),
                    Participant_Type = table.Column<byte>(nullable: false),
                    CMS_Sequence_Number = table.Column<byte>(nullable: true),
                    First_Name = table.Column<string>(maxLength: 100, nullable: true),
                    Last_Name = table.Column<string>(maxLength: 100, nullable: true),
                    Email_Address = table.Column<string>(maxLength: 100, nullable: true),
                    Unit = table.Column<string>(maxLength: 100, nullable: true),
                    Street_Address = table.Column<string>(maxLength: 100, nullable: true),
                    City = table.Column<string>(maxLength: 100, nullable: true),
                    Province = table.Column<string>(maxLength: 100, nullable: true),
                    Country = table.Column<string>(maxLength: 100, nullable: true),
                    Postal_Code = table.Column<string>(maxLength: 10, nullable: true),
                    DayTime_Area = table.Column<string>(maxLength: 10, nullable: true),
                    DayTime_Phone = table.Column<string>(maxLength: 20, nullable: true),
                    Other_Area = table.Column<string>(maxLength: 10, nullable: true),
                    Other_Phone = table.Column<string>(maxLength: 20, nullable: true),
                    Fax_Area = table.Column<string>(maxLength: 10, nullable: true),
                    Fax_Number = table.Column<string>(maxLength: 20, nullable: true),
                    Preferred = table.Column<byte>(nullable: true),
                    Commercial_landlord = table.Column<byte>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CMSParticipants", x => x.ETL_ParticipantRow_ID);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CMSCorrections");

            migrationBuilder.DropTable(
                name: "CMSData");

            migrationBuilder.DropTable(
                name: "CMSFiles");

            migrationBuilder.DropTable(
                name: "CMSParticipants");
        }
    }
}
