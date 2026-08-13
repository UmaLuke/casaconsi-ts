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
            Profession = request.Profession
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join(" ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException(errors);
        }

        return await BuildAuthResponseAsync(user);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null || !await _userManager.CheckPasswordAsync(user, request.Password))
        {
            throw new UnauthorizedAccessException("Correo o contraseña incorrectos.");
        }

        return await BuildAuthResponseAsync(user);
    }

    private async Task<AuthResponseDto> BuildAuthResponseAsync(ApplicationUser user)
    {
        var (token, expiresAt) = _tokenService.GenerateToken(user);
        var isAdmin = await _userManager.IsInRoleAsync(user, "Admin");

        return new AuthResponseDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email!,
            Role = user.Role,
            Avatar = user.Avatar,
            Title = user.Title,
            Profession = user.Profession,
            Generation = user.Generation,
            IsAdmin = isAdmin,
            Gallery = user.GalleryPhotoPaths.Select(p => ToUrl(p)!).ToList(),
            Token = token,
            ExpiresAt = expiresAt,
        };
    }

    // Espejo de AccountService.ToUrl — FileStorageService.SaveAsync devuelve
    // una ruta relativa a wwwroot/uploads, servida vía app.UseStaticFiles() (Program.cs).
    private static string? ToUrl(string? relativePath) =>
        relativePath is null ? null : $"/uploads/{relativePath}";
}