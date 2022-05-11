using System.Reflection;
using EasyNetQ;
using EasyNetQ.AutoSubscribe;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;

namespace CM.Messages;

public static class AppBuilderExtension
{
    public static IBus GetBus(this IApplicationBuilder appBuilder)
    {
        var services = appBuilder.ApplicationServices.CreateScope().ServiceProvider;

        services.GetService<IApplicationLifetime>();
        return services.GetService<IBus>();
    }

    public static IApplicationBuilder UseAutoSubscribe(this IApplicationBuilder appBuilder, string subscriptionIdPrefix, Assembly assembly)
    {
        var services = appBuilder.ApplicationServices.CreateScope().ServiceProvider;

        var lifeTime = services.GetService<IApplicationLifetime>();
        var bus = services.GetService<IBus>();
        lifeTime.ApplicationStarted.Register(() =>
        {
            var subscriber = new AutoSubscriber(bus, subscriptionIdPrefix)
            {
                AutoSubscriberMessageDispatcher = new DependencyInjectionMessageDispatcher(services)
            };

            subscriber.SubscribeAsync(assembly.GetTypes());
        });

        lifeTime.ApplicationStopped.Register(() => bus.Dispose());

        return appBuilder;
    }
}