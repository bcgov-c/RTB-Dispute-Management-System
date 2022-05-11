using System;
using System.Globalization;
using System.IO;
using System.Reflection;
using System.Threading.Tasks;
using CM.Business.Entities.Models.Dispute;
using CM.Business.Entities.Models.Files;
using CM.Common.ChunkedFileUpload;
using CM.Common.Utilities;
using Microsoft.AspNetCore.Mvc;
using Serilog;

namespace CM.FileSystem.Service;

public class FileContext
{
    private readonly IStorageStrategy _storageStrategy;

    public FileContext(IStorageStrategy storageStrategy)
    {
        _storageStrategy = storageStrategy;
    }

    public async Task<string> GetFilePath(string filePath)
    {
        var rootFileFolder = await _storageStrategy.StorageRootFolderAsync;

        return Path.Combine(rootFileFolder, filePath);
    }

    public async Task<IActionResult> GetFileStreamResult(string filePath, string fileMimeType = null)
    {
        var absoluteFilePath = await GetFilePath(filePath);
        var mimeType = fileMimeType ?? MimeTypes.GetMimeType(absoluteFilePath);

        if (File.Exists(absoluteFilePath))
        {
            return await GetFile(absoluteFilePath, mimeType);
        }

        return null;
    }

    public async Task<IActionResult> GetFileThumbnailStreamResult(string filePath, string defaultResourceImage)
    {
        var thumbnailImage = await GetFileThumbnail(filePath);
        return thumbnailImage ?? await GetFileFromResource(defaultResourceImage, "image/png");
    }

    public async Task<FileUploadInfo> StoreAsync(StoreFileRequest storeFileRequest, DisputeResponse dispute)
    {
        var tempFileFolder = await _storageStrategy.TempFileRootAsync;
        FileUtils.CheckIfNotExistsCreate(tempFileFolder);

        var newFileGuid = Guid.NewGuid();
        var createdDateTime = DateTime.UtcNow.GetCmDateTime();

        var fileRelativePath = Path.Combine(
            createdDateTime.Year.ToString(),
            createdDateTime.Month.ToString(),
            createdDateTime.Day.ToString(),
            dispute.FileNumber.ToString(),
            storeFileRequest.FileType.ToString(),
            newFileGuid.ToString());

        var culture = new CultureInfo(CmCultureInfo.EnCulture);
        var fileDate = Convert.ToDateTime(storeFileRequest.FileDate, culture);

        var file = new FileUploadInfo
        {
            FileGuid = newFileGuid,
            FileSize = storeFileRequest.FileInfo.Length,
            FileMimeType = storeFileRequest.MimeType,
            FileName = storeFileRequest.FileName,
            OriginalFileName = storeFileRequest.OriginalFileName,
            FileType = storeFileRequest.FileType,
            FilePath = fileRelativePath,
            FileDate = fileDate,
            AddedBy = storeFileRequest.AddedBy,
            FilePackageId = storeFileRequest.FilePackageId,
            SubmitterName = storeFileRequest.SubmitterName
        };

        var rootFolder = await _storageStrategy.StorageRootFolderAsync;

        var absolutePath = Path.Combine(rootFolder, fileRelativePath);
        FileUtils.CheckIfNotExistsCreate(Path.GetDirectoryName(absolutePath));
        Log.Information("File path {AbsolutePath}", absolutePath);

        try
        {
            File.Move(storeFileRequest.FileInfo.FullName, absolutePath);
        }
        catch (Exception exc)
        {
            Log.Error(exc, "File path {AbsolutePath}", absolutePath);
            throw;
        }

        ThumbnailHelper.Create(absolutePath, await _storageStrategy.SystemSettingsService.GetValueAsync<int>(SettingKeys.ThumbnailHeight));

        return file;
    }

    public async Task<FileUploadInfo> StoreAsync(UploadFileRequest uploadFileRequest, DisputeResponse dispute)
    {
        var tempFileFolder = await _storageStrategy.TempFileRootAsync;
        FileUtils.CheckIfNotExistsCreate(tempFileFolder);

        var fileName = uploadFileRequest.FileGuid.ToString();
        var path = Path.Combine(tempFileFolder, fileName);

        var formFile = uploadFileRequest.OriginalFile;

        var fileMode = uploadFileRequest.IsChunk ? FileMode.Append : FileMode.Create;

        await using (var fs = new FileStream(path, fileMode, FileAccess.Write))
        {
            await formFile.CopyToAsync(fs);
            fs.Flush();
            fs.Close();
        }

        if (uploadFileRequest.IsChunk && !uploadFileRequest.IsLast)
        {
            return null;
        }

        var newFileGuid = Guid.NewGuid();
        var createdDateTime = DateTime.UtcNow.GetCmDateTime();

        var fileRelativePath = Path.Combine(
            createdDateTime.Year.ToString(),
            createdDateTime.Month.ToString(),
            createdDateTime.Day.ToString(),
            dispute.FileNumber.ToString(),
            uploadFileRequest.FileType.ToString(),
            newFileGuid.ToString());

        var culture = new CultureInfo(CmCultureInfo.EnCulture);
        var fileDate = Convert.ToDateTime(uploadFileRequest.FileDate, culture);

        var fileInfo = new FileInfo(path);

        var file = new FileUploadInfo
        {
            FileGuid = newFileGuid,
            FileSize = fileInfo.Length,
            FileMimeType = formFile.ContentType,
            FileName = uploadFileRequest.FileName,
            OriginalFileName = formFile.FileName,
            FileType = uploadFileRequest.FileType,
            FilePath = fileRelativePath,
            FileDate = fileDate,
            AddedBy = uploadFileRequest.AddedBy,
            FilePackageId = uploadFileRequest.FilePackageId,
            SubmitterName = uploadFileRequest.SubmitterName
        };

        var rootFolder = await _storageStrategy.StorageRootFolderAsync;

        var absolutePath = Path.Combine(rootFolder, fileRelativePath);
        FileUtils.CheckIfNotExistsCreate(Path.GetDirectoryName(absolutePath));
        Log.Information("File path {AbsolutePath}", absolutePath);

        try
        {
            File.Move(path, absolutePath);
        }
        catch (Exception exc)
        {
            Log.Error(exc, "File path {AbsolutePath}", absolutePath);
            throw;
        }

        ThumbnailHelper.Create(absolutePath, await _storageStrategy.SystemSettingsService.GetValueAsync<int>(SettingKeys.ThumbnailHeight));

        return file;
    }

    public async Task<FileUploadInfo> StoreAsync(UploadFileRequest uploadFileRequest)
    {
        var tempFileFolder = await _storageStrategy.TempFileRootAsync;
        FileUtils.CheckIfNotExistsCreate(tempFileFolder);

        var fileName = uploadFileRequest.FileGuid.ToString();
        var path = Path.Combine(tempFileFolder, fileName);

        var formFile = uploadFileRequest.OriginalFile;

        var fileMode = uploadFileRequest.IsChunk ? FileMode.Append : FileMode.Create;

        await using (var fs = new FileStream(path, fileMode, FileAccess.Write))
        {
            await formFile.CopyToAsync(fs);
            fs.Flush();
            fs.Close();
        }

        if (uploadFileRequest.IsChunk && !uploadFileRequest.IsLast)
        {
            return null;
        }

        var newFileGuid = Guid.NewGuid();
        var createdDateTime = DateTime.UtcNow.GetCmDateTime();

        var fileRelativePath = Path.Combine(
            createdDateTime.Year.ToString(),
            createdDateTime.Month.ToString(),
            createdDateTime.Day.ToString(),
            uploadFileRequest.FileType.ToString(),
            newFileGuid.ToString());

        var culture = new CultureInfo(CmCultureInfo.EnCulture);
        var fileDate = Convert.ToDateTime(uploadFileRequest.FileDate, culture);

        var fileInfo = new FileInfo(path);

        var file = new FileUploadInfo
        {
            FileGuid = newFileGuid,
            FileSize = fileInfo.Length,
            FileMimeType = formFile.ContentType,
            FileName = uploadFileRequest.FileName,
            OriginalFileName = formFile.FileName,
            FileType = uploadFileRequest.FileType,
            FilePath = fileRelativePath,
            FileDate = fileDate,
            AddedBy = uploadFileRequest.AddedBy,
            FilePackageId = uploadFileRequest.FilePackageId,
            SubmitterName = uploadFileRequest.SubmitterName,
            FileTitle = uploadFileRequest.FileTitle,
            FileStatus = uploadFileRequest.FileStatus,
            FileDescription = uploadFileRequest.FileDescription
        };

        var rootFolder = await _storageStrategy.StorageRootFolderAsync;

        var absolutePath = Path.Combine(rootFolder, fileRelativePath);
        FileUtils.CheckIfNotExistsCreate(Path.GetDirectoryName(absolutePath));
        Log.Information("File path {AbsolutePath}", absolutePath);

        try
        {
            File.Move(path, absolutePath);
        }
        catch (Exception exc)
        {
            Log.Error(exc, "File path {AbsolutePath}", absolutePath);
            throw;
        }

        ThumbnailHelper.Create(absolutePath, await _storageStrategy.SystemSettingsService.GetValueAsync<int>(SettingKeys.ThumbnailHeight));

        return file;
    }

    public async Task Delete(FileResponse fileResponse)
    {
        var filePath = await GetFilePath(fileResponse.FilePath);
        File.Delete(filePath);
    }

    private async Task<IActionResult> GetFile(string filePath, string fileMimeType)
    {
        var memory = new MemoryStream();

        await using (var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read))
        {
            await stream.CopyToAsync(memory);
        }

        memory.Position = 0;
        return new FileStreamResult(memory, fileMimeType);
    }

    private async Task<IActionResult> GetFileThumbnail(string filePath)
    {
        var thumbFileName = string.Format(ThumbnailHelper.FilePattern, Path.GetFileName(filePath));
        var thumbFileDirName = Path.GetDirectoryName(filePath);

        if (thumbFileDirName != null)
        {
            var thumbFilePath = Path.Combine(thumbFileDirName, thumbFileName);

            var absoluteThumbFilePath = await GetFilePath(thumbFilePath);
            if (File.Exists(absoluteThumbFilePath))
            {
                return await GetFile(absoluteThumbFilePath, "image/jpeg");
            }
        }

        return null;
    }

    private async Task<IActionResult> GetFileFromResource(string namespaceAndFileName, string fileMimeType)
    {
        var memory = new MemoryStream();

        await using (var stream = Assembly.GetExecutingAssembly().GetManifestResourceStream(namespaceAndFileName))
        {
            if (stream != null)
            {
                await stream.CopyToAsync(memory);
            }
        }

        memory.Position = 0;
        return new FileStreamResult(memory, fileMimeType);
    }
}