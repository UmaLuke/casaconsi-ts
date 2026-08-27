using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using CasaConSi.Api.DTOs.Trust;
using CasaConSi.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CasaConSi.Api.Controllers;

// Mismo criterio que ProfileController: solo opera sobre el usuario del token.
[ApiController]
[Route("api/trust")]
[Authorize]
public class TrustController : ControllerBase
{
    private readonly ITrustService _trustService;

    public TrustController(ITrustService trustService)
    {
        _trustService = trustService;
    }

    private string CurrentUserId =>
        User.FindFirstValue(JwtRegisteredClaimNames.Sub)
        ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new UnauthorizedAccessException("Token sin identificador de usuario.");

    [HttpGet("status")]
    public async Task<ActionResult<TrustStatusResponseDto>> GetStatus()
    {
        var response = await _trustService.GetStatusAsync(CurrentUserId);
        return Ok(response);
    }

    [HttpPut("items")]
    public async Task<ActionResult<TrustStatusResponseDto>> UpdateItems(UpdateTrustItemsRequestDto request)
    {
        var response = await _trustService.UpdateItemsAsync(CurrentUserId, request);
        return Ok(response);
    }
    [HttpPost("solicitar-alta-confianza")]
    public async Task<ActionResult<TrustStatusResponseDto>> RequestAltaConfianza()
    {
        var response = await _trustService.RequestAltaConfianzaAsync(CurrentUserId);
        return Ok(response);
    }
}