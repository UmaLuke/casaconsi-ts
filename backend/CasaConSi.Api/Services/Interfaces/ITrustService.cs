using CasaConSi.Api.DTOs.Trust;

namespace CasaConSi.Api.Services.Interfaces;

public interface ITrustService
{
    Task<TrustStatusResponseDto> GetStatusAsync(string userId);
    Task<TrustStatusResponseDto> UpdateItemsAsync(string userId, UpdateTrustItemsRequestDto request);
    Task<TrustStatusResponseDto> RequestAltaConfianzaAsync(string userId);
}