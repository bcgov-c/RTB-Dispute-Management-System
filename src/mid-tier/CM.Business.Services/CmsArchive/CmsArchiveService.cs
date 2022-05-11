using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.CmsArchive;
using CM.Business.Services.ServiceHelpers;
using CM.Business.Services.SystemSettingsService;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using Participant = CM.Business.Entities.Models.CmsArchive.Participant;

namespace CM.Business.Services.CmsArchive;

public class CmsArchiveService : CmServiceBase, ICmsArchiveService
{
    public CmsArchiveService(IMapper mapper, IUnitOfWork unitOfWork, ISystemSettingsService systemSettingsService)
        : base(unitOfWork, mapper)
    {
        SystemSettingsService = systemSettingsService;
    }

    private ISystemSettingsService SystemSettingsService { get; }

    public async Task<CmsArchiveSearchResponse> SearchByFileNumber(string fileNumber, CmsArchiveSearchBase commonFilters)
    {
        var dataList = new List<DataModel>();

        var data = await UnitOfWork.DataModelRepository.GetByFileNumber(fileNumber, commonFilters);
        dataList.Add(data);
        var response = await GetFullResponse(dataList);
        response.TotalAvailableRecords = dataList.Count;

        return response;
    }

    public async Task<CmsArchiveSearchResponse> SearchByReferenceNumber(string referenceNumber, CmsArchiveSearchBase commonFilters)
    {
        var dataList = new List<DataModel>();

        var data = await UnitOfWork.DataModelRepository.GetByReferenceNumber(referenceNumber, commonFilters);
        dataList.Add(data);
        var response = await GetFullResponse(dataList);
        response.TotalAvailableRecords = dataList.Count;

        return response;
    }

    public async Task<CmsArchiveSearchResponse> SearchByDispute(string disputeAddress, string disputeCity, byte? applicantType, CmsArchiveSearchBase commonFilters, int count, int index)
    {
        var queryString = ArchiveHelper.GenerateDisputeInfoQuery(disputeAddress, disputeCity, applicantType);
        var fullDataList = await UnitOfWork.DataModelRepository.FindByQuery(queryString, commonFilters);
        var dataList = await fullDataList.OrderBy(x => x.Created_Date).ApplyPagingArrayStyleAsync(count, index);
        var response = await GetFullResponse(dataList);
        response.TotalAvailableRecords = fullDataList.Count;

        return response;
    }

    public async Task<CmsArchiveSearchResponse> SearchByParticipant(string firstName, string lastName, string dayTimePhone, string emailAddress, byte? participantType, CmsArchiveSearchBase commonFilters, int count, int index)
    {
        var queryString = ArchiveHelper.GenerateParticipantQuery(firstName, lastName, dayTimePhone, emailAddress, participantType);
        var requestIds = await UnitOfWork.CmsParticipantRepository.FindRequestIdsByQuery(queryString);

        if (requestIds.Count() < 1)
        {
            return new CmsArchiveSearchResponse()
            {
                CmsArchiveSearchResults = new List<CmsArchiveSearchResult>(), TotalAvailableRecords = 0
            };
        }

        var fullResult = await UnitOfWork.DataModelRepository.GetDataByFileNumbers(requestIds, commonFilters);
        var result = await fullResult.OrderBy(x => x.Created_Date).ApplyPagingArrayStyleAsync(count, index);
        var response = await GetFullResponse(result);
        response.TotalAvailableRecords = fullResult.Count;

        return response;
    }

    public async Task<CmsRecordResponse> GetCmsRecords(string fileNumber)
    {
        var response = new CmsRecordResponse();

        var files = await UnitOfWork.CmsFileRepository.GetAllFiles(fileNumber);
        var rootPath = await SystemSettingsService.GetValueAsync<string>(SettingKeys.CmsFileRepositoryUrl);

        var evidenceFiles = files.Where(x => x.File_Type == (byte)FileType.ExternalEvidence);
        var mappedEvidenceFiles = new List<FileResponse>();
        foreach (var file in evidenceFiles)
        {
            var mappedEvidenceFile = MapperService.Map<CMSFile, FileResponse>(file);
            mappedEvidenceFile.File_Url = GetFileUrl(rootPath, file);
            mappedEvidenceFiles.Add(mappedEvidenceFile);
        }

        var outcomeFiles = files.Where(x => x.File_Type == (byte)FileType.Notice);
        var mappedOutcomeFiles = new List<FileResponse>();
        foreach (var file in outcomeFiles)
        {
            var mappedOutcomeFile = MapperService.Map<CMSFile, FileResponse>(file);
            mappedOutcomeFile.File_Url = GetFileUrl(rootPath, file);
            mappedOutcomeFiles.Add(mappedOutcomeFile);
        }

        var archiveNotes = await UnitOfWork.CmsArchiveNoteRepository.GetByFileNumber(fileNumber);
        var mappedArchiveNotes = MapperService.Map<List<CMSArchiveNote>, List<ArchiveNote>>(archiveNotes);

        var records = await UnitOfWork.DataModelRepository.GetRecordsByFileNumber(fileNumber);
        var mappedRecords = MapperService.Map<List<DataModel>, List<CmsRecord>>(records);

        foreach (var record in mappedRecords)
        {
            var corrections = await UnitOfWork.CmsCorrectionRepository.GetByRequestId(record.Request_ID);
            var mappedCorrections = MapperService.Map<List<CMSCorrection>, List<CorrectionsClarification>>(corrections);

            var joiners = new List<JoinerApplication>();

            if (record.Joiner_Type != null)
            {
                switch (record.Joiner_Type)
                {
                    case (byte)JoinerType.Parent:
                        joiners.Add(new JoinerApplication { Joiner_Type = (byte)JoinerType.Parent, Joiner_File_Number = fileNumber });

                        break;
                    case (byte)JoinerType.Child:
                    {
                        var parent = await UnitOfWork.DataModelRepository.GetParentRecord(fileNumber);
                        joiners.Add(new JoinerApplication { Joiner_Type = (byte)JoinerType.Parent, Joiner_File_Number = parent });
                        joiners.Add(new JoinerApplication { Joiner_Type = (byte)JoinerType.Child, Joiner_File_Number = fileNumber });

                        break;
                    }
                }

                var childJoiners = await UnitOfWork.DataModelRepository.GetJoinedRecords(fileNumber);

                foreach (var childFileNumber in childJoiners)
                {
                    joiners.Add(new JoinerApplication { Joiner_Type = (byte)JoinerType.Child, Joiner_File_Number = childFileNumber });
                }
            }

            var participants = await UnitOfWork.CmsParticipantRepository.GetParticipantByRequestId(record.Request_ID);

            var applicants = participants.Where(x => x.Participant_Type == (byte)ParticipantTypes.Applicant).ToList();
            var mappedApplicants = MapperService.Map<List<CMSParticipant>, List<Participant>>(applicants);

            var agents = participants.Where(x => x.Participant_Type == (byte)ParticipantTypes.Agent).ToList();
            var mappedAgents = MapperService.Map<List<CMSParticipant>, List<Participant>>(agents);

            var respondents = participants.Where(x => x.Participant_Type == (byte)ParticipantTypes.Respondent).ToList();
            var mappedRespondents = MapperService.Map<List<CMSParticipant>, List<Participant>>(respondents);

            record.CorrectionsClarifications = mappedCorrections;
            record.JoinerApplications = joiners;
            record.Applicants = mappedApplicants;
            record.Agents = mappedAgents;
            record.Respondents = mappedRespondents;
        }

        response.File_Number = fileNumber;
        var firstRecord = records.FirstOrDefault();

        if (firstRecord != null)
        {
            response.Reference_Number = firstRecord.Reference_Number;
            response.DMS_File_Number = firstRecord.DMS_File_Number;
            response.DMS_File_GUID = firstRecord.DMS_File_GUID;
        }

        response.EvidenceFiles = mappedEvidenceFiles;
        response.OutcomeFiles = mappedOutcomeFiles;
        response.ArchiveNotes = mappedArchiveNotes;
        response.CMSRecordCount = records.Count;
        response.Records = mappedRecords;

        return response;
    }

    public async Task<bool> IsFileNumberExist(string fileNumber)
    {
        var exist = await UnitOfWork.DataModelRepository.IsExist(fileNumber);
        return exist;
    }

    public async Task<CmsArchiveNoteResponse> PostCmsArchiveNoteAsync(string fileNumber, CmsArchiveNoteRequest request)
    {
        var newNote = MapperService.Map<CmsArchiveNoteRequest, CMSArchiveNote>(request);
        newNote.Created_Date = DateTime.UtcNow;
        newNote.File_Number = fileNumber;
        var noteResult = await UnitOfWork.CmsArchiveNoteRepository.InsertAsync(newNote);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<CMSArchiveNote, CmsArchiveNoteResponse>(noteResult);
        }

        return null;
    }

    public async Task<List<DataModel>> GetNoTrackingRecords(string fileNumber)
    {
        var record = await UnitOfWork.DataModelRepository.GetNoTrackingRecords(fileNumber);
        return record;
    }

    public async Task<DataModel> PatchAsync(DataModel record)
    {
        record.Last_Modified_Date = DateTime.UtcNow;

        UnitOfWork.DataModelRepository.Update(record);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return record;
        }

        return null;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object id)
    {
        var lastModifiedDate = await UnitOfWork.DataModelRepository.GetLastModifiedDate((string)id);
        return lastModifiedDate;
    }

    public async Task<Dispute> GetDmsDispute(string fileNumber)
    {
        var fileNumberParsed = int.Parse(fileNumber);
        if (fileNumberParsed > 0)
        {
            var dispute = await UnitOfWork.DisputeRepository.GetDisputeByFileNumber(fileNumberParsed);

            return dispute;
        }

        return null;
    }

    public async Task<FileResponse> GetFileAsync(Guid fileGuid)
    {
        var file = await UnitOfWork.CmsFileRepository.GetNoTrackingByIdAsync(
            r => r.File_GUID.Equals(fileGuid));

        if (file != null)
        {
            return MapperService.Map<CMSFile, FileResponse>(file);
        }

        return null;
    }

    #region Private

    private async Task<CmsArchiveSearchResponse> GetFullResponse(IEnumerable<DataModel> dataList)
    {
        var searchResponse = new CmsArchiveSearchResponse();
        var results = new List<CmsArchiveSearchResult>();

        foreach (var data in dataList)
        {
            if (data != null)
            {
                var participants = await UnitOfWork.CmsParticipantRepository.GetParticipantByRequestId(data.Request_ID);
                var firstApplicantLastName = participants.Any(p => p.Participant_Type == (byte)ParticipantType.Business && p.CMS_Sequence_Number == 1) ? participants.FirstOrDefault(p => p.Participant_Type == (byte)ParticipantType.Business && p.CMS_Sequence_Number == 1).Last_Name : null;
                var firstAgentLastName = participants.Any(p => p.Participant_Type == (byte)ParticipantType.Individual && p.CMS_Sequence_Number == 1) ? participants.FirstOrDefault(p => p.Participant_Type == (byte)ParticipantType.Individual && p.CMS_Sequence_Number == 1).Last_Name : null;
                var firstRespondentLastName = participants.Any(p => p.Participant_Type == (byte)ParticipantType.AgentOrLawyer && p.CMS_Sequence_Number == 1) ? participants.FirstOrDefault(p => p.Participant_Type == (byte)ParticipantType.AgentOrLawyer && p.CMS_Sequence_Number == 1).Last_Name : null;

                var result = new CmsArchiveSearchResult
                {
                    File_Number = data.File_Number,
                    Reference_Number = data.Reference_Number,
                    Dispute_Address = data.Dispute_Address,
                    Dispute_City = data.Dispute_City,
                    Dispute_Type = data.Dispute_Type,
                    Applicant_Type = data.Applicant_Type,
                    Direct_Request = data.Direct_Request,
                    Dispute_Codes = data.Dispute_Codes,
                    Filing_Fee = data.Filing_Fee,
                    First_Applicant_Last_Name = firstApplicantLastName,
                    First_Agent_Last_Name = firstAgentLastName,
                    First_Respondent_Last_Name = firstRespondentLastName,
                    Hearing_Date = data.Hearing_Date,
                    Joiner_Type = data.Joiner_Type,
                    Cross_App_File_Number = data.Cross_App_File_Number,
                    Dispute_Status = data.Dispute_Status,
                    DRO_Code = data.DRO_Code,
                    DMS_File_Number = data.DMS_File_Number,
                    DMS_File_GUID = data.DMS_File_GUID,
                    Submitted_Date = data.Submitted_Date.ToCmDateTimeString(),
                    Created_Date = data.Created_Date.ToCmDateTimeString(),
                    Last_Modified_Date = data.Last_Modified_Date.ToCmDateTimeString()
                };

                results.Add(result);
            }

            searchResponse.CmsArchiveSearchResults = results;
        }

        return searchResponse;
    }

    private string GetFileUrl(string rootPath, CMSFile file)
    {
        return $"{rootPath}/{file.File_GUID}/{file.File_Name}";
    }

    #endregion
}