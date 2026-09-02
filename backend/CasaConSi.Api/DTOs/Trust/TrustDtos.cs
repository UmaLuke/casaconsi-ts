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
public class SavePersonalReferencesRequestDto
{
    public required string Reference1Name { get; set; }
    public required string Reference1Phone { get; set; }
    public required string Reference1Relationship { get; set; }
    public required string Reference2Name { get; set; }
    public required string Reference2Phone { get; set; }
    public required string Reference2Relationship { get; set; }
}

public class AltaConfianzaEvidenceDto
{
    public string? Reference1Name { get; set; }
    public string? Reference1Phone { get; set; }
    public string? Reference1Relationship { get; set; }
    public string? Reference2Name { get; set; }
    public string? Reference2Phone { get; set; }
    public string? Reference2Relationship { get; set; }
    public bool HasCriminalRecordDocument { get; set; }
    public string? CriminalRecordDocumentUrl { get; set; }
    public DateTime? CriminalRecordDocumentUploadedAtUtc { get; set; }
}