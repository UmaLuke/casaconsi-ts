using CasaConSi.Api.Models.Profiles;

namespace CasaConSi.Api.Models;

// Perfil completo del cuestionario "BUSCO CASA CON SI" (rol: student).
// Relación 1:1 con ApplicationUser vía UserId. "Perfil completado" = existe
// este registro para el usuario — no hay flag aparte (ver plan de arquitectura).
public class StudentProfile
{
    public Guid Id { get; set; }
    public required string UserId { get; set; }
    public ApplicationUser? User { get; set; }

    // DNI protegido con ASP.NET Data Protection (ver ProfileService). No vive
    // en texto plano ni se guarda duplicado dentro de PersonalData.
    public string EncryptedDni { get; set; } = string.Empty;

    public StudentPersonalData PersonalData { get; set; } = new();
    public StudentTravelReason TravelReason { get; set; } = new();
    public StudentLocationPreferences LocationPreferences { get; set; } = new();
    public StudentEconomicSituation EconomicSituation { get; set; } = new();
    public StudentExchangesOffered ExchangesOffered { get; set; } = new();
    public StudentHabits Habits { get; set; } = new();
    public StudentHealth Health { get; set; } = new();
    public StudentHostPreferences HostPreferences { get; set; } = new();
    public StudentPersonalPresentation PersonalPresentation { get; set; } = new();

    // Columnas promovidas fuera del jsonb: lo que el futuro Match module va a
    // necesitar filtrar/indexar (generación preferida, zona, presupuesto,
    // disponibilidad). ProfileService las sincroniza desde las secciones de
    // arriba en cada guardado — ver "modelo de datos" en el plan acordado.
    public string PreferredHostGeneration { get; set; } = "indiferente";
    public List<string> PreferredNeighborhoods { get; set; } = new();
    public string ContributionRangeArs { get; set; } = string.Empty;
    public DateOnly? AvailableFrom { get; set; }
    public string StayDuration { get; set; } = string.Empty;

    // Fotos: se cargan aparte vía POST /api/profile/student/photos (multipart),
    // no en este submit — el schema del frontend no las marca `required`.
    public string? ProfilePhotoPath { get; set; }
    public string? PresentationMediaPath { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
