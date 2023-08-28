using AutoMapper;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Repositories.UnitOfWork;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Services
{
    public class AdHocServiceBase
    {
        protected AdHocServiceBase(IUnitOfWork unitOfWork)
        {
            UnitOfWork = unitOfWork;
        }

        protected AdHocServiceBase(IMapper mapper)
        {
            MapperService = mapper;
        }

        protected AdHocServiceBase(IUnitOfWork unitOfWork, IMapper mapper)
        {
            UnitOfWork = unitOfWork;
            MapperService = mapper;
        }

        protected IUnitOfWork UnitOfWork { get; }

        protected IMapper MapperService { get; }
    }
}
