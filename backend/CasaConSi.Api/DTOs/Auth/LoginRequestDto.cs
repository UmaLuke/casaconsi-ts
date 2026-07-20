using System.ComponentModel.DataAnnotations;

namespace CasaConSi.Api.DTOs.Auth;

public record LoginRequestDto
{
    [Required, EmailAddress]
    public required string Email { get; init; }

    [Required]
    public required string Password { get; init; }
}