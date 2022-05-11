// ReSharper disable InconsistentNaming

using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.CmsArchive;

public class CmsRecordResponse
{
    [JsonProperty("file_number")]
    public string File_Number { get; set; }

    [JsonProperty("reference_number")]
    public string Reference_Number { get; set; }

    [JsonProperty("dms_file_number")]
    public int? DMS_File_Number { get; set; }

    [JsonProperty("dms_file_guid")]
    public Guid? DMS_File_GUID { get; set; }

    [JsonProperty("evidence_files")]
    public List<FileResponse> EvidenceFiles { get; set; }

    [JsonProperty("outcome_files")]
    public List<FileResponse> OutcomeFiles { get; set; }

    [JsonProperty("cms_archive_notes")]
    public List<ArchiveNote> ArchiveNotes { get; set; }

    [JsonProperty("cms_record_count")]
    public int CMSRecordCount { get; set; }

    [JsonProperty("cms_records")]
    public List<CmsRecord> Records { get; set; }
}

public class FileResponse
{
    [JsonProperty("etl_file_id")]
    public int ETL_File_ID { get; set; }

    [JsonProperty("file_url")]
    public string File_Url { get; set; }

    [JsonProperty("file_name")]
    public string File_Name { get; set; }

    [JsonProperty("file_size")]
    public int? File_Size { get; set; }

    [JsonProperty("submitter")]
    public string Submitter { get; set; }

    [JsonProperty("create_date")]
    public string Created_Date { get; set; }

    [JsonIgnore]
    public string File_Path { get; set; }
}

public class ArchiveNote
{
    [JsonProperty("cms_note_id")]
    public int CMS_Note_ID { get; set; }

    [JsonProperty("cms_note")]
    public string CMS_Note { get; set; }

    [JsonProperty("created_date")]
    public string Created_Date { get; set; }

    [JsonProperty("created_by")]
    public string Created_By { get; set; }
}

public class CmsRecord
{
    [JsonProperty("etl_datarow_id")]
    public int ETL_DataRow_ID { get; set; }

    [JsonProperty("etl_filenum_from_refnum")]
    public byte? ETL_FileNum_From_RefNum { get; set; }

    [JsonProperty("request_id")]
    public string Request_ID { get; set; }

    [JsonProperty("dispute_type")]
    public byte? Dispute_Type { get; set; }

    [JsonProperty("applicant_type")]
    public byte? Applicant_Type { get; set; }

    [JsonProperty("dispute_status")]
    public byte? Dispute_Status { get; set; }

    [JsonProperty("file_origin")]
    public byte? File_Origin { get; set; }

    [JsonProperty("direct_request")]
    public byte? Direct_Request { get; set; }

    [JsonProperty("joiner_type")]
    public byte? Joiner_Type { get; set; }

    [JsonProperty("filing_fee")]
    public string Filing_Fee { get; set; }

    [JsonProperty("fee_waiver_requested")]
    public byte? Fee_Waiver_Requested { get; set; }

    [JsonProperty("fee_refund")]
    public string Fee_Refund { get; set; }

    [JsonProperty("dispute_unit_site")]
    public string Dispute_Unit_Site { get; set; }

    [JsonProperty("dispute_address")]
    public string Dispute_Address { get; set; }

    [JsonProperty("dispute_city")]
    public string Dispute_City { get; set; }

    [JsonProperty("dispute_postal_code")]
    public string Dispute_Postal_Code { get; set; }

    [JsonProperty("monetary_order")]
    public string Monetary_Order { get; set; }

    [JsonProperty("date_nte_served")]
    public string Date_NTE_Served { get; set; }

    [JsonProperty("fee_recovery_requested")]
    public byte? Fee_Recovery_Requested { get; set; }

    [JsonProperty("how_it_was_served")]
    public string How_It_Was_Served { get; set; }

    [JsonProperty("dispute_codes")]
    public string Dispute_Codes { get; set; }

    [JsonProperty("details_of_the_dispute")]
    public string Details_of_the_Dispute { get; set; }

    [JsonProperty("hearing_date")]
    public string Hearing_Date { get; set; }

    [JsonProperty("hearing_time")]
    public string Hearing_Time { get; set; }

    [JsonProperty("hearing_type")]
    public byte? Hearing_Type { get; set; }

    [JsonProperty("hearing_location")]
    public string Hearing_Location { get; set; }

    [JsonProperty("cross_app_file_number")]
    public string Cross_App_File_Number { get; set; }

    [JsonProperty("online_cross_app_file_number")]
    public string Online_Cross_App_File_Number { get; set; }

    [JsonProperty("cross_dispute_issues")]
    public string Cross_Dispute_Issues { get; set; }

    [JsonProperty("method_of_service")]
    public byte? Method_of_Service { get; set; }

    [JsonProperty("hearing_pickup")]
    public byte? Hearing_Pickup { get; set; }

    [JsonProperty("office_location")]
    public string Office_Location { get; set; }

    [JsonProperty("dro_code")]
    public string DRO_Code { get; set; }

    [JsonProperty("dro_name")]
    public string DRO_Name { get; set; }

    [JsonProperty("dro_location")]
    public string DRO_Location { get; set; }

    [JsonProperty("conference_bridge_number")]
    public string Conference_Bridge_Number { get; set; }

    [JsonProperty("participant_code")]
    public string Participant_Code { get; set; }

    [JsonProperty("moderator_code")]
    public string Moderator_Code { get; set; }

    [JsonProperty("special_requirements")]
    public string Special_Requirements { get; set; }

    [JsonProperty("wheelchair_access")]
    public byte? Wheelchair_Access { get; set; }

    [JsonProperty("hearing_duration")]
    public int? Hearing_Duration { get; set; }

    [JsonProperty("decision_staff_code")]
    public string Decision_Staff_Code { get; set; }

    [JsonProperty("sections_applied")]
    public string Sections_Applied { get; set; }

    [JsonProperty("decision_details")]
    public byte? Decision_Details { get; set; }

    [JsonProperty("arbitrator_comments")]
    public string Arbitrator_Comments { get; set; }

    [JsonProperty("method_of_resolution")]
    public byte? Method_of_Resolution { get; set; }

    [JsonProperty("outcome_commercial_landlord")]
    public byte? Outcome_Commercial_Landlord { get; set; }

    [JsonProperty("decision_issue_date")]
    public string Decision_Issue_Date { get; set; }

    [JsonProperty("monetary_amount_requested")]
    public string Monetary_Amount_Requested { get; set; }

    [JsonProperty("monetary_amount_awarded")]
    public string Monetary_Amount_Awarded { get; set; }

    [JsonProperty("order_of_possession")]
    public byte? Order_of_Possession { get; set; }

    [JsonProperty("order_of_possession_date")]
    public string Order_of_Possession_Date { get; set; }

    [JsonProperty("order_effective")]
    public byte? Order_Effective { get; set; }

    [JsonProperty("fee_repayment_ordered")]
    public byte? Fee_Repayment_Ordered { get; set; }

    [JsonProperty("rent_redirection_ordered")]
    public byte? Rent_Redirection_Ordered { get; set; }

    [JsonProperty("first_review_requested_by")]
    public byte? First_Review_Requested_By { get; set; }

    [JsonProperty("first_results_of_review")]
    public string First_Results_Of_Review { get; set; }

    [JsonProperty("first_grounds_for_review")]
    public byte? First_Grounds_For_Review { get; set; }

    [JsonProperty("second_review_requested_By")]
    public byte? Second_Review_Requested_By { get; set; }

    [JsonProperty("second_results_of_review")]
    public string Second_Results_Of_Review { get; set; }

    [JsonProperty("second_grounds_for_review")]
    public byte? Second_Grounds_For_Review { get; set; }

    [JsonProperty("rtb_location")]
    public string RTB_Location { get; set; }

    [JsonProperty("created_date")]
    public string Created_Date { get; set; }

    [JsonProperty("submitter")]
    public string Submitter { get; set; }

    [JsonProperty("submitted_date")]
    public string Submitted_Date { get; set; }

    [JsonProperty("last_modified_by")]
    public string Last_Modified_By { get; set; }

    [JsonProperty("last_modified_date")]
    public string Last_Modified_Date { get; set; }

    [JsonProperty("archive")]
    public byte? Archive { get; set; }

    [JsonProperty("new_date")]
    public string New_Date { get; set; }

    [JsonProperty("date_terminated")]
    public string Date_Terminated { get; set; }

    [JsonProperty("dr_pending_date")]
    public string DR_Pending_Date { get; set; }

    [JsonProperty("needs_update_date")]
    public string Needs_Update_Date { get; set; }

    [JsonProperty("ready_to_pay_date")]
    public string Ready_To_Pay_Date { get; set; }

    [JsonProperty("approved_date")]
    public string Approved_Date { get; set; }

    [JsonProperty("scheduled_date")]
    public string Scheduled_Date { get; set; }

    [JsonProperty("rescheduled_date")]
    public string Rescheduled_Date { get; set; }

    [JsonProperty("adjourned_date")]
    public string Adjourned_Date { get; set; }

    [JsonProperty("closed_date")]
    public string Closed_Date { get; set; }

    [JsonProperty("cancelled_date")]
    public string Cancelled_Date { get; set; }

    [JsonProperty("reopened_1_date")]
    public string Reopened_1_Date { get; set; }

    [JsonProperty("reopened_2_date")]
    public string Reopened_2_Date { get; set; }

    [JsonProperty("abandoned_date")]
    public string Abandoned_Date { get; set; }

    [JsonProperty("notes")]
    public string Notes { get; set; }

    [JsonProperty("notes_history")]
    public string Notes_History { get; set; }

    [JsonProperty("dispute_province")]
    public string Dispute_Province { get; set; }

    [JsonProperty("additional_rent_increase")]
    public byte? Additional_Rent_Increase { get; set; }

    [JsonProperty("service_code")]
    public string Service_Code { get; set; }

    [JsonProperty("corrections_clarifications")]
    public List<CorrectionsClarification> CorrectionsClarifications { get; set; }

    [JsonProperty("joiner_applications")]
    public List<JoinerApplication> JoinerApplications { get; set; }

    [JsonProperty("applicants")]
    public List<Participant> Applicants { get; set; }

    [JsonProperty("agents")]
    public List<Participant> Agents { get; set; }

    [JsonProperty("respondents")]
    public List<Participant> Respondents { get; set; }
}

public class CorrectionsClarification
{
    [JsonProperty("comment_type")]
    public byte? Comment_Type { get; set; }

    [JsonProperty("comment_submitted_date")]
    public string Comment_Submitted_Date { get; set; }

    [JsonProperty("comment_submitter")]
    public string Comment_Submitter { get; set; }

    [JsonProperty("comment")]
    public string Comment { get; set; }
}

public class JoinerApplication
{
    [JsonProperty("joiner_type")]
    public byte? Joiner_Type { get; set; }

    [JsonProperty("joiner_file_number")]
    public string Joiner_File_Number { get; set; }
}

public class Participant
{
    [JsonProperty("first_name")]
    public string First_Name { get; set; }

    [JsonProperty("last_name")]
    public string Last_Name { get; set; }

    [JsonProperty("email_address")]
    public string Email_Address { get; set; }

    [JsonProperty("unit")]
    public string Unit { get; set; }

    [JsonProperty("street_address")]
    public string Street_Address { get; set; }

    [JsonProperty("mailing_address")]
    public string Mailing_Address { get; set; }

    [JsonProperty("city")]
    public string City { get; set; }

    [JsonProperty("province")]
    public string Province { get; set; }

    [JsonProperty("country")]
    public string Country { get; set; }

    [JsonProperty("postal_code")]
    public string Postal_Code { get; set; }

    [JsonProperty("daytime_area")]
    public string DayTime_Area { get; set; }

    [JsonProperty("daytime_phone")]
    public string DayTime_Phone { get; set; }

    [JsonProperty("other_area")]
    public string Other_Area { get; set; }

    [JsonProperty("other_phone")]
    public string Other_Phone { get; set; }

    [JsonProperty("fax_area")]
    public string Fax_Area { get; set; }

    [JsonProperty("fax_number")]
    public string Fax_Number { get; set; }

    [JsonProperty("preferred")]
    public byte? Preferred { get; set; }

    [JsonProperty("commercial_landlord")]
    public byte? Commercial_landlord { get; set; }

    [JsonProperty("agent_for")]
    public string Agent_For { get; set; }
}