//// ReSharper disable InconsistentNaming

using System;
using System.ComponentModel.DataAnnotations;

namespace CM.Data.Model;

public class DataModel
{
    [Key]
    public int ETL_DataRow_ID { get; set; }

    public byte? ETL_FileNum_From_RefNum { get; set; }

    [Required]
    [StringLength(20)]
    public string Request_ID { get; set; }

    [StringLength(25)]
    public string File_Number { get; set; }

    [StringLength(30)]
    public string Reference_Number { get; set; }

    public int? DMS_File_Number { get; set; }

    public byte? Searchable_Record { get; set; }

    public Guid? DMS_File_GUID { get; set; }

    [StringLength(30)]
    public string Parent_File_Number { get; set; }

    public byte? Dispute_Type { get; set; }

    public byte? Applicant_Type { get; set; }

    public byte? Dispute_Status { get; set; }

    public byte? File_Origin { get; set; }

    public byte? Direct_Request { get; set; }

    public byte? Joiner_Type { get; set; }

    [StringLength(20)]
    public string Filing_Fee { get; set; }

    public byte? Fee_Waiver_Requested { get; set; }

    [StringLength(20)]
    public string Fee_Refund { get; set; }

    public DateTime? Created { get; set; }

    [StringLength(60)]
    public string Dispute_Unit_Site { get; set; }

    [StringLength(255)]
    public string Dispute_Address { get; set; }

    [StringLength(100)]
    public string Dispute_City { get; set; }

    [StringLength(20)]
    public string Dispute_Postal_Code { get; set; }

    [StringLength(20)]
    public string Monetary_Order { get; set; }

    public DateTime? Date_NTE_Served { get; set; }

    public byte? Fee_Recovery_Requested { get; set; }

    [StringLength(500)]
    public string How_It_Was_Served { get; set; }

    [StringLength(500)]
    public string Dispute_Codes { get; set; }

    [StringLength(4000)]
    public string Details_of_the_Dispute { get; set; }

    public DateTime? Hearing_Date { get; set; }

    [StringLength(20)]
    public string Hearing_Time { get; set; }

    public byte? Hearing_Type { get; set; }

    [StringLength(500)]
    public string Hearing_Location { get; set; }

    [StringLength(60)]
    public string Cross_App_File_Number { get; set; }

    [StringLength(50)]
    public string Online_Cross_App_File_Number { get; set; }

    [StringLength(500)]
    public string Cross_Dispute_Issues { get; set; }

    public byte? Method_of_Service { get; set; }

    public byte? Hearing_Pickup { get; set; }

    [StringLength(100)]
    public string Office_Location { get; set; }

    [StringLength(20)]
    public string DRO_Code { get; set; }

    [StringLength(61)]
    public string DRO_Name { get; set; }

    [StringLength(101)]
    public string DRO_Location { get; set; }

    [StringLength(20)]
    public string Conference_Bridge_Number { get; set; }

    [StringLength(20)]
    public string Participant_Code { get; set; }

    [StringLength(20)]
    public string Moderator_Code { get; set; }

    [StringLength(500)]
    public string Special_Requirements { get; set; }

    public byte? Wheelchair_Access { get; set; }

    public int? Hearing_Duration { get; set; }

    [StringLength(20)]
    public string Decision_Staff_Code { get; set; }

    [StringLength(275)]
    public string Sections_Applied { get; set; }

    public byte? Decision_Details { get; set; }

    [StringLength(255)]
    public string Arbitrator_Comments { get; set; }

    public byte? Method_of_Resolution { get; set; }

    public byte? Outcome_Commercial_Landlord { get; set; }

    public DateTime? Decision_Issue_Date { get; set; }

    [StringLength(20)]
    public string Monetary_Amount_Requested { get; set; }

    [StringLength(20)]
    public string Monetary_Amount_Awarded { get; set; }

    public byte? Order_of_Possession { get; set; }

    public DateTime? Order_of_Possession_Date { get; set; }

    public byte? Order_Effective { get; set; }

    public byte? Fee_Repayment_Ordered { get; set; }

    public byte? Rent_Redirection_Ordered { get; set; }

    public byte? First_Review_Requested_By { get; set; }

    [StringLength(100)]
    public string First_Results_Of_Review { get; set; }

    public byte? First_Grounds_For_Review { get; set; }

    public byte? Second_Review_Requested_By { get; set; }

    [StringLength(100)]
    public string Second_Results_Of_Review { get; set; }

    public byte? Second_Grounds_For_Review { get; set; }

    [StringLength(20)]
    public string RTB_Location { get; set; }

    public DateTime? Created_Date { get; set; }

    [StringLength(50)]
    public string Submitter { get; set; }

    public DateTime? Submitted_Date { get; set; }

    [StringLength(50)]
    public string Last_Modified_By { get; set; }

    public DateTime? Last_Modified_Date { get; set; }

    public byte? Archive { get; set; }

    public DateTime? New_Date { get; set; }

    public DateTime? Date_Terminated { get; set; }

    public DateTime? DR_Pending_Date { get; set; }

    public DateTime? Needs_Update_Date { get; set; }

    public DateTime? Ready_To_Pay_Date { get; set; }

    public DateTime? Approved_Date { get; set; }

    public DateTime? Scheduled_Date { get; set; }

    public DateTime? Rescheduled_Date { get; set; }

    public DateTime? Adjourned_Date { get; set; }

    public DateTime? Closed_Date { get; set; }

    public DateTime? Cancelled_Date { get; set; }

    public DateTime? Reopened_1_Date { get; set; }

    public DateTime? Reopened_2_Date { get; set; }

    public DateTime? Abandoned_Date { get; set; }

    public string Notes { get; set; }

    public string Notes_History { get; set; }

    [StringLength(30)]
    public string Dispute_Province { get; set; }

    public byte? Additional_Rent_Increase { get; set; }

    [StringLength(10)]
    public string Service_Code { get; set; }
}