using CasaConSi.Api.Models.Enums;

namespace CasaConSi.Api.DTOs.Auth;

// Espejo de User en frontend/src/types/auth.ts, + Id (falta ahí, ver nota arriba) + Token
public record AuthResponseDto
{
    public required string Id { get; init; }
    public required string Name { get; init; }
    public required string Email { get; init; }
    public required UserRole Role { get; init; }
    public string? Avatar { get; init; }
    public string? Title { get; init; }
    public Generation? Generation { get; init; }
     public required bool IsAdmin { get; init; }
    public required string Token { get; init; }
    public required DateTime ExpiresAt { get; init; }
}