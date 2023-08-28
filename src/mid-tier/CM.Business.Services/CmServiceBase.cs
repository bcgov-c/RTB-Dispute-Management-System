using AutoMapper;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services;

public abstract class CmServiceBase
{
    protected CmServiceBase(IUnitOfWork unitOfWork)
    {
        UnitOfWork = unitOfWork;
    }

    protected CmServiceBase(IMapper mapper)
    {
        MapperService = mapper;
    }

    protected CmServiceBase(IUnitOfWork unitOfWork, IMapper mapper)
    {
        UnitOfWork = unitOfWork;
        MapperService = mapper;
    }

    protected IUnitOfWork UnitOfWork { get; }

    protected IMapper MapperService { get; }
}