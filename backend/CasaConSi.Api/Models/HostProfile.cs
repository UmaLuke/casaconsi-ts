using CasaConSi.Api.Models.Profiles;

namespace CasaConSi.Api.Models;

// Perfil completo del cuestionario "OFREZCO CASA CON SI" (rol: host).
// Ver notas de diseño en StudentProfile.cs — aplican igual acá.
public class HostProfile
{
    public Guid Id { get; set; }
    public required string UserId { get; set; }
    public ApplicationUser? User { get; set; }

    public string EncryptedDni { get; set; } = string.Empty;

    public HostPersonalData PersonalData { get; set; } = new();
    public HostWorkSituation WorkSituation { get; set; } = new();
    public HostHousingData HousingData { get; set; } = new();
    public HostExchangesExpected ExchangesExpected { get; set; } = new();
    public HostHealth Health { get; set; } = new();
    public HostHabits Habits { get; set; } = new();
    public HostTenantPreferences TenantPreferences { get; set; } = new();
    public HostPersonalPresentation PersonalPresentation { get; set; } = new();

    // Columnas promovidas para el futuro Match module (ver plan acordado).
    public string PreferredTenantGeneration { get; set; } = "indiferente";
    public string Neighborhood { get; set; } = string.Empty;
    public string ExpectedAmountRangeArs { get; set; } = string.Empty;
    public int AvailableRooms { get; set; } = 1;
    public string HousingType { get; set; } = "casa";

    // Fotos: se cargan aparte vía POST /api/profile/host/photos (multipart).
    public string? ProfilePhotoPath { get; set; }
    public string? PresentationMediaPath { get; set; }
    public List<string> HomePhotoPaths { get; set; } = new();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
