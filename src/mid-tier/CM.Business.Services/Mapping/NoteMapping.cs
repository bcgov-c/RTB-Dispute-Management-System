using AutoMapper;
using CM.Business.Entities.Models.Note;
using CM.Common.Utilities;
using CM.Data.Model;

namespace CM.Business.Services.Mapping;

public class NoteMapping : Profile
{
    public NoteMapping()
    {
        CreateMap<NotePostRequest, Note>();
        CreateMap<Note, NotePostRequest>();

        CreateMap<NotePatchRequest, Note>();
        CreateMap<Note, NotePatchRequest>();

        CreateMap<Note, NoteResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));
    }
}