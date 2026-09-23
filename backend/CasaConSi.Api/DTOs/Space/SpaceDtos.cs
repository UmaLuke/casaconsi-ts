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
    public required string Description { get; init; }
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
    public required List<string> PhotoUrls { get; init; }
    public required bool Verified { get; init; }
    public required bool IsActive { get; init; }
    public string? HostAboutMe { get; init; }
    public required int HostTrustScore { get; init; }
    public required VerificationLevel HostTrustLevel { get; init; }
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

public record UpdateSpaceRequestDto
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

// NUEVO
public record UpdateSpaceStatusRequestDto
{
    public required bool IsActive { get; init; }
}

// NUEVO — índices actuales de PhotoPaths en el orden deseado, ej. [2, 0, 1]
public record ReorderSpacePhotosRequestDto
{
    public required List<int> Order { get; init; }
}