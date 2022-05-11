using AutoMapper;
using CM.Business.Entities.Models.Dispute;
using CM.Business.Entities.Models.ExternalUpdate;
using CM.Common.Utilities;
using CM.Data.Model;

namespace CM.Business.Services.Mapping;

public class DisputeMapping : Profile
{
    public DisputeMapping()
    {
        CreateMap<Dispute, DisputeResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.SubmittedDate, opt => opt.MapFrom(src => src.SubmittedDate.ToCmDateTimeString()))
            .ForMember(x => x.OriginalNoticeDate, opt => opt.MapFrom(src => src.OriginalNoticeDate.ToCmDateTimeString()))
            .ForMember(x => x.DisputeLastModifiedDate, opt => opt.MapFrom(src => src.DisputeLastModified.LastModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.DisputeLastModifiedBy, opt => opt.MapFrom(src => src.DisputeLastModified.LastModifiedBy))
            .ForMember(x => x.DisputeLastModifiedSource, opt => opt.MapFrom(src => src.DisputeLastModified.LastModifiedSource))
            .ForMember(x => x.InitialPaymentDate, opt => opt.MapFrom(src => src.InitialPaymentDate.ToCmDateTimeString()))
            .ForMember(x => x.TenancyEndDate, opt => opt.MapFrom(src => src.TenancyEndDate.ToCmDateTimeString()))
            .ForMember(x => x.TenancyStartDate, opt => opt.MapFrom(src => src.TenancyStartDate.ToCmDateTimeString()))
            .ForMember(x => x.TenancyAgreementDate, opt => opt.MapFrom(src => src.TenancyAgreementDate.ToCmDateTimeString()));

        CreateMap<Dispute, DisputeListResponseEntity>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.SubmittedDate, opt => opt.MapFrom(src => src.SubmittedDate.ToCmDateTimeString()))
            .ForMember(x => x.OriginalNoticeDate, opt => opt.MapFrom(src => src.OriginalNoticeDate.ToCmDateTimeString()))
            .ForMember(x => x.DisputeLastModifiedDate, opt => opt.MapFrom(src => src.DisputeLastModified.LastModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.DisputeLastModifiedBy, opt => opt.MapFrom(src => src.DisputeLastModified.LastModifiedBy))
            .ForMember(x => x.DisputeLastModifiedSource, opt => opt.MapFrom(src => src.DisputeLastModified.LastModifiedSource))
            .ForMember(x => x.InitialPaymentDate, opt => opt.MapFrom(src => src.InitialPaymentDate.ToCmDateTimeString()))
            .ForMember(x => x.TenancyEndDate, opt => opt.MapFrom(src => src.TenancyEndDate.ToCmDateTimeString()))
            .ForMember(x => x.TenancyStartDate, opt => opt.MapFrom(src => src.TenancyStartDate.ToCmDateTimeString()))
            .ForMember(x => x.TenancyAgreementDate, opt => opt.MapFrom(src => src.TenancyAgreementDate.ToCmDateTimeString()));

        CreateMap<DisputeStatus, DisputeStatusResponse>()
            .ForMember(x => x.StatusStartDate, opt => opt.MapFrom(src => src.StatusStartDate.ToCmDateTimeString()));
        CreateMap<DisputeStatus, ExternalUpdateDisputeStatusResponse>();

        CreateMap<Dispute, DisputeRequest>();

        CreateMap<DisputeRequest, Dispute>()
            .ForMember(x => x.CreatedDate, opt => opt.Ignore())
            .ForMember(x => x.CreatedBy, opt => opt.Ignore())
            .ForMember(x => x.ModifiedDate, opt => opt.Ignore())
            .ForMember(x => x.ModifiedBy, opt => opt.Ignore())
            .ForMember(x => x.FileNumber, opt => opt.Ignore())
            .ForMember(x => x.DisputeGuid, opt => opt.Ignore());

        CreateMap<DisputeStatusPostRequest, DisputeStatus>();
        CreateMap<DisputeStatus, DisputeStatusPostRequest>();
        CreateMap<DisputeStatus, DisputeStatusPatchRequest>();
        CreateMap<DisputeStatusPatchRequest, DisputeStatus>();

        CreateMap<ExternalUpdateDisputeStatusRequest, DisputeStatus>();
        CreateMap<DisputeStatus, ExternalUpdateDisputeStatusRequest>();

        CreateMap<DisputeUser, DisputeUserResponse>()
            .ForMember(x => x.UserId, opt => opt.MapFrom(src => src.SystemUserId))
            .ForMember(x => x.Username, opt => opt.MapFrom(src => src.SystemUser.Username))
            .ForMember(x => x.FullName, opt => opt.MapFrom(src => src.SystemUser.FullName))
            .ForMember(x => x.Email, opt => opt.MapFrom(src => src.SystemUser.AccountEmail))
            .ForMember(x => x.RoleId, opt => opt.MapFrom(src => src.SystemUser.SystemUserRoleId))
            .ForMember(x => x.IsActive, opt => opt.MapFrom(src => src.SystemUser.IsActive))
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.SystemUser.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.SystemUser.ModifiedDate.ToCmDateTimeString()));
    }
}