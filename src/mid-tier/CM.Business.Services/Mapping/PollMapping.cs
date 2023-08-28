using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.Poll;
using CM.Business.Entities.Models.Remedy;
using CM.Common.Utilities;
using CM.Data.Model;

namespace CM.Business.Services.Mapping
{
    public class PollMapping : Profile
    {
        public PollMapping()
        {
            CreateMap<PollRequest, Data.Model.Poll>();
            CreateMap<Data.Model.Poll, Entities.Models.Poll.PollResponse>()
                .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
                .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));

            CreateMap<PollPatchRequest, Data.Model.Poll>();
            CreateMap<Data.Model.Poll, PollPatchRequest>();
        }
    }
}
