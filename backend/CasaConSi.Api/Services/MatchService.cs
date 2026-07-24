using CasaConSi.Api.DTOs.Match;
using CasaConSi.Api.Models;
using CasaConSi.Api.Models.Enums;
using CasaConSi.Api.Repositories.Interfaces;
using CasaConSi.Api.Services.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace CasaConSi.Api.Services;

// Lógica de negocio del match básico (like mutuo). El Controller nunca toca
// ProfileLike/Match ni el DbContext directamente — todo pasa por acá y por
// IMatchRepository. Reutiliza IProfileRepository (solo lectura) para validar
// existencia de perfiles y armar los DTOs públicos.
//
// Regla de negocio (ver frontend/src/types/filters.ts, canMatch): el match
// SOLO es posible entre generaciones distintas (Joven Adulto <-> Adulto
// Mayor) — es el corazón del modelo de Solidaridad Intergeneracional. Se
// aplica acá en dos puntos: al armar el feed (GetFeedAsync) y de nuevo al
// registrar un like (RegisterDecisionAsync), para no depender únicamente de
// que el frontend respete el feed filtrado.
public class MatchService : IMatchService
{
    private readonly IMatchRepository _matchRepository;
    private readonly IProfileRepository _profileRepository;
    private readonly UserManager<ApplicationUser> _userManager;

    public MatchService(
        IMatchRepository matchRepository,
        IProfileRepository profileRepository,
        UserManager<ApplicationUser> userManager)
    {
        _matchRepository = matchRepository;
        _profileRepository = profileRepository;
        _userManager = userManager;
    }

    public async Task<List<MatchFeedItemDto>> GetFeedAsync(string userId, UserRole role)
    {
        var generation = await GetRequiredGenerationAsync(userId);

        if (role == UserRole.Student)
        {
            var hosts = await _matchRepository.GetHostProfilesForFeedAsync(userId, generation);
            return hosts.Select(ToFeedItem).ToList();
        }

        var students = await _matchRepository.GetStudentProfilesForFeedAsync(userId, generation);
        return students.Select(ToFeedItem).ToList();
    }

    public async Task<LikeResponseDto> RegisterDecisionAsync(string userId, UserRole role, string targetUserId, bool liked)
    {
        var (studentUserId, hostUserId) = role == UserRole.Student
            ? (userId, targetUserId)
            : (targetUserId, userId);

        var targetExists = role == UserRole.Student
            ? await _profileRepository.HostProfileExistsAsync(targetUserId)
            : await _profileRepository.StudentProfileExistsAsync(targetUserId);

        if (!targetExists)
        {
            throw new InvalidOperationException("El perfil indicado no existe.");
        }

        await EnsureOppositeGenerationAsync(userId, targetUserId);

        await _matchRepository.UpsertLikeAsync(studentUserId, hostUserId, role, liked);

        if (!liked)
        {
            await _matchRepository.SaveChangesAsync();
            return new LikeResponseDto { IsMatch = false };
        }

        var counterpartRole = role == UserRole.Student ? UserRole.Host : UserRole.Student;
        var counterpartLiked = await _matchRepository.GetDecisionAsync(studentUserId, hostUserId, counterpartRole) == true;

        if (!counterpartLiked)
        {
            await _matchRepository.SaveChangesAsync();
            return new LikeResponseDto { IsMatch = false };
        }

        var match = await _matchRepository.GetMatchAsync(studentUserId, hostUserId)
            ?? await _matchRepository.CreateMatchAsync(studentUserId, hostUserId);

        await _matchRepository.SaveChangesAsync();
        return new LikeResponseDto { IsMatch = true, MatchId = match.Id };
    }

    public async Task<List<MatchSummaryDto>> GetMatchesAsync(string userId, UserRole role)
    {
        var matches = role == UserRole.Student
            ? await _matchRepository.GetMatchesForStudentAsync(userId)
            : await _matchRepository.GetMatchesForHostAsync(userId);

        var result = new List<MatchSummaryDto>();
        foreach (var match in matches)
        {
            var counterpartUserId = role == UserRole.Student ? match.HostUserId : match.StudentUserId;

            if (role == UserRole.Student)
            {
                var host = await _profileRepository.GetHostProfileByUserIdAsync(counterpartUserId);
                if (host is null) continue;
                result.Add(new MatchSummaryDto
                {
                    Id = match.Id,
                    CounterpartUserId = counterpartUserId,
                    CounterpartName = host.PersonalData.FullName,
                    CounterpartPhotoUrl = ToUrl(host.ProfilePhotoPath),
                    CreatedAt = match.CreatedAt,
                });
            }
            else
            {
                var student = await _profileRepository.GetStudentProfileByUserIdAsync(counterpartUserId);
                if (student is null) continue;
                result.Add(new MatchSummaryDto
                {
                    Id = match.Id,
                    CounterpartUserId = counterpartUserId,
                    CounterpartName = student.PersonalData.FullName,
                    CounterpartPhotoUrl = ToUrl(student.ProfilePhotoPath),
                    CreatedAt = match.CreatedAt,
                });
            }
        }

        return result.OrderByDescending(m => m.CreatedAt).ToList();
    }

    private static MatchFeedItemDto ToFeedItem(HostProfile host) => new()
    {
        UserId = host.UserId,
        FullName = host.PersonalData.FullName,
        ProfilePhotoUrl = ToUrl(host.ProfilePhotoPath),
        PresentationMediaUrl = ToUrl(host.PresentationMediaPath),
        AboutMe = host.PersonalPresentation.AboutMe,
        Neighborhoods = new List<string> { host.Neighborhood },
    };

    private static MatchFeedItemDto ToFeedItem(StudentProfile student) => new()
    {
        UserId = student.UserId,
        FullName = student.PersonalData.FullName,
        ProfilePhotoUrl = ToUrl(student.ProfilePhotoPath),
        PresentationMediaUrl = ToUrl(student.PresentationMediaPath),
        AboutMe = student.PersonalPresentation.AboutMe,
        Neighborhoods = student.PreferredNeighborhoods,
    };

    private static string? ToUrl(string? relativePath) =>
        relativePath is null ? null : $"/uploads/{relativePath}";

    private async Task<Generation> GetRequiredGenerationAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new InvalidOperationException("Usuario no encontrado.");

        return user.Generation
            ?? throw new InvalidOperationException("Completá tu cuestionario antes de ver el feed de matches.");
    }

    private async Task EnsureOppositeGenerationAsync(string userId, string targetUserId)
    {
        var userGeneration = await GetRequiredGenerationAsync(userId);

        var target = await _userManager.FindByIdAsync(targetUserId)
            ?? throw new InvalidOperationException("El perfil indicado no existe.");
        var targetGeneration = target.Generation
            ?? throw new InvalidOperationException("El perfil indicado todavía no completó su cuestionario.");

        if (userGeneration == targetGeneration)
        {
            throw new InvalidOperationException(
                "El match solo es posible entre generaciones distintas (Joven Adulto ↔ Adulto Mayor).");
        }
    }
}