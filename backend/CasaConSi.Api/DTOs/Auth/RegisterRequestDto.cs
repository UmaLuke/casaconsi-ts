using System.ComponentModel.DataAnnotations;
using CasaConSi.Api.Models.Enums;

namespace CasaConSi.Api.DTOs.Auth;

// Espejo de RegisterFormData en frontend/src/components/features/auth/RegisterForm.tsx
public record RegisterRequestDto
{
    [Required, MaxLength(120)]
    public required string Name { get; init; }

    [Required, EmailAddress]
    public required string Email { get; init; }

    [Required, MinLength(8)] // ver nota arriba: frontend hoy valida minLength=6
    public required string Password { get; init; }

    [Required]
    public required UserRole Role { get; init; }
}