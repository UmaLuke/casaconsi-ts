using CasaConSi.Api.Models.Enums;

namespace CasaConSi.Api.DTOs.Trust;

public class TrustStatusResponseDto
{
    public int Score { get; set; }              // 0-10
    public int MaxScore { get; set; } = 10;
    public VerificationLevel Level { get; set; }
    public MembershipTier MembershipTier { get; set; }
    public bool IsDemoUser { get; set; }
    public List<TrustItemDto> Items { get; set; } = new();
}

public class TrustItemDto
{
    public required string Key { get; set; }        // ej. "identity_verified"
    public required string Label { get; set; }       // ej. "Identidad (DNI + selfie)"
    public bool Completed { get; set; }
    public bool RequiresPremium { get; set; }         // true para ítems 7-10
    public bool Locked { get; set; }                  // RequiresPremium && !Premium
}

// Auto-declarativo por ahora — ver nota sobre revisión de staff pendiente
// (no hay panel Admin todavía, ver Roadmap).
public class UpdateTrustItemsRequestDto
{
    public bool? IdentityVerified { get; set; }
    public bool? ContactVerified { get; set; }
    public bool? SocialMediaVerified { get; set; }
    public bool? CreditStatusVerified { get; set; }
    public bool? ProofOfStatusVerified { get; set; }
    public bool? SwornDeclarationAccepted { get; set; }
}