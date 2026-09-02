using CasaConSi.Api.DTOs.Advisory;

namespace CasaConSi.Api.Services.Interfaces;

public interface IAdvisoryService
{
    Task<List<AvailabilitySlotDto>> GetAvailabilityAsync(DateOnly date);
    Task<AdvisorySessionDto> CreateSessionAsync(string clientUserId, CreateAdvisorySessionRequestDto request);
    Task<List<AdvisorySessionDto>> GetMySessionsAsync(string clientUserId);
}
