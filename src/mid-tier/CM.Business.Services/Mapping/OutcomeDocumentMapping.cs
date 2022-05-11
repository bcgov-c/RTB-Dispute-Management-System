using AutoMapper;
using CM.Business.Entities.Models.AccessCode;
using CM.Business.Entities.Models.OutcomeDocRequest;
using CM.Business.Entities.Models.OutcomeDocument;
using CM.Common.Utilities;
using CM.Data.Model;

namespace CM.Business.Services.Mapping;

public class OutcomeDocumentMapping : Profile
{
    public OutcomeDocumentMapping()
    {
        CreateMap<OutcomeDocGroupRequest, OutcomeDocGroup>();
        CreateMap<OutcomeDocGroupPatchRequest, OutcomeDocGroup>();
        CreateMap<OutcomeDocGroup, OutcomeDocGroupPatchRequest>();
        CreateMap<OutcomeDocGroup, OutcomeDocGroupFullResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.DocStatusDate, opt => opt.MapFrom(src => src.DocStatusDate.ToCmDateTimeString()))
            .ForMember(x => x.DocCompletedDate, opt => opt.MapFrom(src => src.DocCompletedDate.ToCmDateTimeString()));
        CreateMap<OutcomeDocGroup, OutcomeDocGroupResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.DocStatusDate, opt => opt.MapFrom(src => src.DocStatusDate.ToCmDateTimeString()))
            .ForMember(x => x.DocCompletedDate, opt => opt.MapFrom(src => src.DocCompletedDate.ToCmDateTimeString()));

        CreateMap<OutcomeDocFilePostRequest, OutcomeDocFile>();
        CreateMap<OutcomeDocFilePatchRequest, OutcomeDocFile>();
        CreateMap<OutcomeDocFile, OutcomeDocFilePatchRequest>();
        CreateMap<OutcomeDocFile, OutcomeDocFileResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));
        CreateMap<OutcomeDocFile, OutcomeDocFileFullResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));

        CreateMap<OutcomeDocContentPostRequest, OutcomeDocContent>();
        CreateMap<OutcomeDocContentPatchRequest, OutcomeDocContent>();
        CreateMap<OutcomeDocContent, OutcomeDocContentPatchRequest>();
        CreateMap<OutcomeDocContent, OutcomeDocContentResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));

        CreateMap<OutcomeDocDeliveryPostRequest, OutcomeDocDelivery>();
        CreateMap<OutcomeDocDeliveryPatchRequest, OutcomeDocDelivery>();
        CreateMap<OutcomeDocDelivery, OutcomeDocDeliveryPatchRequest>();

        CreateMap<OutcomeDocDelivery, OutcomeDocDeliveryResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.DeliveryDate, opt => opt.MapFrom(src => src.DeliveryDate.ToCmDateTimeString()))
            .ForMember(x => x.ReceivedDate, opt => opt.MapFrom(src => src.ReceivedDate.ToCmDateTimeString()))
            .ForMember(x => x.ReadyForDeliveryDate, opt => opt.MapFrom(src => src.ReadyForDeliveryDate.ToCmDateTimeString()));

        CreateMap<OutcomeDocGroup, DisputeOutcomeDocGroupResponse>()
            .ForMember(x => x.DocCompletedDate, opt => opt.MapFrom(src => src.DocCompletedDate.ToCmDateTimeString()))
            .ForMember(x => x.AssociatedId, opt => opt.MapFrom(src => src.CreatedBy));
        CreateMap<OutcomeDocFile, GroupDocumentResponse>();

        CreateMap<OutcomeDocRequestRequest, Data.Model.OutcomeDocRequest>();
        CreateMap<Data.Model.OutcomeDocRequest, OutcomeDocRequestResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.RequestDate, opt => opt.MapFrom(src => src.RequestDate.ToCmDateTimeString()))
            .ForMember(x => x.RequestCompletionDate, opt => opt.MapFrom(src => src.RequestCompletionDate.ToCmDateTimeString()))
            .ForMember(x => x.DateDocumentsReceived, opt => opt.MapFrom(src => src.DateDocumentsReceived.ToCmDateTimeString()));

        CreateMap<Data.Model.OutcomeDocRequest, OutcomeDocRequestGetResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.RequestDate, opt => opt.MapFrom(src => src.RequestDate.ToCmDateTimeString()))
            .ForMember(x => x.RequestCompletionDate, opt => opt.MapFrom(src => src.RequestCompletionDate.ToCmDateTimeString()))
            .ForMember(x => x.DateDocumentsReceived, opt => opt.MapFrom(src => src.DateDocumentsReceived.ToCmDateTimeString()));

        CreateMap<Data.Model.OutcomeDocRequest, OutcomeDocRequestPatchRequest>();
        CreateMap<OutcomeDocRequestPatchRequest, Data.Model.OutcomeDocRequest>();

        CreateMap<OutcomeDocRequestItemRequest, OutcomeDocReqItem>();
        CreateMap<OutcomeDocReqItem, OutcomeDocRequestItemResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));

        CreateMap<OutcomeDocReqItem, OutcomeDocRequestItemPatchRequest>();
        CreateMap<OutcomeDocRequestItemPatchRequest, OutcomeDocReqItem>();

        CreateMap<Data.Model.OutcomeDocRequest, DisputeOutcomeDocRequestsResponse>()
            .ForMember(x => x.RequestDate, opt => opt.MapFrom(src => src.RequestDate.ToCmDateTimeString()));
    }
}