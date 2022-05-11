using System;

namespace CM.ServiceBase.Exceptions;

public class NotAuthorizedException : Exception
{
    public NotAuthorizedException(string message)
        : base(message)
    {
    }

    public NotAuthorizedException()
    {
    }
}