using System;
using System.IO;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Storage.Config;

namespace CM.Storage.FileSystem;

public class FileSystemStorage : IStorageRepository
{
    public string RepositoryType => "filesystem";

    public StorageRepositorySettings Settings { get; set; }

    public string GetFullPath(FileDefinition fileDefinition, ContainerDefinition containerDefinition)
    {
        return GetFullFilePath(fileDefinition, containerDefinition);
    }

    public Task<FileActionStatus> TryRead(FileDefinition fileDefinition, ContainerDefinition containerDefinition, out byte[] data)
    {
        var status = new FileActionStatus();
        var path = GetFullFilePath(fileDefinition, containerDefinition);

        try
        {
            data = File.ReadAllBytes(path);
            status.Status = Status.Success;
        }
        catch (Exception)
        {
            data = null;
            status.Status = Status.NoAction;
        }

        return Task.FromResult(status);
    }

    public async Task<FileActionStatus> SaveAsync(FileDefinition fileDefinition, ContainerDefinition containerDefinition, FileCreateOptions fileCreateOptions = default)
    {
        var status = new FileActionStatus();

        var directoryName = GetPath(fileDefinition, containerDefinition);
        FileUtils.CheckIfNotExistsCreate(directoryName);

        var path = GetFullFilePath(fileDefinition, containerDefinition);

        if (File.Exists(path))
        {
            status.Status = Status.FileAlreadyExists;

            return status;
        }

        var result = await SaveFile(path, fileDefinition.Data);
        status.Status = result.Status;
        status.Message = result.Message;
        status.AbsolutePath = path;

        return status;
    }

    public FileActionStatus Delete(FileDefinition fileDefinition, ContainerDefinition containerDefinition)
    {
        var status = new FileActionStatus();
        var path = GetFullFilePath(fileDefinition, containerDefinition);

        if (!File.Exists(path))
        {
            status.Status = Status.FileDoesNotExists;

            return status;
        }

        try
        {
            File.Delete(path);
        }
        catch (Exception exception)
        {
            status.Status = Status.Error;
            status.Message = exception.StackTrace;
        }

        status.Status = Status.Success;

        return status;
    }

    public FileActionStatus Move(FileDefinition fileDefinition, ContainerDefinition containerDefinition, ContainerDefinition newContainerDefinition, string newFileName = null)
    {
        var status = new FileActionStatus();
        var newFileDefinition = new FileDefinition { Name = newFileName ?? fileDefinition.Name };

        var oldPath = GetFullFilePath(fileDefinition, containerDefinition);
        var newPath = GetFullFilePath(newFileDefinition, newContainerDefinition);

        if (!File.Exists(oldPath))
        {
            status.Status = Status.FileDoesNotExists;

            return status;
        }

        try
        {
            var directoryName = GetPath(newFileDefinition, newContainerDefinition);

            FileUtils.CheckIfNotExistsCreate(directoryName);
            File.Move(oldPath, newPath);
        }
        catch (Exception exception)
        {
            status.Status = Status.NoAction;
            status.Message = exception.StackTrace;
        }

        status.Status = Status.Success;
        status.AbsolutePath = newPath;

        return status;
    }

    public FileActionStatus Move(string fileName, ContainerDefinition newContainerDefinition, FileDefinition newFileDefinition = null)
    {
        var status = new FileActionStatus();

        var newPath = GetFullFilePath(newFileDefinition, newContainerDefinition);

        if (!File.Exists(fileName))
        {
            status.Status = Status.FileDoesNotExists;

            return status;
        }

        try
        {
            var directoryName = GetPath(newFileDefinition, newContainerDefinition);
            FileUtils.CheckIfNotExistsCreate(directoryName);

            File.Move(fileName, newPath);
        }
        catch (Exception exception)
        {
            status.Status = Status.NoAction;
            status.Message = exception.StackTrace;
        }

        status.Status = Status.Success;
        status.AbsolutePath = newPath;

        return status;
    }

    public void Init()
    {
    }

    private static string GetFullFilePath(FileDefinition fileDefinition, ContainerDefinition containerDefinition)
    {
        return Path.Combine(containerDefinition.Path, fileDefinition.Name);
    }

    private static string GetPath(FileDefinition fileDefinition, ContainerDefinition containerDefinition)
    {
        return Path.GetDirectoryName(Path.Combine(containerDefinition.Path, fileDefinition.Name));
    }

    private static async Task<FileActionStatus> SaveFile(string path, byte[] data)
    {
        var status = new FileActionStatus();

        try
        {
            await using var sourceStream = new FileStream(path, FileMode.Create, FileAccess.Write, FileShare.None);

            await sourceStream.WriteAsync(data.AsMemory(0, data.Length));
        }
        catch (Exception exception)
        {
            status.Status = Status.Error;
            status.Message = exception.StackTrace;
        }

        status.Status = Status.Success;

        return status;
    }
}