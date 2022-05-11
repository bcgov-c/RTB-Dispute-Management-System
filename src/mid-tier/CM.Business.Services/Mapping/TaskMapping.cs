using AutoMapper;
using CM.Business.Entities.Models.Task;
using CM.Common.Utilities;

namespace CM.Business.Services.Mapping;

public class TaskMapping : Profile
{
    public TaskMapping()
    {
        CreateMap<TaskRequest, Data.Model.Task>();
        CreateMap<Data.Model.Task, TaskRequest>();

        CreateMap<Data.Model.Task, TaskResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.TaskDueDate, opt => opt.MapFrom(src => src.TaskDueDate.ToCmDateTimeString()))
            .ForMember(x => x.DateTaskCompleted, opt => opt.MapFrom(src => src.DateTaskCompleted.ToCmDateTimeString()))
            .ForMember(x => x.LastUnassignedDate, opt => opt.MapFrom(src => src.LastUnassignedDate.ToCmDateTimeString()))
            .ForMember(x => x.LastOwnerAssignedDate, opt => opt.MapFrom(src => src.LastOwnerAssignedDate.ToCmDateTimeString()))
            .ForMember(x => x.LastAssignedDate, opt => opt.MapFrom(src => src.LastAssignedDate.ToCmDateTimeString()))
            .ForMember(x => x.FileNumber, opt => opt.MapFrom(src => src.Dispute.FileNumber));
    }
}