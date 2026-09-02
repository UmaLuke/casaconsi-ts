using CasaConSi.Api.Models.Enums;

namespace CasaConSi.Api.DTOs.Admin;

public class AdminVerificationQueueItemDto
{
    public required string UserId { get; set; }
    public required string Name { get; set; }
    public UserRole Role { get; set; }
    public int BasicScore { get; set; }      // 0-6, ya confirmado
    public DateTime? RequestedAtUtc { get; set; }
}

public class AdminVerificationItemDto
{
    public required string Key { get; set; }
    public required string Label { get; set; }
    public bool Completed { get; set; }
}

public class AdminVerificationDetailDto
{
    public required string UserId { get; set; }
    public required string Name { get; set; }
    public UserRole Role { get; set; }
    public MembershipTier MembershipTier { get; set; }
    public int BasicScore { get; set; }
    public VerificationReviewStatus Status { get; set; }
    public DateTime? RequestedAtUtc { get; set; }
    public DateTime? ReviewedAtUtc { get; set; }
    public string? RejectionReason { get; set; }
    public AdminVerificationReferenceDto? Reference1 { get; set; }
    public AdminVerificationReferenceDto? Reference2 { get; set; }
    public string? CriminalRecordDocumentUrl { get; set; }
    public DateTime? CriminalRecordDocumentUploadedAtUtc { get; set; }
    public List<AdminVerificationItemDto> BasicItems { get; set; } = new();
    public List<AdminVerificationItemDto> AltaConfianzaItems { get; set; } = new();
}

public class AdminVerificationRejectRequestDto
{
    public required string Reason { get; set; }
}

public class AdminVerificationReferenceDto
{
    public required string Name { get; set; }
    public required string Phone { get; set; }
    public required string Relationship { get; set; }
}