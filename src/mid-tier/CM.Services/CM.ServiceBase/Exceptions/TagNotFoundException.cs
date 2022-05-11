using System;

namespace CM.ServiceBase.Exceptions;

public class TagNotFoundException : Exception
{
    public TagNotFoundException(string message, string tag)
        : base(message)
    {
        Tag = tag;
    }

    public string Tag { get; }
}