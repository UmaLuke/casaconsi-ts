using CasaConSi.Api.DTOs.Auth;
using CasaConSi.Api.Models;
using CasaConSi.Api.Services.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace CasaConSi.Api.Services;

// Lógica de negocio de Auth. UserManager<ApplicationUser> hace de capa de datos
// (no hay Repository acá, como quedó definido).
public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITokenService _tokenService;

    public AuthService(UserManager<ApplicationUser> userManager, ITokenService tokenService)
    {
        _userManager = userManager;
        _tokenService = tokenService;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
    {
        var existing = await _userManager.FindByEmailAsync(request.Email);
        if (existing is not null)
        {
            throw new InvalidOperationException("Ya existe una cuenta registrada con ese correo.");
        }

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            Name = request.Name,
            Role = request.Role,
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join(" ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException(errors);
        }

        return BuildAuthResponse(user);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null || !await _userManager.CheckPasswordAsync(user, request.Password))
        {
            throw new UnauthorizedAccessException("Correo o contraseña incorrectos.");
        }

        return BuildAuthResponse(user);
    }

    private AuthResponseDto BuildAuthResponse(ApplicationUser user)
    {
        var (token, expiresAt) = _tokenService.GenerateToken(user);

        return new AuthResponseDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email!,
            Role = user.Role,
            Avatar = user.Avatar,
            Title = user.Title,
            Generation = user.Generation,
            Token = token,
            ExpiresAt = expiresAt,
        };
    }
}