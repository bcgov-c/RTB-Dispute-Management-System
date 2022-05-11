using System;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.OutcomeDocument;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using CM.Messages.PostedDecision.Events;
using CM.Messages.PostedDecisionDataCollector.Events;
using CM.UserResolverService;
using EasyNetQ;
using Serilog;

namespace CM.Business.Services.OutcomeDocument;

public class OutcomeDocFileService : CmServiceBase, IOutcomeDocFileService
{
    private readonly IUserResolver _userResolver;

    public OutcomeDocFileService(IMapper mapper, IUnitOfWork unitOfWork, IBus bus, IUserResolver userResolver)
        : base(unitOfWork, mapper)
    {
        Bus = bus;
        _userResolver = userResolver;
    }

    private IBus Bus { get; }

    public async Task<Guid> ResolveDisputeGuid(int id)
    {
        var entity = await UnitOfWork.OutcomeDocFileRepository.GetNoTrackingByIdAsync(c => c.OutcomeDocFileId == id);
        return entity?.DisputeGuid ?? Guid.Empty;
    }

    public async Task<OutcomeDocFileResponse> CreateAsync(int outcomeDocGroupId, OutcomeDocFilePostRequest outcomeDocFile)
    {
        var newOutcomeDocFile = MapperService.Map<OutcomeDocFilePostRequest, OutcomeDocFile>(outcomeDocFile);
        newOutcomeDocFile.OutcomeDocGroupId = outcomeDocGroupId;
        newOutcomeDocFile.IsDeleted = false;
        newOutcomeDocFile.DisputeGuid = outcomeDocFile.DisputeGuid;

        var outcomeDocFileResult = await UnitOfWork.OutcomeDocFileRepository.InsertAsync(newOutcomeDocFile);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            var postedDecisionEvent = await GetPostedDecisionDataCollectionEvent(outcomeDocFileResult);
            if (postedDecisionEvent != null)
            {
                Publish(postedDecisionEvent);
            }

            return MapperService.Map<OutcomeDocFile, OutcomeDocFileResponse>(outcomeDocFileResult);
        }

        return null;
    }

    public async Task<OutcomeDocFile> PatchAsync(OutcomeDocFile outcomeDocFile, bool createPostedDecision, bool deletePostedDecision)
    {
        if (createPostedDecision)
        {
            var postedDecisionEvent = await GetPostedDecisionDataCollectionEvent(outcomeDocFile);
            if (postedDecisionEvent != null)
            {
                Publish(postedDecisionEvent);

                if (outcomeDocFile.FileId != null)
                {
                    var file = await UnitOfWork.FileRepository.GetByIdAsync(outcomeDocFile.FileId.Value);
                    file.PublicAccessAllowed = true;
                    UnitOfWork.FileRepository.Attach(file);
                }
            }
        }

        if (deletePostedDecision)
        {
            var postedDecisionDeletionEvent = new PostedDecisionRemovalEvent
            {
                DisputeGuid = outcomeDocFile.DisputeGuid,
                OutcomeDocFileId = outcomeDocFile.OutcomeDocFileId
            };

            Publish(postedDecisionDeletionEvent);

            if (outcomeDocFile.FileId != null)
            {
                var file = await UnitOfWork.FileRepository.GetByIdAsync(outcomeDocFile.FileId.Value);
                file.PublicAccessAllowed = false;
                UnitOfWork.FileRepository.Attach(file);
            }
        }

        UnitOfWork.OutcomeDocFileRepository.Attach(outcomeDocFile);
        var result = await UnitOfWork.Complete();

        if (result.CheckSuccess())
        {
            return outcomeDocFile;
        }

        return null;
    }

    public async Task<OutcomeDocFile> GetNoTrackingOutcomeDocFileAsync(int outcomeDocFileId)
    {
        var outcomeDocFile = await UnitOfWork.OutcomeDocFileRepository
            .GetOutcomeDocFileWithFile(outcomeDocFileId);
        return outcomeDocFile;
    }

    public async Task<bool> DeleteAsync(int outcomeDocFileId)
    {
        var outcomeDocFile = await UnitOfWork.OutcomeDocFileRepository.GetByIdAsync(outcomeDocFileId);
        if (outcomeDocFile != null)
        {
            outcomeDocFile.IsDeleted = true;
            UnitOfWork.OutcomeDocFileRepository.Attach(outcomeDocFile);
            var result = await UnitOfWork.Complete();

            var postedDecisionDeletionEvent = new PostedDecisionRemovalEvent
            {
                DisputeGuid = outcomeDocFile.DisputeGuid,
                OutcomeDocFileId = outcomeDocFile.OutcomeDocFileId
            };

            Publish(postedDecisionDeletionEvent);

            return result.CheckSuccess();
        }

        return false;
    }

    public async Task<bool> OutcomeDocFileExists(int outcomeDocFileId)
    {
        var outcomeDocFile = await UnitOfWork.OutcomeDocFileRepository.GetByIdAsync(outcomeDocFileId);
        if (outcomeDocFile != null)
        {
            return true;
        }

        return false;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object id)
    {
        var lastModifiedDate = await UnitOfWork.OutcomeDocFileRepository.GetLastModifiedDate((int)id);

        return lastModifiedDate;
    }

    public async Task<bool> IsDeliveredOutcomeDocument(Guid disputeGuid)
    {
        var isExists = await UnitOfWork.OutcomeDocFileRepository.IsDeliveredOutcomeDocument(disputeGuid);

        return isExists;
    }

    private async Task<PostedDecisionDataCollectionEvent> GetPostedDecisionDataCollectionEvent(OutcomeDocFile outcomeDocFile)
    {
        if (outcomeDocFile.VisibleToPublic.GetValueOrDefault() &&
            outcomeDocFile.FileType == (byte)OutcomeDocFileTypes.PublicDecision &&
            outcomeDocFile.File is { FileType: (byte)FileType.AnonymousExternalDocument })
        {
            var file = await UnitOfWork.FileRepository.GetFile(outcomeDocFile.FileId);

            if (file is { FileMimeType: FileMimeTypes.Pdf })
            {
                var postedDecisionDataCollectionEvent = new PostedDecisionDataCollectionEvent
                {
                    DisputeGuid = outcomeDocFile.DisputeGuid,
                    OutcomeDocFileId = outcomeDocFile.OutcomeDocFileId,
                    PostedBy = _userResolver.GetUserId(),
                    FileGuid = file.FileGuid
                };

                return postedDecisionDataCollectionEvent;
            }
        }

        return null;
    }

    private void Publish(PostedDecisionDataCollectionEvent message)
    {
        Bus.PubSub.PublishAsync(message)
            .ContinueWith(task =>
            {
                if (task.IsCompleted)
                {
                    Log.Information("Publish posted decision data collection event: {CorrelationGuid} {DisputeGuid}", message.CorrelationGuid, message.DisputeGuid);
                }

                if (task.IsFaulted)
                {
                    Log.Error(task.Exception, "CorrelationGuid = {CorrelationGuid}", message.CorrelationGuid);
                    throw new Exception($"Message = {message.CorrelationGuid} exception", task.Exception);
                }
            });
    }

    private void Publish(PostedDecisionRemovalEvent message)
    {
        Bus.PubSub.PublishAsync(message)
            .ContinueWith(task =>
            {
                if (task.IsCompleted)
                {
                    Log.Information("Publish posted decision data collection event: {CorrelationGuid} {DisputeGuid}", message.CorrelationGuid, message.DisputeGuid);
                }

                if (task.IsFaulted)
                {
                    Log.Error(task.Exception, "CorrelationGuid = {CorrelationGuid}", message.CorrelationGuid);
                    throw new Exception($"Message = {message.CorrelationGuid} exception", task.Exception);
                }
            });
    }
}