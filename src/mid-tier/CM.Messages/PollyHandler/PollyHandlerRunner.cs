using System;
using System.Threading;
using System.Threading.Tasks;
using EasyNetQ.Consumer;
using EasyNetQ.Events;
using EasyNetQ.Logging;
using Polly.Retry;

namespace CM.Messages.PollyHandler;

public class PollyHandlerRunner : HandlerRunner
{
    private readonly ILog _logger = LogProvider.For<PollyHandlerRunner>();
    private readonly AsyncRetryPolicy _policy;

    public PollyHandlerRunner(IConsumerErrorStrategy consumerErrorStrategy, AsyncRetryPolicy asyncRetryPolicy)
        : base(consumerErrorStrategy)
    {
        _policy = asyncRetryPolicy ?? throw new ArgumentNullException(nameof(asyncRetryPolicy));
    }

    public override async Task<AckStrategy> InvokeUserMessageHandlerAsync(ConsumerExecutionContext context, CancellationToken cancellationToken)
    {
        if (_logger.IsDebugEnabled())
        {
            _logger.DebugFormat("Received message with receivedInfo={receivedInfo}", context.ReceivedInfo);
        }

        var ackStrategy = await InvokeUserMessageHandlerInternalAsync(context).ConfigureAwait(false);

        return (model, tag) =>
        {
            try
            {
                return ackStrategy(model, tag);
            }
            catch (Exception exception)
            {
                _logger.Error(
                    exception,
                    "Unexpected exception when attempting to ACK or NACK, receivedInfo={receivedInfo}",
                    context.ReceivedInfo);
            }

            return AckResult.Exception;
        };
    }

    private async Task<AckStrategy> InvokeUserMessageHandlerInternalAsync(ConsumerExecutionContext context)
    {
        try
        {
            await _policy.ExecuteAsync(async () =>
            {
                await context
                    .Handler(context.Body, context.Properties, context.ReceivedInfo, CancellationToken.None)
                    .ConfigureAwait(false);
            });
        }
        catch (Exception exception)
        {
            _logger.Error(exception, "Consumer error strategy has failed");
            return AckStrategies.NackWithoutRequeue;
        }

        return AckStrategies.Ack;
    }
}