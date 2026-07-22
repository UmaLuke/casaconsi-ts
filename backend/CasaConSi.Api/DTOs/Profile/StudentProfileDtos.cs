using CasaConSi.Api.Models.Profiles;

namespace CasaConSi.Api.DTOs.Profile;

// Request/Response reutilizan las mismas clases de sección que StudentProfile
// (Models/Profiles/StudentProfileSections.cs) en vez de duplicar 9 clases más:
// son simples contenedores de datos sin lógica, así que exponerlas tal cual
// en el contrato de API evita mantener dos copias idénticas. Si el día de
// mañana el shape expuesto necesita divergir del persistido, ahí se separan.
//
// Espejo de StudentQuestionnaireData en frontend/src/types/questionnaire-student.ts
// (Dni sale de PersonalData acá porque en el backend se maneja aparte, cifrado).
public record StudentProfileRequestDto
{
    public required string Dni { get; init; }
    public required StudentPersonalData PersonalData { get; init; }
    public required StudentTravelReason TravelReason { get; init; }
    public required StudentLocationPreferences LocationPreferences { get; init; }
    public required StudentEconomicSituation EconomicSituation { get; init; }
    public required StudentExchangesOffered ExchangesOffered { get; init; }
    public required StudentHabits Habits { get; init; }
    public required StudentHealth Health { get; init; }
    public required StudentHostPreferences HostPreferences { get; init; }
    public required StudentPersonalPresentation PersonalPresentation { get; init; }
}

public record StudentProfileResponseDto
{
    public required Guid Id { get; init; }
    // Desencriptado: solo se arma este DTO para el dueño autenticado del perfil.
    public required string Dni { get; init; }
    public required StudentPersonalData PersonalData { get; init; }
    public required StudentTravelReason TravelReason { get; init; }
    public required StudentLocationPreferences LocationPreferences { get; init; }
    public required StudentEconomicSituation EconomicSituation { get; init; }
    public required StudentExchangesOffered ExchangesOffered { get; init; }
    public required StudentHabits Habits { get; init; }
    public required StudentHealth Health { get; init; }
    public required StudentHostPreferences HostPreferences { get; init; }
    public required StudentPersonalPresentation PersonalPresentation { get; init; }
    public string? ProfilePhotoUrl { get; init; }
    public string? PresentationMediaUrl { get; init; }
    public required DateTime UpdatedAt { get; init; }
}
