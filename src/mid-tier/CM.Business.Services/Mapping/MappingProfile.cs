using AutoMapper;

namespace CM.Business.Services.Mapping;

public static class MappingProfile
{
    public static IMapper Init()
    {
        var config = new MapperConfiguration(cfg =>
        {
            cfg.AddProfile(new UserMapping());
            cfg.AddProfile(new IntakeQuestionMapping());
            cfg.AddProfile(new DisputeMapping());
            cfg.AddProfile(new PartiesMapping());
            cfg.AddProfile(new AuditLogMapping());
            cfg.AddProfile(new ClaimMapping());
            cfg.AddProfile(new RemedyMapping());
            cfg.AddProfile(new EmailMessageMapping());
            cfg.AddProfile(new EmailTemplateMapping());
            cfg.AddProfile(new PaymentMapping());
            cfg.AddProfile(new HearingMapping());
            cfg.AddProfile(new HearingAuditLogMapping());
            cfg.AddProfile(new HearingParticipationMapping());
            cfg.AddProfile(new FilesMapping());
            cfg.AddProfile(new LinkedFileMapping());
            cfg.AddProfile(new CommonFileMapping());
            cfg.AddProfile(new SearchMapping());
            cfg.AddProfile(new NoticeMapping());
            cfg.AddProfile(new InternalUserRoleMapping());
            cfg.AddProfile(new InternalUserProfileMapping());
            cfg.AddProfile(new AmendmentMapping());
            cfg.AddProfile(new EmailAttachmentMapping());
            cfg.AddProfile(new NoteMapping());
            cfg.AddProfile(new TaskMapping());
            cfg.AddProfile(new MaintenanceMapping());
            cfg.AddProfile(new FilePackageMapping());
            cfg.AddProfile(new FilePackageServiceMapping());
            cfg.AddProfile(new SettingMapping());
            cfg.AddProfile(new OutcomeDocumentMapping());
            cfg.AddProfile(new AutoTextMapping());
            cfg.AddProfile(new CmsArchiveMapping());
            cfg.AddProfile(new ConferenceBridgeMapping());
            cfg.AddProfile(new DisputeHearingMapping());
            cfg.AddProfile(new HearingReportingMapping());
            cfg.AddProfile(new SiteVersionMapping());
            cfg.AddProfile(new OfficeUserMapping());
            cfg.AddProfile(new DisputeAccessMapping());
            cfg.AddProfile(new DisputeProcessDetailMapping());
            cfg.AddProfile(new SubstitutedServiceMapping());
            cfg.AddProfile(new CustomDataObjectMapping());
            cfg.AddProfile(new SchedulePeriodMapping());
            cfg.AddProfile(new ScheduleBlockMapping());
            cfg.AddProfile(new ScheduleRequestMapping());
            cfg.AddProfile(new SubmissionReceiptMapping());
            cfg.AddProfile(new DisputeFlagMapping());
            cfg.AddProfile(new TrialMapping());
            cfg.AddProfile(new TrialDisputeMapping());
            cfg.AddProfile(new TrialParticipantMapping());
            cfg.AddProfile(new TrialInterventionMapping());
            cfg.AddProfile(new TrialOutcomeMapping());
            cfg.AddProfile(new CustomConfigObjectMapping());
            cfg.AddProfile(new ExternalCustomDataObjectMapping());
            cfg.AddProfile(new ExternalFilesMapping());
            cfg.AddProfile(new ServiceAuditLogMapping());
            cfg.AddProfile(new ExternalErrorLogMapping());
            cfg.AddProfile(new PollMapping());
            cfg.AddProfile(new PollResponseMapping());
            cfg.AddProfile(new ParticipantIdentityMapping());
            cfg.AddProfile(new OnlineMeetingMapping());
            cfg.AddProfile(new DisputeVerificationMapping());
        });

        return config.CreateMapper();
    }
}