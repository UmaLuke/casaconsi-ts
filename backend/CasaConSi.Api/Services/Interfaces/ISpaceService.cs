using CasaConSi.Api.DTOs.Space;

namespace CasaConSi.Api.Services.Interfaces;

public interface ISpaceService
{
    Task<List<SpaceResponseDto>> GetActiveSpacesAsync();
    Task<SpaceResponseDto?> GetSpaceByIdAsync(Guid id);
    Task<List<SpaceResponseDto>> GetMySpacesAsync(string hostUserId);
    Task<SpaceResponseDto> CreateSpaceAsync(string hostUserId, CreateSpaceRequestDto request);
    Task<SpaceResponseDto> UploadPhotosAsync(string hostUserId, Guid spaceId, List<Microsoft.AspNetCore.Http.IFormFile> photos);
}