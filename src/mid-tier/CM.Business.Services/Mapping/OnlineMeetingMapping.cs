using AutoMapper;
using CM.Business.Entities.Models.OnlineMeeting;
using CM.Common.Utilities;

namespace CM.Business.Services.Mapping
{
    public class OnlineMeetingMapping : Profile
    {
        public OnlineMeetingMapping()
        {
            CreateMap<Data.Model.OnlineMeeting, OnlineMeetingResponse>()
                .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
                .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));
            CreateMap<OnlineMeetingPostRequest, Data.Model.OnlineMeeting>();

            CreateMap<Data.Model.OnlineMeeting, OnlineMeetingPatchRequest>();
            CreateMap<OnlineMeetingPatchRequest, Data.Model.OnlineMeeting>();

            CreateMap<Data.Model.DisputeLink, DisputeLinkResponse>()
                .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
                .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));
            CreateMap<DisputeLinkPostRequest, Data.Model.DisputeLink>();

            CreateMap<Data.Model.DisputeLink, DisputeLinkPatchRequest>();
            CreateMap<DisputeLinkPatchRequest, Data.Model.DisputeLink>();
        }
    }
}
