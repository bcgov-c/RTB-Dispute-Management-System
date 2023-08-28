using AutoMapper;
using CM.Business.Entities.Models.SubmissionReceipt;
using CM.Common.Utilities;

namespace CM.Business.Services.Mapping;

public class SubmissionReceiptMapping : Profile
{
    public SubmissionReceiptMapping()
    {
        CreateMap<Data.Model.SubmissionReceipt, SubmissionReceiptPatchRequest>();
        CreateMap<SubmissionReceiptPatchRequest, Data.Model.SubmissionReceipt>();
        CreateMap<SubmissionReceiptPostRequest, Data.Model.SubmissionReceipt>();
        CreateMap<Data.Model.SubmissionReceipt, SubmissionReceiptPostResponse>()
            .ForMember(x => x.ReceiptDate, opt => opt.MapFrom(src => src.ReceiptDate.ToCmDateTimeString()))
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));

        CreateMap<Data.Model.SubmissionReceipt, ExternalSubmissionReceipt>()
            .ForMember(x => x.ReceiptDate, opt => opt.MapFrom(src => src.ReceiptDate.ToCmDateTimeString()))
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));
    }
}