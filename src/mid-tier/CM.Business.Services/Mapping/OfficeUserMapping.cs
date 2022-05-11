using AutoMapper;
using CM.Business.Entities.Models.AccessCode;
using CM.Business.Entities.Models.OfficeUser;
using CM.Business.Entities.Models.RemedyDetail;
using CM.Common.Utilities;
using CM.Data.Model;

namespace CM.Business.Services.Mapping;

public class OfficeUserMapping : Profile
{
    public OfficeUserMapping()
    {
        CreateMap<Dispute, DisputeAccessResponse>()
            .ForMember(x => x.SubmittedDate, opt => opt.MapFrom(src => src.SubmittedDate.ToCmDateTimeString()))
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.InitialPaymentDate, opt => opt.MapFrom(src => src.InitialPaymentDate.ToCmDateTimeString()));

        CreateMap<Dispute, OfficeUserDispute>()
            .ForMember(x => x.SubmittedDate, opt => opt.MapFrom(src => src.SubmittedDate.ToCmDateTimeString()))
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.InitialPaymentDate, opt => opt.MapFrom(src => src.InitialPaymentDate.ToCmDateTimeString()))
            .ForMember(x => x.DisputeLastModifiedDate, opt => opt.MapFrom(src => src.DisputeLastModified.LastModifiedDate.ToCmDateTimeString()));

        CreateMap<Dispute, OfficeUserPostDisputeResponse>()
            .ForMember(x => x.SubmittedDate, opt => opt.MapFrom(src => src.SubmittedDate.ToCmDateTimeString()))
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.DisputeLastModifiedDate, opt => opt.MapFrom(src => src.DisputeLastModified.LastModifiedDate.ToCmDateTimeString()));

        CreateMap<Participant, OfficeUserGetDisputeParticipant>()
            .ForMember(x => x.AccessCode, opt => opt.MapFrom(src => src.AccessCode.ToAccessCodeHint()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.AcceptedTouDate, opt => opt.MapFrom(src => src.AcceptedTouDate.ToCmDateTimeString()));

        CreateMap<Participant, DisputeAccessParticipant>()
            .ForMember(x => x.AccessCode, opt => opt.MapFrom(src => src.AccessCode.ToAccessCodeHint()))
            ////.ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.AcceptedTouDate, opt => opt.MapFrom(src => src.AcceptedTouDate.ToCmDateTimeString()));

        CreateMap<Participant, OfficeUserPostDisputeParticipantResponse>()
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.AcceptedTouDate, opt => opt.MapFrom(src => src.AcceptedTouDate.ToCmDateTimeString()));

        CreateMap<Claim, DisputeAccessClaim>();
        CreateMap<Claim, OfficeUserClaim>();
        CreateMap<ClaimDetail, DisputeAccessClaimDetail>();
        CreateMap<ClaimDetail, OfficeUserClaimDetail>();
        CreateMap<ClaimGroup, OfficeUserPostDisputeClaimGroup>();
        CreateMap<Remedy, DisputeAccessRemedy>();
        CreateMap<RemedyDetail, DisputeAccessRemedyDetail>();
        CreateMap<FileDescription, DisputeAccessFileDescription>();
        CreateMap<LinkedFile, DisputeAccessLinkedFile>();

        CreateMap<DisputeFee, DisputeAccessDisputeFee>()
            .ForMember(x => x.DatePaid, opt => opt.MapFrom(src => src.DatePaid.ToCmDateTimeString()))
            .ForMember(x => x.DueDate, opt => opt.MapFrom(src => src.DueDate.ToCmDateTimeString()))
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));

        CreateMap<DisputeFee, OfficeUserDisputeFee>()
            .ForMember(x => x.DatePaid, opt => opt.MapFrom(src => src.DatePaid.ToCmDateTimeString()))
            .ForMember(x => x.DueDate, opt => opt.MapFrom(src => src.DueDate.ToCmDateTimeString()))
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));

        CreateMap<PaymentTransaction, DisputeAccessPaymentTransaction>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));

        CreateMap<PaymentTransaction, OfficeUserPaymentTransaction>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));

        CreateMap<OfficeUserPostDisputeRequest, Dispute>();
        CreateMap<OfficeUserPostDisputeRequest, Participant>()
            .ForMember(x => x.AcceptedTouDate, opt => opt.MapFrom(src => System.DateTime.UtcNow));
        CreateMap<OfficeUserPostTransactionRequest, PaymentTransaction>();

        CreateMap<OfficeUserPatchDisputeRequest, Dispute>();
        CreateMap<Dispute, OfficeUserPatchDisputeRequest>();
        CreateMap<Dispute, OfficeUserPatchDisputeResponse>()
            .ForMember(x => x.InitialPaymentDate, opt => opt.MapFrom(src => src.InitialPaymentDate.ToCmDateTimeString()))
            .ForMember(x => x.OriginalNoticeDate, opt => opt.MapFrom(src => src.OriginalNoticeDate.ToCmDateTimeString()))
            .ForMember(x => x.SubmittedDate, opt => opt.MapFrom(src => src.SubmittedDate.ToCmDateTimeString()));

        CreateMap<Data.Model.Notice, OfficeUserPostNoticeResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.NoticeDeliveredDate, opt => opt.MapFrom(src => src.NoticeDeliveredDate.ToCmDateTimeString()));

        CreateMap<OfficeUserPostNoticeRequest, Data.Model.Notice>();

        CreateMap<HearingParticipation, DisputeAccessHearingParticipation>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));

        CreateMap<RemedyDetailResponse, OfficeUserRemedyDetailResponse>()
            .ForMember(x => x.ParticipantId, opt => opt.MapFrom(src => src.DescriptionBy));
    }
}