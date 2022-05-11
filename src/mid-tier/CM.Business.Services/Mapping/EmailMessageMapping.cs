using AutoMapper;
using CM.Business.Entities.Models.AccessCode;
using CM.Business.Entities.Models.EmailMessage;
using CM.Common.Utilities;
using CM.Data.Model;

namespace CM.Business.Services.Mapping;

public class EmailMessageMapping : Profile
{
    public EmailMessageMapping()
    {
        CreateMap<EmailMessageRequest, EmailMessage>();
        CreateMap<EmailMessageRequestPatch, EmailMessage>();
        CreateMap<EmailMessageRequest, EmailMessage>();

        CreateMap<EmailMessage, EmailMessageResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.SentDate, opt => opt.MapFrom(src => src.SentDate.ToCmDateTimeString()))
            .ForMember(x => x.ResponseDueDate, opt => opt.MapFrom(src => src.ResponseDueDate.ToCmDateTimeString()))
            .ForMember(x => x.ReceivedDate, opt => opt.MapFrom(src => src.ReceivedDate.ToCmDateTimeString()))
            .ForMember(x => x.PreferredSendDate, opt => opt.MapFrom(src => src.PreferredSendDate.ToCmDateTimeString()));

        CreateMap<EmailMessage, EmailMessageRequest>();

        CreateMap<EmailMessage, EmailMessageRequestPatch>();

        CreateMap<EmailMessage, PickupMessage>();

        CreateMap<EmailMessage, PickupMessageGetResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));

        CreateMap<EmailMessageResponse, EmailMessage>();
    }
}