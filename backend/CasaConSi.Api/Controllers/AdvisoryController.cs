using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using CasaConSi.Api.DTOs.Advisory;
using CasaConSi.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CasaConSi.Api.Controllers;

[ApiController]
[Route("api/advisory")]
public class AdvisoryController : ControllerBase
{
    private readonly IAdvisoryService _advisoryService;

    public AdvisoryController(IAdvisoryService advisoryService)
    {
        _advisoryService = advisoryService;
    }

    private string CurrentUserId =>
        User.FindFirstValue(JwtRegisteredClaimNames.Sub)
        ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new UnauthorizedAccessException("Token sin identificador de usuario.");

    // Reservas centralizadas: no hay catálogo de asesoras público, solo
    // disponibilidad por día (ver AdvisoryService). Público, igual que
    // /api/space — reservar sí requiere estar logueado.
    [HttpGet("availability")]
    public async Task<ActionResult<List<AvailabilitySlotDto>>> GetAvailability([FromQuery] DateOnly date)
    {
        try
        {
            return Ok(await _advisoryService.GetAvailabilityAsync(date));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("sessions")]
    [Authorize]
    public async Task<ActionResult<AdvisorySessionDto>> CreateSession(CreateAdvisorySessionRequestDto request)
    {
        try
        {
            var session = await _advisoryService.CreateSessionAsync(CurrentUserId, request);
            return Ok(session);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("sessions/mine")]
    [Authorize]
    public async Task<ActionResult<List<AdvisorySessionDto>>> GetMySessions()
    {
        return Ok(await _advisoryService.GetMySessionsAsync(CurrentUserId));
    }
}
