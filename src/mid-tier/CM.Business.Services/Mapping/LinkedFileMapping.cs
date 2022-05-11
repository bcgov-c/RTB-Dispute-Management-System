using AutoMapper;
using CM.Business.Entities.Models.Files;
using CM.Common.Utilities;
using CM.Data.Model;

namespace CM.Business.Services.Mapping;

public class LinkedFileMapping : Profile
{
    public LinkedFileMapping()
    {
        CreateMap<LinkedFileRequest, LinkedFile>();

        CreateMap<LinkedFile, LinkedFileResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));
        CreateMap<LinkedFile, LinkedFileRequest>();
    }
}