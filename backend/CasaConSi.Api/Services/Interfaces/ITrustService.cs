using CasaConSi.Api.DTOs.Trust;
using Microsoft.AspNetCore.Http;

namespace CasaConSi.Api.Services.Interfaces;

public interface ITrustService
{
    Task<TrustStatusResponseDto> GetStatusAsync(string userId);
    Task<TrustStatusResponseDto> UpdateItemsAsync(string userId, UpdateTrustItemsRequestDto request);
    Task<TrustStatusResponseDto> RequestAltaConfianzaAsync(string userId);
    Task<AltaConfianzaEvidenceDto> GetEvidenceAsync(string userId);
    Task<AltaConfianzaEvidenceDto> SavePersonalReferencesAsync(string userId, SavePersonalReferencesRequestDto request);
    Task<AltaConfianzaEvidenceDto> UploadCriminalRecordDocumentAsync(string userId, IFormFile file);
}