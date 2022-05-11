using System;
using System.IO;
using System.Linq;
using Renci.SshNet;
using Renci.SshNet.Sftp;
using Serilog;

namespace CM.SFTP;

public class SftpProxy : ISftpProxy
{
    public SftpProxy(ILogger logger, string keyFilePath, string host, string user, int port)
    {
        var privateKeyFile = new PrivateKeyFile(keyFilePath);
        ConnectionInfo = new ConnectionInfo(host, port, user, new PrivateKeyAuthenticationMethod(user, privateKeyFile));
        Logger = logger;
    }

    private ConnectionInfo ConnectionInfo { get; }

    private ILogger Logger { get; }

    public bool CheckConnection()
    {
        using var client = new SftpClient(ConnectionInfo);

        client.Connect();

        if (client.IsConnected)
        {
            client.Disconnect();

            return false;
        }

        client.Disconnect();

        return false;
    }

    public bool DownloadDirectory(string source, string temp, string destination, int maxFileBatch)
    {
        using var client = new SftpClient(ConnectionInfo);

        try
        {
            client.Connect();

            var files = client.ListDirectory(source).ToList();

            var count = files.Count(x => x.IsRegularFile);
            Logger.Information("{Count} files found", count);

            if (count > maxFileBatch)
            {
                Logger.Warning("Files count exceed Max Allowed Batch size");
            }

            foreach (var file in files.Where(file => file.IsRegularFile))
            {
                try
                {
                    var fileName = file.Name;
                    var tempFilePath = DownloadFile(client, file, temp);
                    Move(tempFilePath, destination, fileName);
                    Delete(file);
                }
                catch (Exception exc)
                {
                    Logger.Error(exc, "Couldn't handle file");
                }
            }
        }
        finally
        {
            client.Disconnect();
        }

        return true;
    }

    private void Move(string temp, string destination, string fileName)
    {
        var destinationFilePath = Path.Combine(destination, fileName);
        File.Move(temp, destinationFilePath, true);
    }

    private void Delete(SftpFile file)
    {
        try
        {
            file.Delete();
        }
        catch (Exception e)
        {
            Logger.Error(e, "Cannot delete file {Name}", file.Name);
        }
    }

    private string DownloadFile(ISftpClient client, SftpFile file, string directory)
    {
        var destinationFilePath = Path.Combine(directory, file.Name);
        Logger.Information("Downloading {FullName} to {DestinationFilePath}", file.FullName, destinationFilePath);

        using Stream fileStream = File.OpenWrite(destinationFilePath);

        client.DownloadFile(file.FullName, fileStream);

        fileStream.Flush();

        Logger.Information("Download completed {FullName}", file.FullName);

        return destinationFilePath;
    }
}