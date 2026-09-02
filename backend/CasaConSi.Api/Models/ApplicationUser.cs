using CasaConSi.Api.Models.Enums;
using Microsoft.AspNetCore.Identity;

namespace CasaConSi.Api.Models;

public class ApplicationUser : IdentityUser
{
    public required string Name { get; set; }
    public required UserRole Role { get; set; }
    public string? Avatar { get; set; }
    public List<string> GalleryPhotoPaths { get; set; } = new();
    public string? Title { get; set; }
    public Generation? Generation { get; set; }
    public string? Profession { get; set; }
    // Bio corta para la tarjeta de asesor en el catálogo de Asesorías.
    // Igual que Profession (ver ADR-0003), campo real pero sujeto a cambiar
    // de lugar si el módulo crece (ver docs/vault-casaconsi/modulos/Asesorias.md).
    public string? Bio { get; set; }

    // --- Sistema de confianza / verificación de perfiles ---
    public MembershipTier MembershipTier { get; set; } = MembershipTier.Freemium;

    // true solo para las cuentas que crea DemoProfileSeeder (Development).
    // Sirve para que el front distinga "cuenta demo" de un freemium real,
    // sin inventar un puntaje falso.
    public bool IsDemoUser { get; set; } = false;

    // true para la asesora que recibe los turnos por defecto mientras el
    // staff de Trabajo Social es chico (ver AdvisoryService.GetAvailabilityAsync
    // / CreateSessionAsync). Reservas centralizadas: el cliente nunca elige
    // asesora (ver Asesorias.md) — hoy este flag decide quién recibe cada
    // turno. A futuro, con más asesoras activas, la idea es que cualquiera
    // pueda tomar y confirmar un turno Pending — este flag deja de ser la
    // única fuente de asignación.
    public bool IsPrimaryAdvisor { get; set; } = false;
}