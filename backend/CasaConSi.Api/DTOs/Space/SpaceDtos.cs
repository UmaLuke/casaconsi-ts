using CasaConSi.Api.Models.Enums;

namespace CasaConSi.Api.DTOs.Space;

// Espejo de Space en frontend/src/types/space.ts. Nota: `Id` es Guid acá
// (string en JSON) — el frontend lo tenía tipado `number`, hay que corregirlo
// (ver bloque de frontend).
public record SpaceResponseDto
{
    public required Guid Id { get; init; }
    public required string HostUserId { get; init; }
    public required string HostName { get; init; }
    public required string Title { get; init; }
    public required string Location { get; init; }
    public required string Neighborhood { get; init; }
    public required decimal Price { get; init; }
    public required string Currency { get; init; } // siempre "ARS" por ahora
    public required string HostType { get; init; }
    public required Generation HostGeneration { get; init; }
    public required string Purpose { get; init; }
    public required string Duration { get; init; }
    public required List<string> Amenities { get; init; }
    public string? ImageUrl { get; init; }
    public required bool Verified { get; init; }
}

public record CreateSpaceRequestDto
{
    public required string Title { get; init; }
    public required string Description { get; init; }
    public required string Location { get; init; }
    public required string Neighborhood { get; init; }
    public required string HostType { get; init; }
    public required decimal Price { get; init; }
    public required string Purpose { get; init; }
    public required string Duration { get; init; }
    public required List<string> Amenities { get; init; }
}