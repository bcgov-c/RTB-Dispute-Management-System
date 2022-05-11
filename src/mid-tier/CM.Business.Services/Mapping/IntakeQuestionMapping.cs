using AutoMapper;
using CM.Business.Entities.Models.IntakeQuestion;
using CM.Common.Utilities;
using CM.Data.Model;

namespace CM.Business.Services.Mapping;

public class IntakeQuestionMapping : Profile
{
    public IntakeQuestionMapping()
    {
        CreateMap<IntakeQuestion, IntakeQuestionResponse>()
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));

        CreateMap<IntakeQuestion, IntakeQuestionRequest>();

        CreateMap<IntakeQuestionRequest, IntakeQuestion>();
    }
}