using System;
using EasyNetQ.Consumer;
using EasyNetQ.DI;
using Polly;
using Polly.Retry;

namespace CM.Messages.PollyHandler;

public static class ServiceRegisterExtensions
{
    public static IServiceRegister UseMessageHandlerPolicy(this IServiceRegister registrar, AsyncRetryPolicy asyncRetryPolicy)
    {
        if (registrar == null)
        {
            throw new ArgumentNullException(nameof(registrar));
        }

        if (asyncRetryPolicy == null)
        {
            throw new ArgumentNullException(nameof(asyncRetryPolicy));
        }

        registrar.Register<IHandlerRunner>(services => new PollyHandlerRunner(services.Resolve<IConsumerErrorStrategy>(), asyncRetryPolicy));

        return registrar;
    }

    public static IServiceRegister UseMessageWaitAndRetryHandlerPolicy(this IServiceRegister registrar, int retryCount = 0)
    {
        var policy = Policy
            .Handle<Exception>()
            .WaitAndRetryAsync(retryCount, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)));

        return UseMessageHandlerPolicy(registrar, policy);
    }
}