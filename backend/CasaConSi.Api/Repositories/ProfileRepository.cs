using CasaConSi.Api.Data;
using CasaConSi.Api.Models;
using CasaConSi.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CasaConSi.Api.Repositories;

// Única capa que habla con ApplicationDbContext para los perfiles. Todo vía
// EF Core, sin SQL crudo (convención del proyecto).
public class ProfileRepository : IProfileRepository
{
    private readonly ApplicationDbContext _context;

    public ProfileRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public Task<StudentProfile?> GetStudentProfileByUserIdAsync(string userId) =>
        _context.StudentProfiles.FirstOrDefaultAsync(p => p.UserId == userId);

    public Task<HostProfile?> GetHostProfileByUserIdAsync(string userId) =>
        _context.HostProfiles.FirstOrDefaultAsync(p => p.UserId == userId);

    public async Task AddStudentProfileAsync(StudentProfile profile) =>
        await _context.StudentProfiles.AddAsync(profile);

    public async Task AddHostProfileAsync(HostProfile profile) =>
        await _context.HostProfiles.AddAsync(profile);

    public Task<bool> StudentProfileExistsAsync(string userId) =>
        _context.StudentProfiles.AnyAsync(p => p.UserId == userId);

    public Task<bool> HostProfileExistsAsync(string userId) =>
        _context.HostProfiles.AnyAsync(p => p.UserId == userId);

    public Task SaveChangesAsync() => _context.SaveChangesAsync();
}
