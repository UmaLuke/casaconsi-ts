using CasaConSi.Api.Models;

namespace CasaConSi.Api.Repositories.Interfaces;

public interface IProfileRepository
{
    Task<StudentProfile?> GetStudentProfileByUserIdAsync(string userId);
    Task<HostProfile?> GetHostProfileByUserIdAsync(string userId);
    Task AddStudentProfileAsync(StudentProfile profile);
    Task AddHostProfileAsync(HostProfile profile);
    Task<bool> StudentProfileExistsAsync(string userId);
    Task<bool> HostProfileExistsAsync(string userId);
    Task SaveChangesAsync();
}
