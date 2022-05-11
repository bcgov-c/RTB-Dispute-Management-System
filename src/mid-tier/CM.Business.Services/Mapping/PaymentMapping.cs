using AutoMapper;
using CM.Business.Entities.Models.Payment;
using CM.Common.Utilities;
using CM.Data.Model;

namespace CM.Business.Services.Mapping;

public class PaymentMapping : Profile
{
    public PaymentMapping()
    {
        CreateMap<DisputeFeeRequest, DisputeFee>();
        CreateMap<PostDisputeFeeRequest, DisputeFee>();
        CreateMap<PatchDisputeFeeRequest, DisputeFee>();

        CreateMap<DisputeFee, DisputeFeeResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.DatePaid, opt => opt.MapFrom(src => src.DatePaid.ToCmDateTimeString()))
            .ForMember(x => x.DueDate, opt => opt.MapFrom(src => src.DueDate.ToCmDateTimeString()));
        CreateMap<DisputeFee, GetDisputeFeeResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.DatePaid, opt => opt.MapFrom(src => src.DatePaid.ToCmDateTimeString()))
            .ForMember(x => x.DueDate, opt => opt.MapFrom(src => src.DueDate.ToCmDateTimeString()));
        CreateMap<DisputeFee, DisputeFeeRequest>();
        CreateMap<DisputeFee, PatchDisputeFeeRequest>();

        CreateMap<PaymentTransactionRequest, PaymentTransaction>();
        CreateMap<PaymentTransactionPostRequest, PaymentTransaction>();
        CreateMap<PaymentTransactionPatchRequest, PaymentTransaction>();

        CreateMap<PaymentTransaction, PaymentTransactionResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.TrnDate, opt => opt.MapFrom(src => src.TrnDate.ToCmDateTimeString()))
            .ForMember(x => x.TrnReqDate, opt => opt.MapFrom(src => src.TrnReqDate.ToCmDateTimeString()))
            .ForMember(x => x.ReconcileDate, opt => opt.MapFrom(src => src.ReconcileDate.ToCmDateTimeString()));
        CreateMap<PaymentTransaction, PaymentTransactionForReport>();
        CreateMap<PaymentTransactionForReport, PaymentTransaction>();
        CreateMap<PaymentTransaction, PaymentTransactionRequest>();
        CreateMap<PaymentTransaction, PaymentTransactionPatchRequest>();

        CreateMap<BamboraTransaction, PaymentTransaction>()
            .ForMember(x => x.CardType, opt => opt.MapFrom(src => src.TrnCardType))
            .ForMember(x => x.TrnId, opt => opt.MapFrom(src => src.TrnId))
            .ForMember(x => x.TrnApproved, opt => opt.MapFrom(src => src.TrnApproved))
            .ForMember(x => x.TrnResponse, opt => opt.MapFrom(src => src.TrnMessageId))
            .ForMember(x => x.TrnType, opt => opt.MapFrom(src => src.TrnType))
            .ForMember(x => x.TrnDate, opt => opt.MapFrom(src => src.ProcessedDate))
            .ForMember(x => x.TrnReqDate, opt => opt.MapFrom(src => src.ProcessedDate))
            .ForMember(x => x.TransactionAmount, opt => opt.MapFrom(src => src.RegularAmount))
            .ForMember(x => x.DisplayMsg, opt => opt.MapFrom(src => src.TrnMessageText))
            .ForMember(x => x.CardType, opt => opt.MapFrom(src => src.TrnCardType));
    }
}