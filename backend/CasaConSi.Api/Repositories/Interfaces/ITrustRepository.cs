using CasaConSi.Api.Models;

namespace CasaConSi.Api.Repositories.Interfaces;

public interface ITrustRepository
{
    Task<ProfileVerification?> GetByUserIdAsync(string userId);
    Task<ProfileVerification?> GetByUserIdWithUserAsync(string userId);
    Task<List<ProfileVerification>> GetPendingAltaConfianzaAsync();
    Task<ProfileVerification> GetOrCreateAsync(string userId);
    Task SaveChangesAsync();
}