namespace CasaConSi.Api.Models;

// Una habitación/propiedad publicada por un anfitrión. Relación N:1 con
// ApplicationUser (un anfitrión puede tener varios Space — ver MySpacesList
// en el roadmap frontend). No confundir con HostProfile.HousingData: eso es
// el cuestionario ("cómo es mi casa"), esto es cada publicación puntual que
// arma el anfitrión para ofrecer un lugar.
public class Space
{
    public Guid Id { get; set; }
    public required string HostUserId { get; set; }
    public ApplicationUser? Host { get; set; }

    public required string Title { get; set; }
    public required string Description { get; set; }
    public required string Location { get; set; } // descriptivo, ej. "Centro Sur, a 15 min de la Universidad"
    public required string Neighborhood { get; set; } // canónico, para filtrar (ExploreSpacesPage)
    public required string HostTypeLabel { get; set; } // ej. "Propietario", "Familia Anfitriona" — texto libre
    public required decimal PriceArs { get; set; }
    public required string Purpose { get; set; } // "compartir-gastos" | "estudiar"
    public required string Duration { get; set; } // "anual" | "intermitente-ocasional" | "semestral-cuatrimestral" | "otra-modalidad"
    public List<string> Amenities { get; set; } = new();

    // Fotos reales, subidas vía FileStorageService (multipart) — igual que HostProfile.HomePhotoPaths.
    public List<string> PhotoPaths { get; set; } = new();
    // Temporal: URL externa para poder sembrar datos de demo sin subir archivos reales.
    // Se usa solo si PhotoPaths está vacío — ver SpaceService.ToResponseDto.
    public string? ExternalImageUrl { get; set; }

    public bool Verified { get; set; } = false;
    public bool IsActive { get; set; } = true; // publicado/pausado (MySpacesList, futuro)

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}