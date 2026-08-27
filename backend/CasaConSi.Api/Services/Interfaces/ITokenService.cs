using CasaConSi.Api.Models;

namespace CasaConSi.Api.Services.Interfaces;

public interface ITokenService
{
    (string Token, DateTime ExpiresAt) GenerateToken(ApplicationUser user, bool isAdmin);
}