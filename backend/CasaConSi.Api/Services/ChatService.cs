using CasaConSi.Api.DTOs.Chat;
using CasaConSi.Api.Models;
using CasaConSi.Api.Models.Enums;
using CasaConSi.Api.Repositories.Interfaces;
using CasaConSi.Api.Services.Interfaces;

namespace CasaConSi.Api.Services;

public class ChatService : IChatService
{
    private readonly IChatRepository _chatRepository;
    private readonly IMatchRepository _matchRepository;
    private readonly IProfileRepository _profileRepository;

    public ChatService(
        IChatRepository chatRepository,
        IMatchRepository matchRepository,
        IProfileRepository profileRepository)
    {
        _chatRepository = chatRepository;
        _matchRepository = matchRepository;
        _profileRepository = profileRepository;
    }

    public async Task<List<ConversationSummaryDto>> GetConversationsAsync(string userId, UserRole role)
    {
        var matches = role == UserRole.Student
            ? await _matchRepository.GetMatchesForStudentAsync(userId)
            : await _matchRepository.GetMatchesForHostAsync(userId);

        var result = new List<ConversationSummaryDto>();
        foreach (var match in matches)
        {
            var counterpartUserId = role == UserRole.Student ? match.HostUserId : match.StudentUserId;
            var lastMessage = await _chatRepository.GetLastMessageAsync(match.Id);

            string counterpartName;
            string? counterpartPhotoUrl;

            if (role == UserRole.Student)
            {
                var host = await _profileRepository.GetHostProfileByUserIdAsync(counterpartUserId);
                if (host is null) continue;
                counterpartName = host.PersonalData.FullName;
                counterpartPhotoUrl = ToUrl(host.ProfilePhotoPath);
            }
            else
            {
                var student = await _profileRepository.GetStudentProfileByUserIdAsync(counterpartUserId);
                if (student is null) continue;
                counterpartName = student.PersonalData.FullName;
                counterpartPhotoUrl = ToUrl(student.ProfilePhotoPath);
            }

            result.Add(new ConversationSummaryDto
            {
                MatchId = match.Id,
                CounterpartUserId = counterpartUserId,
                CounterpartName = counterpartName,
                CounterpartPhotoUrl = counterpartPhotoUrl,
                LastMessage = lastMessage?.Content,
                LastMessageAt = lastMessage?.CreatedAt,
            });
        }

        return result.OrderByDescending(c => c.LastMessageAt ?? DateTime.MinValue).ToList();
    }

    public async Task<List<MessageDto>> GetMessagesAsync(string userId, Guid matchId)
    {
        await EnsureParticipantAsync(userId, matchId);
        var messages = await _chatRepository.GetMessagesAsync(matchId);
        return messages.Select(ToDto).ToList();
    }

    public async Task<MessageDto> SendMessageAsync(string userId, Guid matchId, string content)
    {
        await EnsureParticipantAsync(userId, matchId);

        if (string.IsNullOrWhiteSpace(content))
        {
            throw new InvalidOperationException("El mensaje no puede estar vacío.");
        }

        var message = await _chatRepository.AddMessageAsync(matchId, userId, content.Trim());
        await _chatRepository.SaveChangesAsync();
        return ToDto(message);
    }

    public async Task EnsureParticipantAsync(string userId, Guid matchId)
    {
        var match = await _chatRepository.GetMatchByIdAsync(matchId)
            ?? throw new InvalidOperationException("La conversación indicada no existe.");

        if (match.StudentUserId != userId && match.HostUserId != userId)
        {
            throw new UnauthorizedAccessException("No tenés acceso a esta conversación.");
        }
    }

    private static MessageDto ToDto(Message message) => new()
    {
        Id = message.Id,
        MatchId = message.MatchId,
        SenderUserId = message.SenderUserId,
        Content = message.Content,
        CreatedAt = message.CreatedAt,
    };

    private static string? ToUrl(string? relativePath) =>
        relativePath is null ? null : $"/uploads/{relativePath}";
}