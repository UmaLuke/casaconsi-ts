using CasaConSi.Api.Data;
using CasaConSi.Api.Models;
using CasaConSi.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CasaConSi.Api.Repositories;

public class ChatRepository : IChatRepository
{
    private readonly ApplicationDbContext _context;

    public ChatRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public Task<Match?> GetMatchByIdAsync(Guid matchId) =>
        _context.Matches.FirstOrDefaultAsync(m => m.Id == matchId);

    public Task<List<Message>> GetMessagesAsync(Guid matchId) =>
        _context.Messages.Where(m => m.MatchId == matchId).OrderBy(m => m.CreatedAt).ToListAsync();

    public Task<Message?> GetLastMessageAsync(Guid matchId) =>
        _context.Messages.Where(m => m.MatchId == matchId).OrderByDescending(m => m.CreatedAt).FirstOrDefaultAsync();

    public async Task<Message> AddMessageAsync(Guid matchId, string senderUserId, string content)
    {
        var message = new Message
        {
            Id = Guid.NewGuid(),
            MatchId = matchId,
            SenderUserId = senderUserId,
            Content = content,
        };
        await _context.Messages.AddAsync(message);
        return message;
    }

    public Task SaveChangesAsync() => _context.SaveChangesAsync();
}