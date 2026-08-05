namespace backend.Auth;

public class JwtOptions
{
    public const string SectionName = "Jwt";
    public string Key { get; set; } = string.Empty;
    public string Issuer { get; set; } = "SchoolManagement";
    public string Audience { get; set; } = "SchoolManagement";
    public int ExpiryMinutes { get; set; } = 480;
}
