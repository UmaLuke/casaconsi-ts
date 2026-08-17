using CasaConSi.Api.Models;

namespace CasaConSi.Api.Repositories.Interfaces;

public interface IChatRepository
{
    Task<Match?> GetMatchByIdAsync(Guid matchId);
    Task<List<Message>> GetMessagesAsync(Guid matchId);
    Task<Message?> GetLastMessageAsync(Guid matchId);
    Task<Message> AddMessageAsync(Guid matchId, string senderUserId, string content);
    Task SaveChangesAsync();
}