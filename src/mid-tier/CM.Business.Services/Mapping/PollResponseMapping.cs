using AutoMapper;
using CM.Business.Entities.Models.PollResponse;
using CM.Common.Utilities;

namespace CM.Business.Services.Mapping
{
    public class PollResponseMapping : Profile
    {
        public PollResponseMapping()
        {
            CreateMap<PollRespRequest, Data.Model.PollResponse>();
            CreateMap<Data.Model.PollResponse, PollRespResponse>()
                .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
                .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
                .ForMember(x => x.ResponseDate, opt => opt.MapFrom(src => src.ResponseDate.ToCmDateTimeString()));

            CreateMap<PollRespPatchRequest, Data.Model.PollResponse>();
            CreateMap<Data.Model.PollResponse, PollRespPatchRequest>();
        }
    }
}
