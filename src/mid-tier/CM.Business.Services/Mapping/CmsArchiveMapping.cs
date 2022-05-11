using AutoMapper;
using CM.Business.Entities.Models.CmsArchive;
using CM.Common.Utilities;
using CM.Data.Model;

namespace CM.Business.Services.Mapping;

public class CmsArchiveMapping : Profile
{
    public CmsArchiveMapping()
    {
        CreateMap<CMSFile, FileResponse>()
            .ForMember(x => x.Created_Date, opt => opt.MapFrom(src => src.Created_Date.ToCmDateTimeString()));

        CreateMap<CMSArchiveNote, ArchiveNote>()
            .ForMember(x => x.Created_Date, opt => opt.MapFrom(src => src.Created_Date.ToCmDateTimeString()));

        CreateMap<DataModel, CmsRecord>()
            .ForMember(x => x.Date_NTE_Served, opt => opt.MapFrom(src => src.Date_NTE_Served.ToCmDateTimeString()))
            .ForMember(x => x.Hearing_Date, opt => opt.MapFrom(src => src.Hearing_Date.ToCmDateTimeString()))
            .ForMember(x => x.Decision_Issue_Date, opt => opt.MapFrom(src => src.Decision_Issue_Date.ToCmDateTimeString()))
            .ForMember(x => x.Order_of_Possession_Date, opt => opt.MapFrom(src => src.Order_of_Possession_Date.ToCmDateTimeString()))
            .ForMember(x => x.Created_Date, opt => opt.MapFrom(src => src.Created_Date.ToCmDateTimeString()))
            .ForMember(x => x.Submitted_Date, opt => opt.MapFrom(src => src.Submitted_Date.ToCmDateTimeString()))
            .ForMember(x => x.Last_Modified_Date, opt => opt.MapFrom(src => src.Last_Modified_Date.ToCmDateTimeString()))
            .ForMember(x => x.New_Date, opt => opt.MapFrom(src => src.New_Date.ToCmDateTimeString()))
            .ForMember(x => x.Date_Terminated, opt => opt.MapFrom(src => src.Date_Terminated.ToCmDateTimeString()))
            .ForMember(x => x.DR_Pending_Date, opt => opt.MapFrom(src => src.DR_Pending_Date.ToCmDateTimeString()))
            .ForMember(x => x.Needs_Update_Date, opt => opt.MapFrom(src => src.Needs_Update_Date.ToCmDateTimeString()))
            .ForMember(x => x.Ready_To_Pay_Date, opt => opt.MapFrom(src => src.Ready_To_Pay_Date.ToCmDateTimeString()))
            .ForMember(x => x.Approved_Date, opt => opt.MapFrom(src => src.Approved_Date.ToCmDateTimeString()))
            .ForMember(x => x.Scheduled_Date, opt => opt.MapFrom(src => src.Scheduled_Date.ToCmDateTimeString()))
            .ForMember(x => x.Rescheduled_Date, opt => opt.MapFrom(src => src.Rescheduled_Date.ToCmDateTimeString()))
            .ForMember(x => x.Adjourned_Date, opt => opt.MapFrom(src => src.Adjourned_Date.ToCmDateTimeString()))
            .ForMember(x => x.Closed_Date, opt => opt.MapFrom(src => src.Closed_Date.ToCmDateTimeString()))
            .ForMember(x => x.Cancelled_Date, opt => opt.MapFrom(src => src.Cancelled_Date.ToCmDateTimeString()))
            .ForMember(x => x.Reopened_1_Date, opt => opt.MapFrom(src => src.Reopened_1_Date.ToCmDateTimeString()))
            .ForMember(x => x.Reopened_2_Date, opt => opt.MapFrom(src => src.Reopened_2_Date.ToCmDateTimeString()))
            .ForMember(x => x.Abandoned_Date, opt => opt.MapFrom(src => src.Abandoned_Date.ToCmDateTimeString()));

        CreateMap<CMSCorrection, CorrectionsClarification>()
            .ForMember(x => x.Comment_Submitted_Date, opt => opt.MapFrom(src => src.Comment_Submitted_Date.ToCmDateTimeString()));

        CreateMap<CMSParticipant, Entities.Models.CmsArchive.Participant>();

        CreateMap<CmsArchiveNoteRequest, CMSArchiveNote>();
        CreateMap<CMSArchiveNote, CmsArchiveNoteResponse>()
            .ForMember(x => x.Created_Date, opt => opt.MapFrom(src => src.Created_Date.ToCmDateTimeString()));

        CreateMap<CmsRecordRequest, DataModel>();
        CreateMap<DataModel, CmsRecordRequest>();
    }
}