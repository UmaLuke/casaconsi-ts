using CasaConSi.Api.DTOs.Space;

namespace CasaConSi.Api.Services.Interfaces;

public interface ISpaceService
{
    Task<List<SpaceResponseDto>> GetActiveSpacesAsync();
    Task<SpaceResponseDto?> GetSpaceByIdAsync(Guid id);
    Task<List<SpaceResponseDto>> GetMySpacesAsync(string hostUserId);
    Task<SpaceResponseDto> CreateSpaceAsync(string hostUserId, CreateSpaceRequestDto request);
    Task<SpaceResponseDto> UploadPhotosAsync(string hostUserId, Guid spaceId, List<Microsoft.AspNetCore.Http.IFormFile> photos);
    Task<SpaceResponseDto> UpdateSpaceAsync(string hostUserId, Guid spaceId, UpdateSpaceRequestDto request);
    Task<SpaceResponseDto> UpdateSpaceStatusAsync(string hostUserId, Guid spaceId, bool isActive);
    Task DeleteSpaceAsync(string hostUserId, Guid spaceId);
    Task<SpaceResponseDto> DeleteSpacePhotoAsync(string hostUserId, Guid spaceId, int photoIndex);
    Task<SpaceResponseDto> ReorderSpacePhotosAsync(string hostUserId, Guid spaceId, List<int> order);
}
