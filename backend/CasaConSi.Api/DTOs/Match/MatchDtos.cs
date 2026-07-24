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