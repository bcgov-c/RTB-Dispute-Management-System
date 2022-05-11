namespace CM.SFTP;

public interface ISftpProxy
{
    public bool CheckConnection();

    public bool DownloadDirectory(string source, string temp, string destination, int maxFileBatch);
}