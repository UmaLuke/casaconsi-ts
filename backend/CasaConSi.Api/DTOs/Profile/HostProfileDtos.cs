using CasaConSi.Api.Models.Profiles;

namespace CasaConSi.Api.DTOs.Profile;

// Ver nota sobre reutilizar las clases de sección en StudentProfileDtos.cs —
// aplica igual acá. Espejo de HostQuestionnaireData en
// frontend/src/types/questionnaire-host.ts.
public record HostProfileRequestDto
{
    public required string Dni { get; init; }
    public required HostPersonalData PersonalData { get; init; }
    public required HostWorkSituation WorkSituation { get; init; }
    public required HostHousingData HousingData { get; init; }
    public required HostExchangesExpected ExchangesExpected { get; init; }
    public required HostHealth Health { get; init; }
    public required HostHabits Habits { get; init; }
    public required HostTenantPreferences TenantPreferences { get; init; }
    public required HostPersonalPresentation PersonalPresentation { get; init; }
}

public record HostProfileResponseDto
{
    public required Guid Id { get; init; }
    public required string Dni { get; init; }
    public required HostPersonalData PersonalData { get; init; }
    public required HostWorkSituation WorkSituation { get; init; }
    public required HostHousingData HousingData { get; init; }
    public required HostExchangesExpected ExchangesExpected { get; init; }
    public required HostHealth Health { get; init; }
    public required HostHabits Habits { get; init; }
    public required HostTenantPreferences TenantPreferences { get; init; }
    public required HostPersonalPresentation PersonalPresentation { get; init; }
    public string? ProfilePhotoUrl { get; init; }
    public string? PresentationMediaUrl { get; init; }
    public List<string> HomePhotoUrls { get; init; } = new();
    public required DateTime UpdatedAt { get; init; }
}
