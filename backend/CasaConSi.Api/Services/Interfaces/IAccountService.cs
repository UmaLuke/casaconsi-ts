using CasaConSi.Api.DTOs.Account;
using Microsoft.AspNetCore.Http;

namespace CasaConSi.Api.Services.Interfaces;

public interface IAccountService
{
    Task<AccountResponseDto> GetMeAsync(string userId);
    Task<AccountResponseDto> UpdateNameAsync(string userId, UpdateAccountRequestDto request);
    Task<AccountResponseDto> UpdateAvatarAsync(string userId, IFormFile avatar);
    Task ChangePasswordAsync(string userId, ChangePasswordRequestDto request);
    Task<AccountResponseDto> ChangeEmailAsync(string userId, ChangeEmailRequestDto request);
}
