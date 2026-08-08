using CasaConSi.Api.Data;
using CasaConSi.Api.Models;
using CasaConSi.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CasaConSi.Api.Repositories;

public class TrustRepository : ITrustRepository
{
    private readonly ApplicationDbContext _db;

    public TrustRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public Task<ProfileVerification?> GetByUserIdAsync(string userId) =>
        _db.ProfileVerifications.FirstOrDefaultAsync(v => v.UserId == userId);

    public async Task<ProfileVerification> GetOrCreateAsync(string userId)
    {
        var existing = await GetByUserIdAsync(userId);
        if (existing is not null) return existing;

        var created = new ProfileVerification { Id = Guid.NewGuid(), UserId = userId };
        _db.ProfileVerifications.Add(created);
        await _db.SaveChangesAsync();
        return created;
    }

    public Task SaveChangesAsync() => _db.SaveChangesAsync();
}