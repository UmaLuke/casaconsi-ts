using CasaConSi.Api.DTOs.Space;
using CasaConSi.Api.Models;
using CasaConSi.Api.Repositories.Interfaces;
using CasaConSi.Api.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;

namespace CasaConSi.Api.Services;

public class SpaceService : ISpaceService
{
    private readonly ISpaceRepository _spaceRepository;
    private readonly IFileStorageService _fileStorageService;
    private readonly UserManager<ApplicationUser> _userManager;

    public SpaceService(
        ISpaceRepository spaceRepository,
        IFileStorageService fileStorageService,
        UserManager<ApplicationUser> userManager)
    {
        _spaceRepository = spaceRepository;
        _fileStorageService = fileStorageService;
        _userManager = userManager;
    }

    public async Task<List<SpaceResponseDto>> GetActiveSpacesAsync()
    {
        var spaces = await _spaceRepository.GetActiveAsync();
        var result = new List<SpaceResponseDto>();
        foreach (var space in spaces)
        {
            var dto = await ToResponseDtoAsync(space);
            if (dto is not null) result.Add(dto);
        }
        return result;
    }

    public async Task<SpaceResponseDto?> GetSpaceByIdAsync(Guid id)
    {
        var space = await _spaceRepository.GetByIdAsync(id);
        return space is null ? null : await ToResponseDtoAsync(space);
    }

    public async Task<List<SpaceResponseDto>> GetMySpacesAsync(string hostUserId)
    {
        var spaces = await _spaceRepository.GetByHostUserIdAsync(hostUserId);
        var result = new List<SpaceResponseDto>();
        foreach (var space in spaces)
        {
            var dto = await ToResponseDtoAsync(space);
            if (dto is not null) result.Add(dto);
        }
        return result;
    }

    public async Task<SpaceResponseDto> CreateSpaceAsync(string hostUserId, CreateSpaceRequestDto request)
    {
        var space = new Space
        {
            Id = Guid.NewGuid(),
            HostUserId = hostUserId,
            Title = request.Title,
            Description = request.Description,
            Location = request.Location,
            Neighborhood = request.Neighborhood,
            HostTypeLabel = request.HostType,
            PriceArs = request.Price,
            Purpose = request.Purpose,
            Duration = request.Duration,
            Amenities = request.Amenities,
        };

        await _spaceRepository.AddAsync(space);
        await _spaceRepository.SaveChangesAsync();

        return await ToResponseDtoAsync(space)
            ?? throw new InvalidOperationException("No se pudo crear la publicación.");
    }

    public async Task<SpaceResponseDto> UploadPhotosAsync(string hostUserId, Guid spaceId, List<IFormFile> photos)
    {
        var space = await _spaceRepository.GetByIdAsync(spaceId)
            ?? throw new InvalidOperationException("La publicación indicada no existe.");

        if (space.HostUserId != hostUserId)
        {
            throw new InvalidOperationException("Esta publicación no te pertenece.");
        }

        foreach (var photo in photos)
        {
            space.PhotoPaths.Add(await _fileStorageService.SaveAsync(photo, $"spaces/{space.Id}"));
        }

        space.UpdatedAt = DateTime.UtcNow;
        await _spaceRepository.SaveChangesAsync();

        return await ToResponseDtoAsync(space)
            ?? throw new InvalidOperationException("No se pudo actualizar la publicación.");
    }

    private async Task<SpaceResponseDto?> ToResponseDtoAsync(Space space)
    {
        var host = await _userManager.FindByIdAsync(space.HostUserId);
        if (host?.Generation is null) return null; // anfitrión sin cuestionario completo: no se muestra todavía

        return new SpaceResponseDto
        {
            Id = space.Id,
            HostUserId = space.HostUserId,
            HostName = host.Name,
            Title = space.Title,
            Location = space.Location,
            Neighborhood = space.Neighborhood,
            Price = space.PriceArs,
            Currency = "ARS",
            HostType = space.HostTypeLabel,
            HostGeneration = host.Generation.Value,
            Purpose = space.Purpose,
            Duration = space.Duration,
            Amenities = space.Amenities,
            ImageUrl = ToImageUrl(space),
            Verified = space.Verified,
        };
    }

    private static string? ToImageUrl(Space space) =>
        space.PhotoPaths.Count > 0 ? $"/uploads/{space.PhotoPaths[0]}" : space.ExternalImageUrl;
}