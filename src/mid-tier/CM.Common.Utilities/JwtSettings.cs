namespace CM.Common.Utilities;

public class JwtSettings
{
    public string Key { get; set; }

    public string Issuer { get; set; }

    public string Audience { get; set; }

    public string Expires { get; set; }

    public int ExpireRange { get; set; }

    public int RefreshRange { get; set; }
}