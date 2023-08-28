using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.ParticipantIdentity;
using CM.Business.Entities.Models.Parties;
using CM.Common.Utilities;
using CM.Data.Model;

namespace CM.Business.Services.Mapping
{
    public class ParticipantIdentityMapping : Profile
    {
        public ParticipantIdentityMapping()
        {
            CreateMap<ParticipantIdentityPostRequest, ParticipantIdentity>();

            CreateMap<ParticipantIdentity, ParticipantIdentityResponse>()
                .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));

            CreateMap<ParticipantIdentityPatchRequest, ParticipantIdentity>();
            CreateMap<ParticipantIdentity, ParticipantIdentityPatchRequest>();
        }
    }
}
