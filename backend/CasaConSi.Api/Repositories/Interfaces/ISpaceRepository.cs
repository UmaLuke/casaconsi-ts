using CasaConSi.Api.Models;

namespace CasaConSi.Api.Repositories.Interfaces;

public interface ISpaceRepository
{
    Task<List<Space>> GetActiveAsync();
    Task<Space?> GetByIdAsync(Guid id);
    Task<List<Space>> GetByHostUserIdAsync(string hostUserId);
    Task AddAsync(Space space);
    Task SaveChangesAsync();
}