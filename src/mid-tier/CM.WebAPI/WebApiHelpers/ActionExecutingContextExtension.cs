using System;
using System.Linq;
using CM.Business.Services.Base;
using CM.Common.Utilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;

namespace CM.WebAPI.WebApiHelpers;

public static class ActionExecutingContextExtension
{
    public static T GetService<T>(this ActionExecutingContext context)
        where T : class
    {
        return context.HttpContext.RequestServices.GetService<T>();
    }

    public static T GetContextId<T>(this ActionExecutingContext context, string name)
    {
        if (context.ActionDescriptor is ControllerActionDescriptor descriptor)
        {
            var parameters = descriptor.MethodInfo.GetParameters();

            if (parameters.FirstOrDefault() != null)
            {
                var parameterName = parameters.FirstOrDefault(p => p.Name == name);
                if (parameterName is { Name: { } })
                {
                    var value = context.ActionArguments[parameterName.Name];
                    return value.ChangeType<T>();
                }
            }
        }

        throw new ArgumentNullException(name);
    }

    public static System.Threading.Tasks.Task<Guid> ResolveDispute<TS>(this ActionExecutingContext context, string name)
        where TS : class
    {
        var id = ResolveContextId<int>(context, name);
        var resolver = ResolveDisputeResolver<TS>(context);
        return resolver.ResolveDisputeGuid(id);
    }

    public static System.Threading.Tasks.Task<Guid> ResolveDisputeByGuid<TS>(this ActionExecutingContext context, string name)
        where TS : class
    {
        var guid = ResolveContextId<Guid>(context, name);
        var resolver = ResolveTrialDisputeResolver<TS>(context);
        return resolver.ResolveDisputeGuid(guid);
    }

    private static T ResolveContextId<T>(ActionExecutingContext context, string name)
    {
        if (context.ActionDescriptor is ControllerActionDescriptor descriptor)
        {
            var parameters = descriptor.MethodInfo.GetParameters();

            if (parameters.FirstOrDefault() != null)
            {
                var parameterName = parameters.FirstOrDefault(p => p.Name == name);
                if (parameterName is { Name: { } })
                {
                    var value = context.ActionArguments[parameterName.Name];
                    return value.ChangeType<T>();
                }
            }
        }

        throw new ArgumentNullException(name);
    }

    private static IDisputeResolver ResolveDisputeResolver<T>(ActionContext context)
        where T : class
    {
        var resolver = context.HttpContext.RequestServices.GetService<T>() as IDisputeResolver;
        if (resolver == null)
        {
            var service = context.HttpContext.RequestServices.GetService<T>();
            throw new NotImplementedException($"{service?.GetType()} service doesn't implement IDisputeResolver");
        }

        return resolver;
    }

    private static ITrialDisputeResolver ResolveTrialDisputeResolver<T>(ActionContext context)
        where T : class
    {
        var resolver = context.HttpContext.RequestServices.GetService<T>() as ITrialDisputeResolver;
        if (resolver == null)
        {
            var service = context.HttpContext.RequestServices.GetService<T>();
            throw new NotImplementedException($"{service?.GetType()} service doesn't implement ITrialDisputeResolver");
        }

        return resolver;
    }
}