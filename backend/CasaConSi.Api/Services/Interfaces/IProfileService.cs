using CasaConSi.Api.DTOs.Profile;
using CasaConSi.Api.Models.Enums;
using Microsoft.AspNetCore.Http;

namespace CasaConSi.Api.Services.Interfaces;

public interface IProfileService
{
    Task<StudentProfileResponseDto> SaveStudentProfileAsync(string userId, StudentProfileRequestDto request);
    Task<HostProfileResponseDto> SaveHostProfileAsync(string userId, HostProfileRequestDto request);
    Task<StudentProfileResponseDto?> GetStudentProfileAsync(string userId);
    Task<HostProfileResponseDto?> GetHostProfileAsync(string userId);
    Task<bool> HasProfileAsync(string userId, UserRole role);
    Task<StudentProfileResponseDto> SaveStudentPhotosAsync(string userId, IFormFile? profilePhoto, IFormFile? presentationMedia);
    Task<HostProfileResponseDto> SaveHostPhotosAsync(string userId, IFormFile? profilePhoto, List<IFormFile> homeAndRoomPhotos, IFormFile? presentationMedia);
}
