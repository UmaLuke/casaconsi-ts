using CasaConSi.Api.DTOs.Profile;
using CasaConSi.Api.Models;
using CasaConSi.Api.Models.Enums;
using CasaConSi.Api.Repositories.Interfaces;
using CasaConSi.Api.Services.Interfaces;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;

namespace CasaConSi.Api.Services;

// Lógica de negocio de los perfiles (cuestionarios post-registro). El
// Controller nunca toca StudentProfile/HostProfile ni el DbContext
// directamente — todo pasa por acá y por IProfileRepository.
public class ProfileService : IProfileService
{
    private readonly IProfileRepository _profileRepository;
    private readonly IFileStorageService _fileStorageService;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IDataProtector _dniProtector;

    // Edad a partir de la cual, para el modelo de match, alguien es "adulto
    // mayor". Espejo de EDAD_MINIMA_ADULTO_MAYOR en frontend/src/utils/generation.ts
    // — si se cambia ahí, cambiar acá también.
    private const int EdadMinimaAdultoMayor = 60;

    public ProfileService(
        IProfileRepository profileRepository,
        IFileStorageService fileStorageService,
        UserManager<ApplicationUser> userManager,
        IDataProtectionProvider dataProtectionProvider)
    {
        _profileRepository = profileRepository;
        _fileStorageService = fileStorageService;
        _userManager = userManager;
        // Purpose string fijo a propósito: cambiarlo invalidaría todos los DNI ya cifrados.
        _dniProtector = dataProtectionProvider.CreateProtector("CasaConSi.Profile.Dni");
    }

    public async Task<StudentProfileResponseDto> SaveStudentProfileAsync(string userId, StudentProfileRequestDto request)
    {
        var existing = await _profileRepository.GetStudentProfileByUserIdAsync(userId);
        var profile = existing ?? new StudentProfile { Id = Guid.NewGuid(), UserId = userId };

        profile.EncryptedDni = _dniProtector.Protect(request.Dni);
        profile.PersonalData = request.PersonalData;
        profile.TravelReason = request.TravelReason;
        profile.LocationPreferences = request.LocationPreferences;
        profile.EconomicSituation = request.EconomicSituation;
        profile.ExchangesOffered = request.ExchangesOffered;
        profile.Habits = request.Habits;
        profile.Health = request.Health;
        profile.HostPreferences = request.HostPreferences;
        profile.PersonalPresentation = request.PersonalPresentation;

        // Columnas promovidas para el futuro Match module (ver plan acordado).
        profile.PreferredHostGeneration = request.HostPreferences.PreferredGeneration;
        profile.PreferredNeighborhoods = request.LocationPreferences.PreferredNeighborhoods;
        profile.ContributionRangeArs = request.EconomicSituation.ContributionRangeArs;
        profile.StayDuration = request.TravelReason.StayDuration;
        profile.AvailableFrom = DateOnly.TryParse(request.TravelReason.AvailableFrom, out var availableFrom)
            ? availableFrom
            : null;

        profile.UpdatedAt = DateTime.UtcNow;

        if (existing is null)
        {
            await _profileRepository.AddStudentProfileAsync(profile);
        }

        await SyncUserGenerationAsync(userId, request.PersonalData.BirthDate);
        await _profileRepository.SaveChangesAsync();

        return ToStudentResponseDto(profile);
    }

    public async Task<HostProfileResponseDto> SaveHostProfileAsync(string userId, HostProfileRequestDto request)
    {
        var existing = await _profileRepository.GetHostProfileByUserIdAsync(userId);
        var profile = existing ?? new HostProfile { Id = Guid.NewGuid(), UserId = userId };

        profile.EncryptedDni = _dniProtector.Protect(request.Dni);
        profile.PersonalData = request.PersonalData;
        profile.WorkSituation = request.WorkSituation;
        profile.HousingData = request.HousingData;
        profile.ExchangesExpected = request.ExchangesExpected;
        profile.Health = request.Health;
        profile.Habits = request.Habits;
        profile.TenantPreferences = request.TenantPreferences;
        profile.PersonalPresentation = request.PersonalPresentation;

        profile.PreferredTenantGeneration = request.TenantPreferences.PreferredGeneration;
        profile.Neighborhood = request.HousingData.Neighborhood;
        profile.ExpectedAmountRangeArs = request.ExchangesExpected.ExpectedAmountRangeArs;
        profile.AvailableRooms = request.HousingData.AvailableRooms;
        profile.HousingType = request.HousingData.HousingType;

        profile.UpdatedAt = DateTime.UtcNow;

        if (existing is null)
        {
            await _profileRepository.AddHostProfileAsync(profile);
        }

        await SyncUserGenerationAsync(userId, request.PersonalData.BirthDate);
        await _profileRepository.SaveChangesAsync();

        return ToHostResponseDto(profile);
    }

    public async Task<StudentProfileResponseDto?> GetStudentProfileAsync(string userId)
    {
        var profile = await _profileRepository.GetStudentProfileByUserIdAsync(userId);
        return profile is null ? null : ToStudentResponseDto(profile);
    }

    public async Task<HostProfileResponseDto?> GetHostProfileAsync(string userId)
    {
        var profile = await _profileRepository.GetHostProfileByUserIdAsync(userId);
        return profile is null ? null : ToHostResponseDto(profile);
    }

    public Task<bool> HasProfileAsync(string userId, UserRole role) =>
        role == UserRole.Student
            ? _profileRepository.StudentProfileExistsAsync(userId)
            : _profileRepository.HostProfileExistsAsync(userId);

    public async Task<StudentProfileResponseDto> SaveStudentPhotosAsync(string userId, IFormFile? profilePhoto, IFormFile? presentationMedia)
    {
        var profile = await _profileRepository.GetStudentProfileByUserIdAsync(userId)
            ?? throw new InvalidOperationException("Completá el cuestionario antes de subir fotos.");

        if (profilePhoto is not null)
        {
            profile.ProfilePhotoPath = await _fileStorageService.SaveAsync(profilePhoto, $"profiles/{userId}");
        }
        if (presentationMedia is not null)
        {
            profile.PresentationMediaPath = await _fileStorageService.SaveAsync(presentationMedia, $"profiles/{userId}");
        }

        profile.UpdatedAt = DateTime.UtcNow;
        await _profileRepository.SaveChangesAsync();
        return ToStudentResponseDto(profile);
    }

    public async Task<HostProfileResponseDto> SaveHostPhotosAsync(string userId, IFormFile? profilePhoto, List<IFormFile> homeAndRoomPhotos, IFormFile? presentationMedia)
    {
        var profile = await _profileRepository.GetHostProfileByUserIdAsync(userId)
            ?? throw new InvalidOperationException("Completá el cuestionario antes de subir fotos.");

        if (profilePhoto is not null)
        {
            profile.ProfilePhotoPath = await _fileStorageService.SaveAsync(profilePhoto, $"profiles/{userId}");
        }
        if (presentationMedia is not null)
        {
            profile.PresentationMediaPath = await _fileStorageService.SaveAsync(presentationMedia, $"profiles/{userId}");
        }
        foreach (var photo in homeAndRoomPhotos)
        {
            profile.HomePhotoPaths.Add(await _fileStorageService.SaveAsync(photo, $"profiles/{userId}/home"));
        }

        profile.UpdatedAt = DateTime.UtcNow;
        await _profileRepository.SaveChangesAsync();
        return ToHostResponseDto(profile);
    }

    // Deriva y persiste la Generation (Filtro 2) del usuario a partir de la
    // fecha de nacimiento declarada en el cuestionario — nunca se confía en
    // un valor "generation" calculado del lado del cliente. Alimenta
    // ApplicationUser.Generation (ya existía, ver comentario en ApplicationUser.cs).
    private async Task SyncUserGenerationAsync(string userId, string birthDateIso)
    {
        if (!DateOnly.TryParse(birthDateIso, out var birthDate))
        {
            return;
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
        {
            return;
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var age = today.Year - birthDate.Year;
        if (birthDate.AddYears(age) > today)
        {
            age--;
        }

        user.Generation = age >= EdadMinimaAdultoMayor ? Generation.AdultoMayor : Generation.JovenAdulto;
        await _userManager.UpdateAsync(user);
    }

    private StudentProfileResponseDto ToStudentResponseDto(StudentProfile profile) => new()
    {
        Id = profile.Id,
        Dni = _dniProtector.Unprotect(profile.EncryptedDni),
        PersonalData = profile.PersonalData,
        TravelReason = profile.TravelReason,
        LocationPreferences = profile.LocationPreferences,
        EconomicSituation = profile.EconomicSituation,
        ExchangesOffered = profile.ExchangesOffered,
        Habits = profile.Habits,
        Health = profile.Health,
        HostPreferences = profile.HostPreferences,
        PersonalPresentation = profile.PersonalPresentation,
        ProfilePhotoUrl = ToUrl(profile.ProfilePhotoPath),
        PresentationMediaUrl = ToUrl(profile.PresentationMediaPath),
        UpdatedAt = profile.UpdatedAt,
    };

    private HostProfileResponseDto ToHostResponseDto(HostProfile profile) => new()
    {
        Id = profile.Id,
        Dni = _dniProtector.Unprotect(profile.EncryptedDni),
        PersonalData = profile.PersonalData,
        WorkSituation = profile.WorkSituation,
        HousingData = profile.HousingData,
        ExchangesExpected = profile.ExchangesExpected,
        Health = profile.Health,
        Habits = profile.Habits,
        TenantPreferences = profile.TenantPreferences,
        PersonalPresentation = profile.PersonalPresentation,
        ProfilePhotoUrl = ToUrl(profile.ProfilePhotoPath),
        PresentationMediaUrl = ToUrl(profile.PresentationMediaPath),
        HomePhotoUrls = profile.HomePhotoPaths.Select(ToUrl).Where(u => u is not null).Select(u => u!).ToList(),
        UpdatedAt = profile.UpdatedAt,
    };

    private static string? ToUrl(string? relativePath) =>
        relativePath is null ? null : $"/uploads/{relativePath}";
}
