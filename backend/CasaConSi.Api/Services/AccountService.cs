using CasaConSi.Api.DTOs.Account;
using CasaConSi.Api.Models;
using CasaConSi.Api.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;

namespace CasaConSi.Api.Services;

// Lógica de negocio de la CUENTA (nombre, email, password, avatar). No hay
// Repository acá: igual que en AuthService, UserManager<ApplicationUser> hace
// de capa de datos. Distinto de ProfileService, que maneja el perfil de match
// (cuestionario host/student) — ese sí tiene su propio Repository.
public class AccountService : IAccountService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IFileStorageService _fileStorageService;

    public AccountService(UserManager<ApplicationUser> userManager, IFileStorageService fileStorageService)
    {
        _userManager = userManager;
        _fileStorageService = fileStorageService;
    }

    public async Task<AccountResponseDto> GetMeAsync(string userId)
    {
        var user = await FindUserOrThrowAsync(userId);
        return await ToDtoAsync(user);
    }

    public async Task<AccountResponseDto> UpdateNameAsync(string userId, UpdateAccountRequestDto request)
    {
        var user = await FindUserOrThrowAsync(userId);
        user.Name = request.Name;

        var result = await _userManager.UpdateAsync(user);
        ThrowIfFailed(result);

        return await ToDtoAsync(user);
    }

    public async Task<AccountResponseDto> UpdateAvatarAsync(string userId, IFormFile avatar)
    {
        var user = await FindUserOrThrowAsync(userId);

        // Mismo subfolder scheme que ProfileService (profiles/{userId}/...) —
        // ver FileStorageService.SaveAsync y ProfileService.ToUrl.
        var relativePath = await _fileStorageService.SaveAsync(avatar, $"avatars/{userId}");
        user.Avatar = ToUrl(relativePath);

        var result = await _userManager.UpdateAsync(user);
        ThrowIfFailed(result);

        return await ToDtoAsync(user);
    }

    public async Task ChangePasswordAsync(string userId, ChangePasswordRequestDto request)
    {
        var user = await FindUserOrThrowAsync(userId);
        var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        ThrowIfFailed(result);
    }

    public async Task<AccountResponseDto> ChangeEmailAsync(string userId, ChangeEmailRequestDto request)
    {
        var user = await FindUserOrThrowAsync(userId);

        if (!await _userManager.CheckPasswordAsync(user, request.CurrentPassword))
        {
            throw new InvalidOperationException("La contraseña actual es incorrecta.");
        }

        var existing = await _userManager.FindByEmailAsync(request.NewEmail);
        if (existing is not null && existing.Id != user.Id)
        {
            throw new InvalidOperationException("Ya existe una cuenta registrada con ese correo.");
        }

        var emailResult = await _userManager.SetEmailAsync(user, request.NewEmail);
        ThrowIfFailed(emailResult);

        // UserName espeja al email en el resto del sistema (ver AuthService.RegisterAsync
        // — se registra con UserName = Email), así que se actualiza junto con el email.
        var usernameResult = await _userManager.SetUserNameAsync(user, request.NewEmail);
        ThrowIfFailed(usernameResult);

        return await ToDtoAsync(user);
    }

    private async Task<ApplicationUser> FindUserOrThrowAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
        {
            throw new InvalidOperationException("Usuario no encontrado.");
        }
        return user;
    }

    private const int MaxGalleryPhotos = 10;

    public async Task<AccountResponseDto> AddGalleryPhotoAsync(string userId, IFormFile photo)
    {
        var user = await FindUserOrThrowAsync(userId);

        if (user.GalleryPhotoPaths.Count >= MaxGalleryPhotos)
        {
            throw new InvalidOperationException($"Máximo {MaxGalleryPhotos} fotos en la galería.");
        }

        var relativePath = await _fileStorageService.SaveAsync(photo, $"gallery/{userId}");
        user.GalleryPhotoPaths.Add(relativePath);

        var result = await _userManager.UpdateAsync(user);
        ThrowIfFailed(result);

        return await ToDtoAsync(user);
    }

    public async Task<AccountResponseDto> RemoveGalleryPhotoAsync(string userId, string photoUrl)
    {
        var user = await FindUserOrThrowAsync(userId);

        var relativePath = photoUrl.StartsWith("/uploads/") ? photoUrl["/uploads/".Length..] : photoUrl;
        if (!user.GalleryPhotoPaths.Remove(relativePath))
        {
            throw new InvalidOperationException("La foto no pertenece a la galería de este usuario.");
        }

        var result = await _userManager.UpdateAsync(user);
        ThrowIfFailed(result);

        return await ToDtoAsync(user);
    }
    private static void ThrowIfFailed(IdentityResult result)
    {
        if (!result.Succeeded)
        {
            throw new InvalidOperationException(string.Join(" ", result.Errors.Select(e => e.Description)));
        }
    }

    private async Task<AccountResponseDto> ToDtoAsync(ApplicationUser user)
    {
        var isAdmin = await _userManager.IsInRoleAsync(user, "Admin");
        return new AccountResponseDto
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
        };
    }

    // Espejo de ProfileService.ToUrl — FileStorageService.SaveAsync devuelve
    // una ruta relativa a wwwroot/uploads, servida vía app.UseStaticFiles() (Program.cs).
    private static string? ToUrl(string? relativePath) =>
        relativePath is null ? null : $"/uploads/{relativePath}";
}
