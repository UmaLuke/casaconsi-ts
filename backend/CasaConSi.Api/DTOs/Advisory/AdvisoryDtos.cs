using CasaConSi.Api.Models.Enums;

namespace CasaConSi.Api.DTOs.Advisory;

public record AvailabilitySlotDto
{
    public required string Time { get; init; } // "HH:mm"
    public required bool Available { get; init; }
}

public record CreateAdvisorySessionRequestDto
{
    public required AdvisorySessionType SessionType { get; init; }
    public required DateOnly Date { get; init; }
    public required string Time { get; init; } // "HH:mm"
}

public record AdvisorySessionDto
{
    public required Guid Id { get; init; }
    public required AdvisorySessionType SessionType { get; init; }
    public required DateTime ScheduledAt { get; init; }
    public required AdvisorySessionStatus Status { get; init; }
    public required decimal Price { get; init; }
}
