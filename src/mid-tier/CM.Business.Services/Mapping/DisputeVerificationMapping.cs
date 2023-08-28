using AutoMapper;
using CM.Business.Entities.Models.DisputeVerification;
using CM.Business.Entities.Models.VerificationAttempt;
using CM.Common.Utilities;

namespace CM.Business.Services.Mapping
{
    public class DisputeVerificationMapping : Profile
    {
        public DisputeVerificationMapping()
        {
            CreateMap<Data.Model.DisputeVerification, DisputeVerificationPatchRequest>();

            CreateMap<DisputeVerificationPatchRequest, Data.Model.DisputeVerification>();

            CreateMap<DisputeVerificationPostRequest, Data.Model.DisputeVerification>();

            CreateMap<Data.Model.DisputeVerification, DisputeVerificationResponse>()
                .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
                .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
                .ForMember(x => x.VerificationStatusDate, opt => opt.MapFrom(src => src.VerificationStatusDate.ToCmDateTimeString()))
                .ForMember(x => x.RefundInitiatedDate, opt => opt.MapFrom(src => src.RefundInitiatedDate.ToCmDateTimeString()));

            CreateMap<Data.Model.VerificationAttempt, VerificationAttemptPatchRequest>();

            CreateMap<VerificationAttemptPatchRequest, Data.Model.VerificationAttempt>();

            CreateMap<VerificationAttemptPostRequest, Data.Model.VerificationAttempt>();

            CreateMap<Data.Model.VerificationAttempt, VerificationAttemptResponse>()
                .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
                .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
                .ForMember(x => x.AttemptStartDateTime, opt => opt.MapFrom(src => src.AttemptStartDateTime.ToCmDateTimeString()))
                .ForMember(x => x.AttemptEndDateTime, opt => opt.MapFrom(src => src.AttemptEndDateTime.ToCmDateTimeString()))
                .ForMember(x => x.VerificationDate, opt => opt.MapFrom(src => src.VerificationDate.ToCmDateTimeString()));

            CreateMap<Data.Model.DisputeVerification, DisputeVerificationGetResponse>()
                .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
                .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
                .ForMember(x => x.VerificationStatusDate, opt => opt.MapFrom(src => src.VerificationStatusDate.ToCmDateTimeString()))
                .ForMember(x => x.RefundInitiatedDate, opt => opt.MapFrom(src => src.RefundInitiatedDate.ToCmDateTimeString()));
        }
    }
}