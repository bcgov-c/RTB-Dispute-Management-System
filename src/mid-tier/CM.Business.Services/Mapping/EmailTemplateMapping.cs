using AutoMapper;
using CM.Business.Entities.Models.EmailTemplate;
using CM.Common.Utilities;

namespace CM.Business.Services.Mapping;

public class EmailTemplateMapping : Profile
{
    public EmailTemplateMapping()
    {
        CreateMap<EmailTemplateRequest, Data.Model.EmailTemplate>();
        CreateMap<Data.Model.EmailTemplate, EmailTemplateRequest>();

        CreateMap<Data.Model.EmailTemplate, EmailTemplateResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));
    }
}