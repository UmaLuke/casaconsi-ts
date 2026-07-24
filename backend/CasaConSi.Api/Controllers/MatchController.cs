using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using CasaConSi.Api.DTOs.Match;
using CasaConSi.Api.Models.Enums;
using CasaConSi.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CasaConSi.Api.Controllers;

// Igual que ProfileController: todos los endpoints operan sobre el usuario
// autenticado del token, nunca sobre un id que mande el cliente.
[ApiController]
[Route("api/match")]
[Authorize]
public class MatchController : ControllerBase
{
    private readonly IMatchService _matchService;

    public MatchController(IMatchService matchService)
    {
        _matchService = matchService;
    }

    private string CurrentUserId =>
        User.FindFirstValue(JwtRegisteredClaimNames.Sub)
        ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new UnauthorizedAccessException("Token sin identificador de usuario.");

    private UserRole CurrentUserRole
    {
        get
        {
            var roleClaim = User.FindFirstValue(ClaimTypes.Role);
            return Enum.TryParse<UserRole>(roleClaim, out var role)
                ? role
                : throw new UnauthorizedAccessException("Rol de usuario no reconocido.");
        }
    }

    [HttpGet("feed")]
    public async Task<ActionResult<List<MatchFeedItemDto>>> GetFeed()
    {
        try
        {
            var feed = await _matchService.GetFeedAsync(CurrentUserId, CurrentUserRole);
            return Ok(feed);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("like")]
    public async Task<ActionResult<LikeResponseDto>> Like(LikeRequestDto request)
    {
        try
        {
            var response = await _matchService.RegisterDecisionAsync(CurrentUserId, CurrentUserRole, request.TargetUserId, request.Liked);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet]
    public async Task<ActionResult<List<MatchSummaryDto>>> GetMatches()
    {
        var matches = await _matchService.GetMatchesAsync(CurrentUserId, CurrentUserRole);
        return Ok(matches);
    }
}