using System.ComponentModel.DataAnnotations;
using CasaConSi.Api.Models.Enums;

namespace CasaConSi.Api.DTOs.Account;

// Datos de la CUENTA (acceso: nombre, email, password, avatar) — distinto del
// perfil de match (host/student, ver DTOs/Profile). Espejo de User en
// frontend/src/types/auth.ts, sin Token/ExpiresAt (eso solo viaja en login/registro).
public record AccountResponseDto
{
    public required string Id { get; init; }
    public required string Name { get; init; }
    public required string Email { get; init; }
    public required UserRole Role { get; init; }
    public string? Avatar { get; init; }
    public string? Title { get; init; }
    public string? Profession { get; init; }
    public Generation? Generation { get; init; }
    public required bool IsAdmin { get; init; }
}

public record UpdateAccountRequestDto
{
    [Required, MaxLength(120)]
    public required string Name { get; init; }
}

public record ChangePasswordRequestDto
{
    [Required]
    public required string CurrentPassword { get; init; }

    // Mismo mínimo que Identity (ver Program.cs: Password.RequiredLength = 8).
    [Required, MinLength(8)]
    public required string NewPassword { get; init; }
}

public record ChangeEmailRequestDto
{
    [Required, EmailAddress]
    public required string NewEmail { get; init; }

    // Se exige la contraseña actual para confirmar identidad antes de tocar
    // el email — mismo criterio que ChangePassword.
    [Required]
    public required string CurrentPassword { get; init; }
}
