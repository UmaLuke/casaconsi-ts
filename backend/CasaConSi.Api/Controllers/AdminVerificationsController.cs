using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using CasaConSi.Api.DTOs.Admin;
using CasaConSi.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CasaConSi.Api.Controllers;

[ApiController]
[Route("api/admin/verificaciones")]
[Authorize(Roles = "Admin")]
public class AdminVerificationsController : ControllerBase
{
    private readonly IAdminVerificationService _adminVerificationService;

    public AdminVerificationsController(IAdminVerificationService adminVerificationService)
    {
        _adminVerificationService = adminVerificationService;
    }

    private string CurrentAdminUserId =>
        User.FindFirstValue(JwtRegisteredClaimNames.Sub)
        ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new UnauthorizedAccessException("Token sin identificador de usuario.");

    [HttpGet]
    public async Task<ActionResult<List<AdminVerificationQueueItemDto>>> GetQueue()
    {
        return Ok(await _adminVerificationService.GetQueueAsync());
    }

    [HttpGet("{userId}")]
    public async Task<ActionResult<AdminVerificationDetailDto>> GetDetail(string userId)
    {
        return Ok(await _adminVerificationService.GetDetailAsync(userId));
    }

    [HttpPost("{userId}/aprobar")]
    public async Task<ActionResult<AdminVerificationDetailDto>> Approve(string userId)
    {
        return Ok(await _adminVerificationService.ApproveAsync(userId, CurrentAdminUserId));
    }

    [HttpPost("{userId}/rechazar")]
    public async Task<ActionResult<AdminVerificationDetailDto>> Reject(string userId, AdminVerificationRejectRequestDto request)
    {
        return Ok(await _adminVerificationService.RejectAsync(userId, CurrentAdminUserId, request.Reason));
    }
}