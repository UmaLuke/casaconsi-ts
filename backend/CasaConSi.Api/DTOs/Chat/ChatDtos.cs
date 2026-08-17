namespace CasaConSi.Api.DTOs.Chat;

public record MessageDto
{
    public required Guid Id { get; init; }
    public required Guid MatchId { get; init; }
    public required string SenderUserId { get; init; }
    public required string Content { get; init; }
    public required DateTime CreatedAt { get; init; }
}

public record ConversationSummaryDto
{
    public required Guid MatchId { get; init; }
    public required string CounterpartUserId { get; init; }
    public required string CounterpartName { get; init; }
    public string? CounterpartPhotoUrl { get; init; }
    public string? LastMessage { get; init; }
    public DateTime? LastMessageAt { get; init; }
}