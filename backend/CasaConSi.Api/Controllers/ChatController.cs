using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using CasaConSi.Api.DTOs.Chat;
using CasaConSi.Api.Models.Enums;
using CasaConSi.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CasaConSi.Api.Controllers;

[ApiController]
[Route("api/chat")]
[Authorize]
public class ChatController : ControllerBase
{
    private readonly IChatService _chatService;

    public ChatController(IChatService chatService)
    {
        _chatService = chatService;
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

    [HttpGet]
    public async Task<ActionResult<List<ConversationSummaryDto>>> GetConversations()
    {
        var conversations = await _chatService.GetConversationsAsync(CurrentUserId, CurrentUserRole);
        return Ok(conversations);
    }

    [HttpGet("{matchId:guid}/messages")]
    public async Task<ActionResult<List<MessageDto>>> GetMessages(Guid matchId)
    {
        try
        {
            var messages = await _chatService.GetMessagesAsync(CurrentUserId, matchId);
            return Ok(messages);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}