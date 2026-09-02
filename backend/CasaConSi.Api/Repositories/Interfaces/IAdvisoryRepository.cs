using CasaConSi.Api.Models;

namespace CasaConSi.Api.Repositories.Interfaces;

public interface IAdvisoryRepository
{
    // Devuelve la asesora que recibe los turnos por defecto (ver
    // ApplicationUser.IsPrimaryAdvisor). Null si todavía no hay ninguna
    // configurada — el servicio decide qué hacer en ese caso.
    Task<ApplicationUser?> GetPrimaryAdvisorAsync();
    Task<List<AdvisorySession>> GetSessionsForAdvisorOnDateAsync(string advisorUserId, DateOnly date);
    Task<AdvisorySession> CreateSessionAsync(AdvisorySession session);
    Task<List<AdvisorySession>> GetSessionsForClientAsync(string clientUserId);
    Task SaveChangesAsync();
}
