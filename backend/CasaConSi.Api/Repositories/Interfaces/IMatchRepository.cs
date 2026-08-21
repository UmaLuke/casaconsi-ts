using CasaConSi.Api.Models;
using CasaConSi.Api.Models.Enums;

namespace CasaConSi.Api.Repositories.Interfaces;

public interface IMatchRepository
{
    Task<List<HostProfile>> GetHostProfilesForFeedAsync(string studentUserId, Generation studentGeneration);
    Task<List<StudentProfile>> GetStudentProfilesForFeedAsync(string hostUserId, Generation hostGeneration);
    Task<bool?> GetDecisionAsync(string studentUserId, string hostUserId, UserRole decidedByRole);
    Task UpsertLikeAsync(string studentUserId, string hostUserId, UserRole decidedByRole, bool liked);
    Task<Match?> GetMatchAsync(string studentUserId, string hostUserId);
    Task<Match> CreateMatchAsync(string studentUserId, string hostUserId);
    Task<List<Match>> GetMatchesForStudentAsync(string studentUserId);
    Task<List<Match>> GetMatchesForHostAsync(string hostUserId);
    Task<List<StudentProfile>> GetInterestedStudentProfilesAsync(string hostUserId);
    Task SaveChangesAsync();
}