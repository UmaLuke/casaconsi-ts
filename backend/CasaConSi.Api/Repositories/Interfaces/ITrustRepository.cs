using CasaConSi.Api.Models;

namespace CasaConSi.Api.Repositories.Interfaces;

public interface ITrustRepository
{
    Task<ProfileVerification?> GetByUserIdAsync(string userId);
    Task<ProfileVerification> GetOrCreateAsync(string userId);
    Task SaveChangesAsync();
}