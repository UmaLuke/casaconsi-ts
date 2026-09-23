using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using CasaConSi.Api.DTOs.Space;
using CasaConSi.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CasaConSi.Api.Controllers;

[ApiController]
[Route("api/space")]
public class SpaceController : ControllerBase
{
    private readonly ISpaceService _spaceService;

    public SpaceController(ISpaceService spaceService)
    {
        _spaceService = spaceService;
    }

    private string CurrentUserId =>
        User.FindFirstValue(JwtRegisteredClaimNames.Sub)
        ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new UnauthorizedAccessException("Token sin identificador de usuario.");

    // Público — ExploreSpacesPage no requiere login (ver App.tsx: /explorar no está en ProtectedRoute).
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<List<SpaceResponseDto>>> GetAll()
    {
        return Ok(await _spaceService.GetActiveSpacesAsync());
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<SpaceResponseDto>> GetById(Guid id)
    {
        var space = await _spaceService.GetSpaceByIdAsync(id);
        return space is null ? NotFound() : Ok(space);
    }

    [HttpGet("mine")]
    [Authorize(Roles = "Host")]
    public async Task<ActionResult<List<SpaceResponseDto>>> GetMine()
    {
        return Ok(await _spaceService.GetMySpacesAsync(CurrentUserId));
    }

    [HttpPost]
    [Authorize(Roles = "Host")]
    public async Task<ActionResult<SpaceResponseDto>> Create(CreateSpaceRequestDto request)
    {
        var created = await _spaceService.CreateSpaceAsync(CurrentUserId, request);
        return Ok(created);
    }

    [HttpPost("{id:guid}/photos")]
    [Authorize(Roles = "Host")]
    public async Task<ActionResult<SpaceResponseDto>> UploadPhotos(Guid id, [FromForm] List<IFormFile> photos)
    {
        try
        {
            var updated = await _spaceService.UploadPhotosAsync(CurrentUserId, id, photos);
            return Ok(updated);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Host")]
    public async Task<ActionResult<SpaceResponseDto>> Update(Guid id, UpdateSpaceRequestDto request)
    {
        try
        {
            return Ok(await _spaceService.UpdateSpaceAsync(CurrentUserId, id, request));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Roles = "Host")]
    public async Task<ActionResult<SpaceResponseDto>> UpdateStatus(Guid id, UpdateSpaceStatusRequestDto request)
    {
        try
        {
            return Ok(await _spaceService.UpdateSpaceStatusAsync(CurrentUserId, id, request.IsActive));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Host")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            await _spaceService.DeleteSpaceAsync(CurrentUserId, id);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:guid}/photos/{index:int}")]
    [Authorize(Roles = "Host")]
    public async Task<ActionResult<SpaceResponseDto>> DeletePhoto(Guid id, int index)
    {
        try
        {
            return Ok(await _spaceService.DeleteSpacePhotoAsync(CurrentUserId, id, index));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:guid}/photos/order")]
    [Authorize(Roles = "Host")]
    public async Task<ActionResult<SpaceResponseDto>> ReorderPhotos(Guid id, ReorderSpacePhotosRequestDto request)
    {
        try
        {
            return Ok(await _spaceService.ReorderSpacePhotosAsync(CurrentUserId, id, request.Order));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
