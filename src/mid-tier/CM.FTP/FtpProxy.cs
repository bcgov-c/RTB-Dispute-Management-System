using System;
using System.Net;
using System.Threading.Tasks;
using FluentFTP;

namespace CM.FTP;

public static class FtpProxy
{
    public static async Task<FtpStatus> UploadFileAsync(Uri host, string remotePath, NetworkCredential networkCredential, string filePath)
    {
        using var ftp = new FtpClient(host, networkCredential);
        ftp.UploadDataType = FtpDataType.ASCII;
        await ftp.ConnectAsync();
        return await ftp.UploadFileAsync(filePath, remotePath, FtpRemoteExists.Overwrite, true, FtpVerify.Retry);
    }
}