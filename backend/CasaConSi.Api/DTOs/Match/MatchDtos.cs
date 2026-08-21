using CasaConSi.Api.Models.Enums;

namespace CasaConSi.Api.DTOs.Match;

// DTOs "públicos": nunca incluyen Health ni Dni (ver nota de protección de
// datos en Models/Profiles/StudentProfileSections.cs y HostProfileSections.cs).

public record MatchFeedItemDto
{
    public required string UserId { get; init; }
    public required string FullName { get; init; }
    public string? ProfilePhotoUrl { get; init; }
    public string? PresentationMediaUrl { get; init; }
    public required string AboutMe { get; init; }
    public required List<string> Neighborhoods { get; init; }
}

public record LikeRequestDto
{
    public required string TargetUserId { get; init; }
    public required bool Liked { get; init; }
}

public record LikeResponseDto
{
    public required bool IsMatch { get; init; }
    public Guid? MatchId { get; init; }
}

public record MatchSummaryDto
{
    public required Guid Id { get; init; }
    public required string CounterpartUserId { get; init; }
    public required string CounterpartName { get; init; }
    public string? CounterpartPhotoUrl { get; init; }
    public required DateTime CreatedAt { get; init; }
}

// Card de la cuadrícula "Interesados en tu publicación" (host): estudiantes
// que ya te dieron like y todavía no decidiste. Ver MatchService.GetInterestedStudentsAsync.
public record InterestedStudentDto
{
    public required string UserId { get; init; }
    public required string FullName { get; init; }
    public string? ProfilePhotoUrl { get; init; }
    public required string StudyOrWorkSummary { get; init; }
    public required int TrustScore { get; init; }
    public required VerificationLevel TrustLevel { get; init; }
}

// Detalle completo de un estudiante interesado, para StudentDetailPage.tsx.
public record StudentDetailDto
{
    public required string UserId { get; init; }
    public required string FullName { get; init; }
    public required List<string> PhotoUrls { get; init; }
    public required string AboutMe { get; init; }
    public required string Motivation { get; init; }
    public required List<string> PreferredNeighborhoods { get; init; }
    public required string StudyOrWorkSummary { get; init; }
    public required string StayDuration { get; init; }
    public required Generation Generation { get; init; }
    public required int TrustScore { get; init; }
    public required VerificationLevel TrustLevel { get; init; }
}