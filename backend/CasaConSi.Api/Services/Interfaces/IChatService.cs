using CasaConSi.Api.DTOs.Chat;
using CasaConSi.Api.Models.Enums;

namespace CasaConSi.Api.Services.Interfaces;

public interface IChatService
{
    Task<List<ConversationSummaryDto>> GetConversationsAsync(string userId, UserRole role);
    Task<List<MessageDto>> GetMessagesAsync(string userId, Guid matchId);
    Task<MessageDto> SendMessageAsync(string userId, Guid matchId, string content);

    // Usado tanto por ChatController como por ChatHub para validar que
    // userId sea Student o Host del Match antes de leer/escribir/unirse al
    // grupo de SignalR.
    Task EnsureParticipantAsync(string userId, Guid matchId);
}