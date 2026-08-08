using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using CasaConSi.Api.DTOs.Account;
using CasaConSi.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CasaConSi.Api.Controllers;

// Endpoints de la CUENTA (nombre, email, password, avatar) — el botón
// "Mi perfil" del Header. Todos requieren usuario autenticado y solo operan
// sobre la cuenta del token (mismo criterio que ProfileController: nunca se
// acepta un id de usuario como parámetro).
[ApiController]
[Route("api/account")]
[Authorize]
public class AccountController : ControllerBase
{
    private readonly IAccountService _accountService;

    public AccountController(IAccountService accountService)
    {
        _accountService = accountService;
    }

    private string CurrentUserId =>
        User.FindFirstValue(JwtRegisteredClaimNames.Sub)
        ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new UnauthorizedAccessException("Token sin identificador de usuario.");

    [HttpGet("me")]
    public async Task<ActionResult<AccountResponseDto>> GetMe()
    {
        var response = await _accountService.GetMeAsync(CurrentUserId);
        return Ok(response);
    }

    [HttpPut("me")]
    public async Task<ActionResult<AccountResponseDto>> UpdateMe(UpdateAccountRequestDto request)
    {
        try
        {
            var response = await _accountService.UpdateNameAsync(CurrentUserId, request);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("avatar")]
    public async Task<ActionResult<AccountResponseDto>> UploadAvatar([FromForm] IFormFile? avatar)
    {
        if (avatar is null)
        {
            return BadRequest(new { message = "Falta el archivo de la foto de perfil." });
        }

        try
        {
            var response = await _accountService.UpdateAvatarAsync(CurrentUserId, avatar);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequestDto request)
    {
        try
        {
            await _accountService.ChangePasswordAsync(CurrentUserId, request);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("email")]
    public async Task<ActionResult<AccountResponseDto>> ChangeEmail(ChangeEmailRequestDto request)
    {
        try
        {
            var response = await _accountService.ChangeEmailAsync(CurrentUserId, request);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
