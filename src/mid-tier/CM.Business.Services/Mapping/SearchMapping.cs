using AutoMapper;
using CM.Business.Entities.Models.Search;
using CM.Common.Utilities;
using CM.Data.Model.Search;
using CM.Data.Repositories.Search;

namespace CM.Business.Services.Mapping;

public class SearchMapping : Profile
{
    public SearchMapping()
    {
        CreateMap<DisputeInfoSearchRequest, DisputeInfoSearchResultRequest>();
        CreateMap<ParticipantSearchRequest, ParticipantSearchResultRequest>();
        CreateMap<DisputeStatusSearchRequest, DisputeInfoSearchResultRequest>();
        CreateMap<HearingSearchRequest, HearingSearchResultRequest>();
        CreateMap<ClaimsSearchRequest, ClaimsSearchResultRequest>();
        CreateMap<CrossApplicationSearchRequest, CrossApplicationSearchResultRequest>();
        CreateMap<CrossApplicationParticipantRequest, CrossApplicationParticipantSearchResultRequest>();
        CreateMap<SearchRequestBase, CrossApplicationSourceDisputeRequest>();

        CreateMap<SearchResult, CrossApplicationSearchResponse>();
        CreateMap<CrossApplicationSourceDispute, CrossApplicationSourceDisputeRequest>();

        CreateMap<SearchResult, SearchResponse>()
            .ForMember(x => x.SubmittedDate, opt => opt.MapFrom(src => src.SubmittedDate.ToCmDateTimeString()))
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.StatusStartDate, opt => opt.MapFrom(src => src.StatusStartDate.ToCmDateTimeString()))
            .ForMember(x => x.IntakePaymentDatePaid, opt => opt.MapFrom(src => src.IntakePaymentDatePaid.ToCmDateTimeString()))
            .ForMember(x => x.NoticeGeneratedDate, opt => opt.MapFrom(src => src.NoticeGeneratedDate.ToCmDateTimeString()))
            .ForMember(x => x.LocalStartDateTime, opt => opt.MapFrom(src => src.Hearing.LocalStartDateTime.ToCmDateTimeString()))
            .ForMember(x => x.HearingStartDateTime, opt => opt.MapFrom(src => src.Hearing.HearingStartDateTime.ToCmDateTimeString()))
            .ForMember(x => x.HearingOwner, opt => opt.MapFrom(src => src.Hearing.HearingOwner))
            .ForMember(x => x.HearingType, opt => opt.MapFrom(src => src.Hearing.HearingType))
            .ForMember(x => x.DisputeLastModifiedDate, opt => opt.MapFrom(src => src.DisputeLastModifiedDate.ToCmDateTimeString()));
        CreateMap<ClaimSearchResult, ClaimSearchResponse>();

        CreateMap<DisputeStatusSearchRequest, DisputeStatusSearchResultRequest>();
    }
}