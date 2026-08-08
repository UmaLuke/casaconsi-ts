using CasaConSi.Api.Models.Enums;
using Microsoft.AspNetCore.Identity;

namespace CasaConSi.Api.Models;

public class ApplicationUser : IdentityUser
{
    public required string Name { get; set; }
    public required UserRole Role { get; set; }
    public string? Avatar { get; set; }
    public string? Title { get; set; }
    public Generation? Generation { get; set; }
    public string? Profession { get; set; }

    // --- Sistema de confianza / verificación de perfiles ---
    public MembershipTier MembershipTier { get; set; } = MembershipTier.Freemium;

    // true solo para las cuentas que crea DemoProfileSeeder (Development).
    // Sirve para que el front distinga "cuenta demo" de un freemium real,
    // sin inventar un puntaje falso.
    public bool IsDemoUser { get; set; } = false;
}