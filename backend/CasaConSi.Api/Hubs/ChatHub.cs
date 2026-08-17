using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using CasaConSi.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace CasaConSi.Api.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly IChatService _chatService;

    public ChatHub(IChatService chatService)
    {
        _chatService = chatService;
    }

    private string CurrentUserId =>
        Context.User?.FindFirstValue(JwtRegisteredClaimNames.Sub)
        ?? Context.User?.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new HubException("Token sin identificador de usuario.");

    public async Task JoinConversation(Guid matchId)
    {
        try
        {
            await _chatService.EnsureParticipantAsync(CurrentUserId, matchId);
        }
        catch (Exception ex) when (ex is InvalidOperationException or UnauthorizedAccessException)
        {
            throw new HubException(ex.Message);
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, GroupName(matchId));
    }

    public Task LeaveConversation(Guid matchId) =>
        Groups.RemoveFromGroupAsync(Context.ConnectionId, GroupName(matchId));

    public async Task SendMessage(Guid matchId, string content)
    {
        try
        {
            var message = await _chatService.SendMessageAsync(CurrentUserId, matchId, content);
            await Clients.Group(GroupName(matchId)).SendAsync("ReceiveMessage", message);
        }
        catch (Exception ex) when (ex is InvalidOperationException or UnauthorizedAccessException)
        {
            throw new HubException(ex.Message);
        }
    }

    private static string GroupName(Guid matchId) => $"match-{matchId}";
}