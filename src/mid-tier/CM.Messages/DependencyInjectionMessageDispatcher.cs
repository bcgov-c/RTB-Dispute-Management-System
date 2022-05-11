using System;
using System.Threading;
using System.Threading.Tasks;
using EasyNetQ.AutoSubscribe;
using Microsoft.Extensions.DependencyInjection;

namespace CM.Messages;

public class DependencyInjectionMessageDispatcher : IAutoSubscriberMessageDispatcher
{
    private readonly IServiceProvider _resolver;

    public DependencyInjectionMessageDispatcher(IServiceProvider resolver)
    {
        _resolver = resolver;
    }

    public void Dispatch<TMessage, TConsumer>(TMessage message, CancellationToken cancellationToken = default)
        where TMessage : class
        where TConsumer : class, IConsume<TMessage>
    {
        using (_resolver.CreateScope())
        {
            var consumer = _resolver.GetService<TConsumer>();
            consumer.Consume(message, cancellationToken);
        }
    }

    public async Task DispatchAsync<TMessage, TAsyncConsumer>(TMessage message, CancellationToken cancellationToken = default)
        where TMessage : class
        where TAsyncConsumer : class, IConsumeAsync<TMessage>
    {
        using (_resolver.CreateScope())
        {
            var asyncConsumer = _resolver.GetService<TAsyncConsumer>();
            await asyncConsumer.ConsumeAsync(message, cancellationToken).ConfigureAwait(false);
        }
    }
}