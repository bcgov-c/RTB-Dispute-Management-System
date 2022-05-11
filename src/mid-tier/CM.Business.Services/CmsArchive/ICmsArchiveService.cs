using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.CmsArchive;
using CM.Data.Model;

namespace CM.Business.Services.CmsArchive;

public interface ICmsArchiveService : IServiceBase
{
    Task<CmsArchiveSearchResponse> SearchByFileNumber(string fileNumber, CmsArchiveSearchBase commonFilters);

    Task<CmsArchiveSearchResponse> SearchByReferenceNumber(string referenceNumber, CmsArchiveSearchBase commonFilters);

    Task<CmsArchiveSearchResponse> SearchByDispute(string disputeAddress, string disputeCity, byte? applicantType, CmsArchiveSearchBase commonFilters, int count, int index);

    Task<CmsArchiveSearchResponse> SearchByParticipant(string firstName, string lastName, string dayTimePhone, string emailAddress, byte? participantType, CmsArchiveSearchBase commonFilters, int count, int index);

    Task<CmsRecordResponse> GetCmsRecords(string fileNumber);

    Task<bool> IsFileNumberExist(string fileNumber);

    Task<CmsArchiveNoteResponse> PostCmsArchiveNoteAsync(string fileNumber, CmsArchiveNoteRequest request);

    Task<List<DataModel>> GetNoTrackingRecords(string fileNumber);

    Task<DataModel> PatchAsync(DataModel record);

    Task<Dispute> GetDmsDispute(string fileNumber);

    Task<FileResponse> GetFileAsync(Guid fileGuid);
}