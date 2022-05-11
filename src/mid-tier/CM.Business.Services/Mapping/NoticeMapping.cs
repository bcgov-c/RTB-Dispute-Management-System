using AutoMapper;
using CM.Business.Entities.Models.AccessCode;
using CM.Business.Entities.Models.ExternalUpdate;
using CM.Business.Entities.Models.Notice;
using CM.Business.Entities.Models.NoticeService;
using CM.Common.Utilities;

namespace CM.Business.Services.Mapping;

public class NoticeMapping : Profile
{
    public NoticeMapping()
    {
        CreateMap<NoticePostRequest, Data.Model.Notice>();
        CreateMap<Data.Model.Notice, NoticePostRequest>();

        CreateMap<NoticePatchRequest, Data.Model.Notice>();
        CreateMap<Data.Model.Notice, NoticePatchRequest>();

        CreateMap<Data.Model.Notice, NoticeResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.NoticeDeliveredDate, opt => opt.MapFrom(src => src.NoticeDeliveredDate.ToCmDateTimeString()));

        CreateMap<NoticeServiceRequest, Data.Model.NoticeService>();
        CreateMap<NoticeServicePatchRequest, Data.Model.NoticeService>();
        CreateMap<Data.Model.NoticeService, NoticeServiceRequest>();
        CreateMap<Data.Model.NoticeService, NoticeServicePatchRequest>();
        CreateMap<ExternalUpdateNoticeServiceRequest, Data.Model.NoticeService>();
        CreateMap<Data.Model.NoticeService, ExternalUpdateNoticeServiceRequest>();
        CreateMap<Data.Model.NoticeService, NoticeServiceResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.ServiceDate, opt => opt.MapFrom(src => src.ServiceDate.ToCmDateTimeString()))
            .ForMember(x => x.ReceivedDate, opt => opt.MapFrom(src => src.ReceivedDate.ToCmDateTimeString()))
            .ForMember(x => x.ArchiveServiceDate, opt => opt.MapFrom(src => src.ArchiveServiceDate.ToCmDateTimeString()))
            .ForMember(x => x.ArchiveReceivedDate, opt => opt.MapFrom(src => src.ArchiveReceivedDate.ToCmDateTimeString()));
        CreateMap<Data.Model.NoticeService, ExternalsUpdateNoticeServiceResponse>()
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.ServiceDate, opt => opt.MapFrom(src => src.ServiceDate.ToCmDateTimeString()));

        CreateMap<Data.Model.NoticeService, DisputeAccessNoticeService>()
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.ServiceDate, opt => opt.MapFrom(src => src.ServiceDate.ToCmDateTimeString()));
    }
}