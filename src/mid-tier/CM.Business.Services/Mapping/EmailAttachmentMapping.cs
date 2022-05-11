using AutoMapper;
using CM.Business.Entities.Models.EmailAttachment;
using CM.Business.Entities.Models.EmailMessage;
using CM.Common.Utilities;

namespace CM.Business.Services.Mapping;

public class EmailAttachmentMapping : Profile
{
    public EmailAttachmentMapping()
    {
        CreateMap<EmailAttachmentRequest, Data.Model.EmailAttachment>();
        CreateMap<Data.Model.EmailAttachment, EmailAttachmentResponse>()
            .ForMember(x => x.SendDate, opt => opt.MapFrom(src => src.SendDate.ToCmDateTimeString()))
            .ForMember(x => x.ReceivedDate, opt => opt.MapFrom(src => src.ReceivedDate.ToCmDateTimeString()))
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));

        CreateMap<Data.Model.EmailAttachment, PickupEmailAttachmentResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));
    }
}