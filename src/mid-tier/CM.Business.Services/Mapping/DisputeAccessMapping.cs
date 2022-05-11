using AutoMapper;
using CM.Business.Entities.Models.AccessCode;
using CM.Common.Utilities;
using CM.Data.Model;

namespace CM.Business.Services.Mapping;

public class DisputeAccessMapping : Profile
{
    public DisputeAccessMapping()
    {
        CreateMap<Dispute, DisputeAccessResponse>()
            .ForMember(x => x.SubmittedDate, opt => opt.MapFrom(src => src.SubmittedDate.ToCmDateTimeString()))
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.InitialPaymentDate, opt => opt.MapFrom(src => src.InitialPaymentDate.ToCmDateTimeString()));

        CreateMap<Participant, DisputeAccessParticipant>()
            .ForMember(x => x.AccessCode, opt => opt.MapFrom(src => src.AccessCode.ToAccessCodeHint()))
            .ForMember(x => x.AcceptedTouDate, opt => opt.MapFrom(src => src.AcceptedTouDate.ToCmDateTimeString()));

        CreateMap<Claim, DisputeAccessClaim>();
        CreateMap<ClaimDetail, DisputeAccessClaimDetail>();
        CreateMap<Remedy, DisputeAccessRemedy>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()));
        CreateMap<FileDescription, DisputeAccessFileDescription>();
        CreateMap<LinkedFile, DisputeAccessLinkedFile>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()));
        CreateMap<Data.Model.NoticeService, DisputeAccessNoticeService>()
            .ForMember(x => x.ServiceDate, opt => opt.MapFrom(src => src.ServiceDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));

        CreateMap<DisputeFee, DisputeAccessDisputeFee>()
            .ForMember(x => x.DatePaid, opt => opt.MapFrom(src => src.DatePaid.ToCmDateTimeString()))
            .ForMember(x => x.DueDate, opt => opt.MapFrom(src => src.DueDate.ToCmDateTimeString()))
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));

        CreateMap<PaymentTransaction, DisputeAccessPaymentTransaction>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));
    }
}