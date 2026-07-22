using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using CasaConSi.Api.DTOs.Profile;
using CasaConSi.Api.Models.Enums;
using CasaConSi.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CasaConSi.Api.Controllers;

// Todos los endpoints requieren usuario autenticado y solo operan sobre el
// perfil del usuario del token (nunca se acepta un id de perfil/usuario
// como parámetro) — así no hay forma de pedir o pisar el perfil de otra persona.
[ApiController]
[Route("api/profile")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly IProfileService _profileService;

    public ProfileController(IProfileService profileService)
    {
        _profileService = profileService;
    }

    private string CurrentUserId =>
        User.FindFirstValue(JwtRegisteredClaimNames.Sub)
        ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new UnauthorizedAccessException("Token sin identificador de usuario.");

    [HttpGet("status")]
    public async Task<ActionResult<ProfileStatusResponseDto>> GetStatus()
    {
        var roleClaim = User.FindFirstValue(ClaimTypes.Role);
        if (!Enum.TryParse<UserRole>(roleClaim, out var role))
        {
            return BadRequest(new { message = "Rol de usuario no reconocido." });
        }

        var hasProfile = await _profileService.HasProfileAsync(CurrentUserId, role);
        return Ok(new ProfileStatusResponseDto { HasProfile = hasProfile });
    }

    [HttpPut("student")]
    [Authorize(Roles = "Student")]
    public async Task<ActionResult<StudentProfileResponseDto>> SaveStudent(StudentProfileRequestDto request)
    {
        var response = await _profileService.SaveStudentProfileAsync(CurrentUserId, request);
        return Ok(response);
    }

    [HttpGet("student")]
    [Authorize(Roles = "Student")]
    public async Task<ActionResult<StudentProfileResponseDto>> GetStudent()
    {
        var response = await _profileService.GetStudentProfileAsync(CurrentUserId);
        return response is null ? NotFound() : Ok(response);
    }

    [HttpPost("student/photos")]
    [Authorize(Roles = "Student")]
    public async Task<ActionResult<StudentProfileResponseDto>> UploadStudentPhotos(
        [FromForm] IFormFile? profilePhoto,
        [FromForm] IFormFile? presentationMedia)
    {
        try
        {
            var response = await _profileService.SaveStudentPhotosAsync(CurrentUserId, profilePhoto, presentationMedia);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("host")]
    [Authorize(Roles = "Host")]
    public async Task<ActionResult<HostProfileResponseDto>> SaveHost(HostProfileRequestDto request)
    {
        var response = await _profileService.SaveHostProfileAsync(CurrentUserId, request);
        return Ok(response);
    }

    [HttpGet("host")]
    [Authorize(Roles = "Host")]
    public async Task<ActionResult<HostProfileResponseDto>> GetHost()
    {
        var response = await _profileService.GetHostProfileAsync(CurrentUserId);
        return response is null ? NotFound() : Ok(response);
    }

    [HttpPost("host/photos")]
    [Authorize(Roles = "Host")]
    public async Task<ActionResult<HostProfileResponseDto>> UploadHostPhotos(
        [FromForm] IFormFile? profilePhoto,
        [FromForm] List<IFormFile>? homeAndRoomPhotos,
        [FromForm] IFormFile? presentationMedia)
    {
        try
        {
            var response = await _profileService.SaveHostPhotosAsync(
                CurrentUserId, profilePhoto, homeAndRoomPhotos ?? new List<IFormFile>(), presentationMedia);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
