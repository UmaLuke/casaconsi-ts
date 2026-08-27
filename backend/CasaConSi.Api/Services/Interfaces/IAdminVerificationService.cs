using CasaConSi.Api.DTOs.Admin;

namespace CasaConSi.Api.Services.Interfaces;

public interface IAdminVerificationService
{
    Task<List<AdminVerificationQueueItemDto>> GetQueueAsync();
    Task<AdminVerificationDetailDto> GetDetailAsync(string userId);
    Task<AdminVerificationDetailDto> ApproveAsync(string userId, string adminUserId);
    Task<AdminVerificationDetailDto> RejectAsync(string userId, string adminUserId, string reason);
}