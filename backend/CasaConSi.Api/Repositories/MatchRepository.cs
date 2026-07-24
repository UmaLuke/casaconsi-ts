using CasaConSi.Api.Data;
using CasaConSi.Api.Models;
using CasaConSi.Api.Models.Enums;
using CasaConSi.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CasaConSi.Api.Repositories;

// Única capa que habla con ApplicationDbContext para ProfileLike/Match.
// También lee StudentProfiles/HostProfiles (solo lectura) para armar el feed
// — es una dependencia cruzada intencional entre módulos (Match necesita
// conocer los Perfiles), no un problema de capas.
public class MatchRepository : IMatchRepository
{
    private readonly ApplicationDbContext _context;

    public MatchRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<HostProfile>> GetHostProfilesForFeedAsync(string studentUserId, Generation studentGeneration)
    {
        var decidedHostIds = _context.ProfileLikes
            .Where(l => l.StudentUserId == studentUserId && l.DecidedByRole == UserRole.Student)
            .Select(l => l.HostUserId);

        var oppositeGenerationUserIds = _context.Users
            .Where(u => u.Generation != null && u.Generation != studentGeneration)
            .Select(u => u.Id);

        return await _context.HostProfiles
            .Where(h => !decidedHostIds.Contains(h.UserId) && oppositeGenerationUserIds.Contains(h.UserId))
            .ToListAsync();
    }

    public async Task<List<StudentProfile>> GetStudentProfilesForFeedAsync(string hostUserId, Generation hostGeneration)
    {
        var decidedStudentIds = _context.ProfileLikes
            .Where(l => l.HostUserId == hostUserId && l.DecidedByRole == UserRole.Host)
            .Select(l => l.StudentUserId);

        var oppositeGenerationUserIds = _context.Users
            .Where(u => u.Generation != null && u.Generation != hostGeneration)
            .Select(u => u.Id);

        return await _context.StudentProfiles
            .Where(s => !decidedStudentIds.Contains(s.UserId) && oppositeGenerationUserIds.Contains(s.UserId))
            .ToListAsync();
    }

    public async Task<bool?> GetDecisionAsync(string studentUserId, string hostUserId, UserRole decidedByRole)
    {
        var like = await _context.ProfileLikes.FirstOrDefaultAsync(l =>
            l.StudentUserId == studentUserId && l.HostUserId == hostUserId && l.DecidedByRole == decidedByRole);
        return like?.Liked;
    }

    public async Task UpsertLikeAsync(string studentUserId, string hostUserId, UserRole decidedByRole, bool liked)
    {
        var existing = await _context.ProfileLikes.FirstOrDefaultAsync(l =>
            l.StudentUserId == studentUserId && l.HostUserId == hostUserId && l.DecidedByRole == decidedByRole);

        if (existing is not null)
        {
            existing.Liked = liked;
            return;
        }

        await _context.ProfileLikes.AddAsync(new ProfileLike
        {
            Id = Guid.NewGuid(),
            StudentUserId = studentUserId,
            HostUserId = hostUserId,
            DecidedByRole = decidedByRole,
            Liked = liked,
        });
    }

    public Task<Match?> GetMatchAsync(string studentUserId, string hostUserId) =>
        _context.Matches.FirstOrDefaultAsync(m => m.StudentUserId == studentUserId && m.HostUserId == hostUserId);

    public async Task<Match> CreateMatchAsync(string studentUserId, string hostUserId)
    {
        var match = new Match { Id = Guid.NewGuid(), StudentUserId = studentUserId, HostUserId = hostUserId };
        await _context.Matches.AddAsync(match);
        return match;
    }

    public Task<List<Match>> GetMatchesForStudentAsync(string studentUserId) =>
        _context.Matches.Where(m => m.StudentUserId == studentUserId).ToListAsync();

    public Task<List<Match>> GetMatchesForHostAsync(string hostUserId) =>
        _context.Matches.Where(m => m.HostUserId == hostUserId).ToListAsync();

    public Task SaveChangesAsync() => _context.SaveChangesAsync();
}