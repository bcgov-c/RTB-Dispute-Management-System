using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using AutoMapper;
using CM.Business.Entities.Models.Dispute;
using CM.Business.Entities.Models.DisputeHearing;
using CM.Business.Services.DisputeHearing;
using CM.Business.Services.Files;
using CM.Business.Services.SystemSettingsService;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;
using CM.FileSystem.Service;
using CM.SFTP;
using Microsoft.Extensions.Options;
using Polly;
using Serilog;
using SystemTasks = System.Threading.Tasks;

namespace CM.Business.Services.HearingRecordingTransfer;

public class HearingRecordingTransferService : CmServiceBase, IHearingRecordingTransferService
{
    private const int RecordingCodeSplitPosition = 7;
    private const int DateLenght = 14;
    private const int DefaultAudioSamplingRate = 11025;
    private const int DefaultBitRate = 64;
    private const int DefaultChannels = 1;
    private const string OriginalFileExtension = "wav";
    private const string ConvertedFileExtension = "mp3";
    private readonly AudioConversionSettings _appSettings;

    public HearingRecordingTransferService(IOptions<AudioConversionSettings> options, IMapper mapper, IUnitOfWork unitOfWork, IDisputeHearingService disputeHearingService, ISystemSettingsService systemSettingsService, IFileService fileService, ILogger logger)
        : base(unitOfWork, mapper)
    {
        DisputeHearingService = disputeHearingService;
        SystemSettingsService = systemSettingsService;
        FileService = fileService;
        Logger = logger;
        _appSettings = options.Value;
    }

    private ISystemSettingsService SystemSettingsService { get; }

    private IDisputeHearingService DisputeHearingService { get; }

    private IFileService FileService { get; }

    private ILogger Logger { get; }

    public async SystemTasks.Task ProcessHearingRecordingTransfer()
    {
        try
        {
            await Transfer();
        }
        finally
        {
            await Process();
        }
    }

    private async SystemTasks.Task Transfer()
    {
        var host = await SystemSettingsService.GetValueAsync<string>(SettingKeys.RecordingSftpHost);
        var user = await SystemSettingsService.GetValueAsync<string>(SettingKeys.RecordingSftpUser);
        var port = await SystemSettingsService.GetValueAsync<int>(SettingKeys.RecordingSftpPort);
        var keyFile = await SystemSettingsService.GetValueAsync<string>(SettingKeys.RecordingSftpKeyFile);
        var maxBatchSize = await SystemSettingsService.GetValueAsync<int>(SettingKeys.RecordingBatchSize);
        var recordingSourceDir = await SystemSettingsService.GetValueAsync<string>(SettingKeys.RecordingSourceDir);
        var tempFolder = await SystemSettingsService.GetValueAsync<string>(SettingKeys.TempStorageRoot);
        var recordingTransfer = Path.Combine(tempFolder, "RecordingTransfer");
        var recordingUnprocessed = Path.Combine(tempFolder, "RecordingUnprocessed");

        FileUtils.CheckIfNotExistsCreate(tempFolder);
        FileUtils.CheckIfNotExistsCreate(recordingTransfer);
        FileUtils.CheckIfNotExistsCreate(recordingUnprocessed);

        var sftpProxy = new SftpProxy(Logger, keyFile, host, user, port);
        var result = sftpProxy.CheckConnection();
        sftpProxy.DownloadDirectory(recordingSourceDir, recordingTransfer, recordingUnprocessed, maxBatchSize);
        await SystemTasks.Task.FromResult(result);
    }

    private async SystemTasks.Task Process()
    {
        var tempFolder = await SystemSettingsService.GetValueAsync<string>(SettingKeys.TempStorageRoot);
        var recordingUnprocessed = Path.Combine(tempFolder, "RecordingUnprocessed");
        var recordingError = Path.Combine(tempFolder, "RecordingError");

        FileUtils.CheckIfNotExistsCreate(recordingError);

        var extensionTo = OriginalFileExtension;
        if (_appSettings.Bypass == false)
        {
            extensionTo = ConvertedFileExtension;
            ConvertFiles(recordingUnprocessed);
        }

        var items = GetRecordingsList(recordingUnprocessed, extensionTo);

        foreach (var item in items)
        {
            var disputeHearingRecording = await FindAssociatedHearing(item);

            var isFileExists = await FileService.FileExists(item.Name);
            if (disputeHearingRecording != null && isFileExists == false)
            {
                var fileName = $"{disputeHearingRecording.HearingId}_{disputeHearingRecording.LocalStartDateTime:yyyy-MM-dd_HHmmtt}_RecordedHearing.{extensionTo}";

                var storeFileRequest = new StoreFileRequest
                {
                    FileInfo = item,
                    OriginalFileName = Path.ChangeExtension(item.Name, OriginalFileExtension),
                    FileName = fileName,
                    FileType = (byte)FileType.HearingRecording,
                    MimeType = item.Name.GetMimeTypeForFileExtension(),
                    FileDate = DateTime.UtcNow
                };

                var fileContext = FileContextFactory.GetStorageFromDisputeStorageType(disputeHearingRecording.FilesStorageSetting, SystemSettingsService);
                var file = await fileContext.StoreAsync(storeFileRequest, disputeHearingRecording.Dispute);
                await FileService.CreateAsyncV2(disputeHearingRecording.Dispute, file);
            }
            else
            {
                var destinationFilePath = Path.Combine(recordingError, item.Name);
                File.Move(item.FullName, destinationFilePath, true);
            }
        }

        await SystemTasks.Task.FromResult(true);
    }

    private async SystemTasks.Task<DisputeHearingRecordingResponse> FindAssociatedHearing(FileInfo fileInfo)
    {
        var fileNameWithoutExtension = Path.GetFileNameWithoutExtension(fileInfo.Name);
        var recordCode = fileNameWithoutExtension[..RecordingCodeSplitPosition];
        var hearingDate = fileNameWithoutExtension[RecordingCodeSplitPosition..];

        var hearingDatePst = GetDateTimeFromString(hearingDate);
        var disputeHearingRecording = await DisputeHearingService.FindRecordingHearing(recordCode, hearingDatePst.GetValueOrDefault());
        if (disputeHearingRecording == null)
        {
            return null;
        }

        var disputeHearingRecordingResponse = new DisputeHearingRecordingResponse
        {
            Dispute = MapperService.Map<DisputeResponse>(disputeHearingRecording.Dispute),
            HearingId = disputeHearingRecording.HearingId,
            LocalStartDateTime = hearingDatePst.GetValueOrDefault(),
            FilesStorageSetting = disputeHearingRecording.Dispute.FilesStorageSetting
        };

        return disputeHearingRecordingResponse;
    }

    private IEnumerable<FileInfo> GetRecordingsList(string folderName, string extension)
    {
        var di = new DirectoryInfo(folderName);
        return di.GetFiles($"?????????????????????.{extension}");
    }

    private void ConvertFiles(string folderName)
    {
        var audioQuality = _appSettings.AudioQuality ?? DefaultBitRate;
        var audioSamplingRate = _appSettings.AudioSamplingRate ?? DefaultAudioSamplingRate;
        var channels = _appSettings.AudioChannels ?? DefaultChannels;

        var di = new DirectoryInfo(folderName);
        var items = di.GetFiles($"?????????????????????.{OriginalFileExtension}");

        var audioCodec = new AudioConversionUtils();
        foreach (var item in items)
        {
            try
            {
                var fileFullName = Path.ChangeExtension(item.FullName, ConvertedFileExtension);
                audioCodec.Convert(item.FullName, fileFullName, audioQuality, audioSamplingRate, channels);

                var policy = Policy
                    .Handle<IOException>()
                    .WaitAndRetry(3, retryAttempt =>
                        TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)));

                policy.Execute(() => File.Delete(item.FullName));
            }
            catch (Exception e)
            {
                Logger.Error(e, "Audio encoding error");
            }
        }
    }

    private DateTime? GetDateTimeFromString(string dateAsString)
    {
        if (dateAsString.Length == DateLenght)
        {
            if (DateTime.TryParseExact(
                    dateAsString,
                    "yyyyMMddHHmmss",
                    CultureInfo.InvariantCulture,
                    DateTimeStyles.None,
                    out var dt))
            {
                return dt;
            }
        }

        return null;
    }
}