using CasaConSi.Api.Data;
using CasaConSi.Api.Models;
using CasaConSi.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CasaConSi.Api.Repositories;

public class SpaceRepository : ISpaceRepository
{
    private readonly ApplicationDbContext _context;

    public SpaceRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public Task<List<Space>> GetActiveAsync() =>
        _context.Spaces.Where(s => s.IsActive).OrderByDescending(s => s.CreatedAt).ToListAsync();

    public Task<Space?> GetByIdAsync(Guid id) =>
        _context.Spaces.FirstOrDefaultAsync(s => s.Id == id);

    public Task<List<Space>> GetByHostUserIdAsync(string hostUserId) =>
        _context.Spaces.Where(s => s.HostUserId == hostUserId).OrderByDescending(s => s.CreatedAt).ToListAsync();

    public async Task AddAsync(Space space) => await _context.Spaces.AddAsync(space);

    public Task DeleteAsync(Space space)
    {
        _context.Spaces.Remove(space);
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync() => _context.SaveChangesAsync();
}