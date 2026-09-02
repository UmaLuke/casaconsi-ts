using CasaConSi.Api.Data;
using CasaConSi.Api.Models;
using CasaConSi.Api.Models.Enums;
using CasaConSi.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CasaConSi.Api.Repositories;

public class AdvisoryRepository : IAdvisoryRepository
{
    private readonly ApplicationDbContext _context;

    public AdvisoryRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public Task<ApplicationUser?> GetPrimaryAdvisorAsync() =>
        _context.Users.FirstOrDefaultAsync(u => u.Role == UserRole.Advisor && u.IsPrimaryAdvisor);

    // Rango del día en UTC — ScheduledAt se guarda en UTC (ver AdvisorySession.cs).
    public Task<List<AdvisorySession>> GetSessionsForAdvisorOnDateAsync(string advisorUserId, DateOnly date)
    {
        var dayStart = date.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
        var dayEnd = dayStart.AddDays(1);
        return _context.AdvisorySessions
            .Where(s => s.AdvisorUserId == advisorUserId
                && s.ScheduledAt >= dayStart && s.ScheduledAt < dayEnd
                && s.Status != AdvisorySessionStatus.Cancelled)
            .ToListAsync();
    }

    public async Task<AdvisorySession> CreateSessionAsync(AdvisorySession session)
    {
        await _context.AdvisorySessions.AddAsync(session);
        return session;
    }

    public Task<List<AdvisorySession>> GetSessionsForClientAsync(string clientUserId) =>
        _context.AdvisorySessions
            .Where(s => s.ClientUserId == clientUserId)
            .OrderByDescending(s => s.ScheduledAt)
            .ToListAsync();

    public Task SaveChangesAsync() => _context.SaveChangesAsync();
}
