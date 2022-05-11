using System;

namespace CM.UserResolverService;

public interface IUserResolver
{
    int GetUserId();

    Guid? GetAssociatedDispute();
}