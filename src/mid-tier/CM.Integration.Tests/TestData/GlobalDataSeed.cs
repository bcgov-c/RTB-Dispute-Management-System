using System;
using System.IO;
using System.Net.Http;
using System.Reflection;
using System.Text;
using CM.Business.Entities.Models.EmailTemplate;
using CM.Common.Utilities;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;

namespace CM.Integration.Tests.TestData;

public class GlobalDataSeed
{
    private HttpClient Client { get; set; }

    public void SetupData(HttpClient client)
    {
        Client = client;
        SeedEmailTemplates();
    }

    private static string GetEmailMessageSubject(AssignedTemplate messageType)
    {
        return messageType switch
        {
            AssignedTemplate.ParticipatoryDisputeWaitingForOfficePayment => "File number <file_number>: Application Received",
            AssignedTemplate.ParticipatoryDisputePaymentWaitingForFeeWaiverProof => "File number <file_number>: Proceeding on <hearing_start_date> at <hearing_start_time PST>",
            AssignedTemplate.ParticipatoryApplicationSubmitted => "File number <file_number>: Dispute abandoned",
            AssignedTemplate.PaymentSubmitted => "File number <file_number>: Application Received - Fee Waiver Proof Required",
            AssignedTemplate.ParticipatoryApplicantEvidenceReminder => "File number <file_number>: Application Received - Payment Required",
            AssignedTemplate.ParticipatoryRespondentEvidenceReminder => "File number <file_number>: Evidence Deadline Reminder",
            AssignedTemplate.ParticipatoryHearingReminder => "File number <file_number>: Evidence Deadline Reminder",
            AssignedTemplate.DisputeWithdrawn => "File number <file_number>: Dispute withdrawn",
            AssignedTemplate.DisputeCancelled => "File number <file_number>: Dispute cancelled",
            AssignedTemplate.DisputeAbandonedForNoPaymentWithEmail => "File number <file_number>: Update Received",
            AssignedTemplate.ParticipatoryUpdateSubmitted => "File number <file_number>: Direct Request Application Received",
            AssignedTemplate.EmergRespondentEvidenceReminder => "File number <file_number>: Evidence Deadline Reminder",
            AssignedTemplate.DirectRequestApplicationSubmitted => "File number <file number>: Direct Request Application Received - Payment Required",
            AssignedTemplate.DirectRequestOfficePaymentRequired => "File number <file_number>: Update Received",
            AssignedTemplate.DirectRequestUpdateSubmitted => "File number <file_number>: Payment Receipt",
            AssignedTemplate.DisputeAbandonedDueToApplicantInaction => "File number <file number>: Dispute Abandoned – Applicant Inaction",
            AssignedTemplate.DisputeAbandonedDueToApplicantServiceInaction => "File number <file number>: Dispute Abandoned - Applicant Service Inaction",
            AssignedTemplate.AccessCodeRecovery => "File number <file_number>: Your Personal Access Code",
            AssignedTemplate.AricParticipatoryApplicationSubmitted => "File Number <file-number>: Application Received",
            AssignedTemplate.PfrParticipatoryApplicationSubmitted => "File Number <file-number>: Application Received",
            AssignedTemplate.AricParticipatoryDisputeWaitingForOfficePayment => "File Number <file-number>: Application Received - Payment Required",
            AssignedTemplate.PfrParticipatoryDisputeWaitingForOfficePayment => "File Number <file-number>: Application Received - Payment Required",
            AssignedTemplate.AricParticipatoryUpdateSubmitted => "File Number <file-number>: Update Received",
            AssignedTemplate.PfrParticipatoryUpdateSubmitted => "File Number <file-number>: Update Received",
            AssignedTemplate.AricParticipatoryApplicantEvidenceReminder => "File Number <file-number>: Evidence Deadline Reminder",
            AssignedTemplate.PfrParticipatoryApplicantEvidenceReminder => "File Number <file-number>: Evidence Deadline Reminder",
            _ => throw new ArgumentOutOfRangeException(nameof(messageType), messageType, null)
        };
    }

    private static string GetEmailMessageTitle(AssignedTemplate messageType)
    {
        return messageType switch
        {
            AssignedTemplate.ParticipatoryDisputeWaitingForOfficePayment => "Participatory-SubmittedPaid",
            AssignedTemplate.ParticipatoryDisputePaymentWaitingForFeeWaiverProof => "HearingReminder",
            AssignedTemplate.ParticipatoryApplicationSubmitted => "IntakeAbandonedNoPayment",
            AssignedTemplate.PaymentSubmitted => "Participatory-NeedsFWProof",
            AssignedTemplate.ParticipatoryApplicantEvidenceReminder => "Participatory-PaymentRequired",
            AssignedTemplate.ParticipatoryRespondentEvidenceReminder => "ApplicantEvidenceReminder",
            AssignedTemplate.ParticipatoryHearingReminder => "RespondentEvidenceReminder",
            AssignedTemplate.DisputeWithdrawn => "DisputeWithdrawn",
            AssignedTemplate.DisputeCancelled => "DisputeCancelled",
            AssignedTemplate.DisputeAbandonedForNoPaymentWithEmail => "Participatory-UpdateSubmitted",
            AssignedTemplate.ParticipatoryUpdateSubmitted => "NonParticipatory-OfficePayRequired",
            AssignedTemplate.EmergRespondentEvidenceReminder => "EmergencyParticipatoryRespondentReminder",
            AssignedTemplate.DirectRequestApplicationSubmitted => "NonParticipatory-SubmittedPaid",
            AssignedTemplate.DirectRequestOfficePaymentRequired => "NonParticipatory-UpdateSubmitted",
            AssignedTemplate.DirectRequestUpdateSubmitted => "PaymentReceipt",
            AssignedTemplate.DisputeAbandonedDueToApplicantInaction => "Abandoned-ApplicantInaction",
            AssignedTemplate.DisputeAbandonedDueToApplicantServiceInaction => "Abandoned-ApplicantServiceInaction",
            AssignedTemplate.AccessCodeRecovery => "Access Code Recovery",
            AssignedTemplate.AricParticipatoryApplicationSubmitted => "ARIC-Participatory-SubmittedPaid",
            AssignedTemplate.PfrParticipatoryApplicationSubmitted => "PFR-Participatory-SubmittedPaid",
            AssignedTemplate.AricParticipatoryDisputeWaitingForOfficePayment => "ARIC-Participatory-PaymentRequired",
            AssignedTemplate.PfrParticipatoryDisputeWaitingForOfficePayment => "PFR-Participatory-PaymentRequired",
            AssignedTemplate.AricParticipatoryUpdateSubmitted => "ARIC-Participatory-UpdateSubmitted",
            AssignedTemplate.PfrParticipatoryUpdateSubmitted => "PFR-Participatory-UpdateSubmitted",
            AssignedTemplate.AricParticipatoryApplicantEvidenceReminder => "ARIC-Applicant-EvidenceReminder",
            AssignedTemplate.PfrParticipatoryApplicantEvidenceReminder => "PFR-Applicant-EvidenceReminder",
            _ => throw new ArgumentOutOfRangeException(nameof(messageType), messageType, null)
        };
    }

    private static string GetEmailMessageDescription(AssignedTemplate messageType)
    {
        return messageType switch
        {
            AssignedTemplate.ParticipatoryDisputeWaitingForOfficePayment =>
                @"Dispute is changed from stage:status 0:0 to 2:20 on a dispute with a participatory dispute (process = 1)",
            AssignedTemplate.ParticipatoryDisputePaymentWaitingForFeeWaiverProof =>
                @"All participants with emails are sent a reminder 3 days prior to an active hearing on their dispute.",
            AssignedTemplate.ParticipatoryApplicationSubmitted =>
                @"Dispute is changed from stage:status 0:2 to 0:92",
            AssignedTemplate.PaymentSubmitted =>
                @"Dispute is changed from stage:status 0:0 to 0:3 on a dispute with a participatory dispute (process = 1)",
            AssignedTemplate.ParticipatoryApplicantEvidenceReminder =>
                @"Dispute is changed from stage:status 0:0 to 0:4 on a dispute with a participatory dispute (process = 1)",
            AssignedTemplate.ParticipatoryRespondentEvidenceReminder =>
                @"Primary applicants with email addresses are sent a reminder 21 days prior to an active hearing on their dispute - 7 days prior to the 14 day cutoff for submitting evidence.",
            AssignedTemplate.ParticipatoryHearingReminder =>
                @"All respondents with email addresses are sent a reminder 14 days prior to an active hearing on their dispute - 7 days prior to the 7 day cutoff for submitting evidence.",
            AssignedTemplate.DisputeWithdrawn =>
                "Dispute is changed from any stage:status to 0:90",
            AssignedTemplate.DisputeCancelled =>
                "Dispute is changed from any stage:status to 2:91",
            AssignedTemplate.DisputeAbandonedForNoPaymentWithEmail =>
                @"Dispute is changed from stage:status 0:0 to 2:20 on a dispute with a participatory dispute (process = 1)",
            AssignedTemplate.ParticipatoryUpdateSubmitted =>
                @"Dispute is changed from stage:status 0:0 to 2:20 on a dispute with a participatory dispute (process = 2)",
            AssignedTemplate.EmergRespondentEvidenceReminder =>
                @"All respondents with email addresses are sent a reminder 14 days prior to an active hearing on their dispute - 7 days prior to the 7 day cutoff for submitting evidence",
            AssignedTemplate.DirectRequestApplicationSubmitted =>
                @"Dispute is changed from stage:status 0:0 to 0:4 on a dispute with a participatory dispute (process = 2)",
            AssignedTemplate.DirectRequestOfficePaymentRequired =>
                @"Dispute is changed from stage:status 0:0 to 2:20 on a dispute with a non-participatory dispute (process = 2)",
            AssignedTemplate.DirectRequestUpdateSubmitted =>
                @"A dispute Fee is changed from IsPaid = false to IsPaid = true",
            AssignedTemplate.DisputeAbandonedDueToApplicantInaction =>
                @"All disputes with a current (latest) stage:status 0:1, 0:6,  that have not had a status change for 21+ days (that would indicate payment) are set to stage:status 0:94 (abandoned applicant inaction)",
            AssignedTemplate.DisputeAbandonedDueToApplicantServiceInaction =>
                @"Dispute is changed from stage:status 4:41 to 4:94 on a dispute with a participatory dispute (process = 1)",
            AssignedTemplate.AccessCodeRecovery => "AccessCodeRecovery",
            AssignedTemplate.AricParticipatoryApplicationSubmitted => "AricParticipatoryApplicationSubmitted",
            AssignedTemplate.PfrParticipatoryApplicationSubmitted => "PfrParticipatoryApplicationSubmitted",
            AssignedTemplate.AricParticipatoryDisputeWaitingForOfficePayment => "AricParticipatoryDisputeWaitingForOfficePayment",
            AssignedTemplate.PfrParticipatoryDisputeWaitingForOfficePayment => "PfrParticipatoryDisputeWaitingForOfficePayment",
            AssignedTemplate.AricParticipatoryUpdateSubmitted => "AricParticipatoryUpdateSubmitted",
            AssignedTemplate.PfrParticipatoryUpdateSubmitted => "PfrParticipatoryUpdateSubmitted",
            AssignedTemplate.AricParticipatoryApplicantEvidenceReminder => "AricParticipatoryApplicantEvidenceReminder",
            AssignedTemplate.PfrParticipatoryApplicantEvidenceReminder => "PfrParticipatoryApplicantEvidenceReminder",
            _ => throw new ArgumentOutOfRangeException(nameof(messageType), messageType, null)
        };
    }

    private static string ReadFileFromResource(string namespaceAndFileName)
    {
        var memory = new MemoryStream();
        using (var stream = Assembly.GetExecutingAssembly().GetManifestResourceStream(namespaceAndFileName))
        {
            stream?.CopyTo(memory);
        }

        memory.Position = 0;
        return Encoding.ASCII.GetString(memory.ToArray());
    }

    private void SeedEmailTemplates()
    {
        Client.Authenticate(Users.Admin, Users.Admin);

        BuildEmailTemplate("01_ParticipatoryDisputeWaitingForOfficePayment.html", AssignedTemplate.ParticipatoryDisputeWaitingForOfficePayment);
        BuildEmailTemplate("02_ParticipatoryDisputePaymentWaitingForFeeWaiverProof.html", AssignedTemplate.ParticipatoryDisputePaymentWaitingForFeeWaiverProof);
        BuildEmailTemplate("03_ParticipatoryApplicationSubmitted.html", AssignedTemplate.ParticipatoryApplicationSubmitted);
        BuildEmailTemplate("04_PaymentSubmitted.html", AssignedTemplate.PaymentSubmitted);
        BuildEmailTemplate("05_ParticipatoryApplicantEvidenceReminder.html", AssignedTemplate.ParticipatoryApplicantEvidenceReminder);
        BuildEmailTemplate("06_ParticipatoryRespondentEvidenceReminder.html", AssignedTemplate.ParticipatoryRespondentEvidenceReminder);
        BuildEmailTemplate("07_ParticipatoryHearingReminder.html", AssignedTemplate.ParticipatoryHearingReminder);
        BuildEmailTemplate("08_DisputeWithdrawn.html", AssignedTemplate.DisputeWithdrawn);
        BuildEmailTemplate("09_DisputeCancelled.html", AssignedTemplate.DisputeCancelled);
        BuildEmailTemplate("10_DisputeAbandonedForNoPaymentWithEmail.html", AssignedTemplate.DisputeAbandonedForNoPaymentWithEmail);
        BuildEmailTemplate("11_ParticipatoryUpdateSubmitted.html", AssignedTemplate.ParticipatoryUpdateSubmitted);
        BuildEmailTemplate("12_EmergencyParticipatoryRespondentReminder.html", AssignedTemplate.EmergRespondentEvidenceReminder);
        BuildEmailTemplate("14_DirectRequestApplicationSubmitted.html", AssignedTemplate.DirectRequestApplicationSubmitted);
        BuildEmailTemplate("15_DirectRequestOfficePaymentRequired.html", AssignedTemplate.DirectRequestOfficePaymentRequired);
        BuildEmailTemplate("16_DirectRequestUpdateSubmitted.html", AssignedTemplate.DirectRequestUpdateSubmitted);
        BuildEmailTemplate("21_DisputeAbandonedDueToApplicantInaction.html", AssignedTemplate.DisputeAbandonedDueToApplicantInaction);
        BuildEmailTemplate("22_DisputeAbandonedDueToApplicantServiceInaction.html", AssignedTemplate.DisputeAbandonedDueToApplicantServiceInaction);
        BuildEmailTemplate("23_AccessCodeRecovery.html", AssignedTemplate.AccessCodeRecovery);
        BuildEmailTemplate("24_AricParticipatoryApplicationSubmitted.html", AssignedTemplate.AricParticipatoryApplicationSubmitted);
        BuildEmailTemplate("25_PfrParticipatoryApplicationSubmitted.html", AssignedTemplate.PfrParticipatoryApplicationSubmitted);
        BuildEmailTemplate("26_AricParticipatoryDisputeWaitingForOfficePayment.html", AssignedTemplate.AricParticipatoryDisputeWaitingForOfficePayment);
        BuildEmailTemplate("27_PfrParticipatoryDisputeWaitingForOfficePayment.html", AssignedTemplate.PfrParticipatoryDisputeWaitingForOfficePayment);
        BuildEmailTemplate("28_AricParticipatoryUpdateSubmitted.html", AssignedTemplate.AricParticipatoryUpdateSubmitted);
        BuildEmailTemplate("29_PfrParticipatoryUpdateSubmitted.html", AssignedTemplate.PfrParticipatoryUpdateSubmitted);
        BuildEmailTemplate("30_AricParticipatoryApplicantEvidenceReminder.html", AssignedTemplate.AricParticipatoryApplicantEvidenceReminder);
        BuildEmailTemplate("31_PfrParticipatoryApplicantEvidenceReminder.html", AssignedTemplate.PfrParticipatoryApplicantEvidenceReminder);
    }

    private void BuildEmailTemplate(string name, AssignedTemplate assignedTemplateId)
    {
        var emailTemplateRequest = new EmailTemplateRequest
        {
            DefaultRecipientGroup = 1,
            AssignedTemplateId = assignedTemplateId,
            ReplyEmailAddress = "noreply@gmail.com",
            TemplateStatus = 1,
            SubjectLine = GetEmailMessageSubject(assignedTemplateId),
            TemplateHtml = ReadFileFromResource("CM.Integration.Tests.EmailTemplates." + name),
            TemplateTitle = GetEmailMessageTitle(assignedTemplateId),
            TemplateDescription = GetEmailMessageDescription(assignedTemplateId)
        };

        var emailTemplateResponse = EmailTemplateManager.CreateEmailTemplate(Client, emailTemplateRequest);
        emailTemplateResponse.CheckStatusCode();
    }
}