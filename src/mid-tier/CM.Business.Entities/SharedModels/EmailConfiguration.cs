namespace CM.Business.Entities.SharedModels;

public class EmailConfiguration
{
    public string Host { get; set; }

    public int Port { get; set; }

    public bool EnableSsl { get; set; }

    public int Timeout { get; set; }

    public string User { get; set; }

    public string Password { get; set; }

    public string FileStorageRoot { get; set; }

    public string CommonFileStorageRoot { get; set; }
}