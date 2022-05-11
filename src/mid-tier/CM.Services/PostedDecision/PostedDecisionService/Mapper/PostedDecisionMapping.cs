using AutoMapper;
using CM.Common.Utilities;
using CM.Messages.PostedDecision.Events;
using CM.Services.PostedDecision.PostedDecisionDataService.Entities;
using CM.Services.PostedDecision.PostedDecisionDataService.Models;

namespace CM.Services.PostedDecision.PostedDecisionDataService.Mapper;

public class PostedDecisionMapping : Profile
{
    public PostedDecisionMapping()
    {
        CreateMap<PostedDecisionDataProcessingEvent, Models.PostedDecision>();

        CreateMap<PostedDecisionSearchRequest, Models.PostedDecision>();
        CreateMap<Models.PostedDecision, PostedDecisionResponse>()
            .ForMember(x => x.ApplicationSubmittedDate, opt => opt.MapFrom(src => src.ApplicationSubmittedDate.ToCmDateTimeString()))
            .ForMember(x => x.DecisionDate, opt => opt.MapFrom(src => src.DecisionDate.ToCmDateTimeString()))
            .ForMember(x => x.OriginalNoticeDate, opt => opt.MapFrom(src => src.OriginalNoticeDate.ToCmDateTimeString()))
            .ForMember(x => x.PostingDate, opt => opt.MapFrom(src => src.PostingDate.ToCmDateTimeString()))
            .ForMember(x => x.UrlExpirationDate, opt => opt.MapFrom(src => src.UrlExpirationDate.ToCmDateTimeString()))
            .ForMember(x => x.TenancyEndDate, opt => opt.MapFrom(src => src.TenancyEndDate.ToCmDateTimeString()))
            .ForMember(x => x.TenancyStartDate, opt => opt.MapFrom(src => src.TenancyStartDate.ToCmDateTimeString()));

        CreateMap<PostedDecisionOutcome, PostedDecisionOutcomeResponse>()
            .ForMember(x => x.PostingDate, opt => opt.MapFrom(src => src.PostingDate.ToCmDateTimeString()));

        CreateMap<PostedDecisionIndex, Models.PostedDecision>();

        CreateMap<Models.PostedDecision, PostedDecisionIndex>();
    }
}