using CasaConSi.Api.DTOs.Match;
using CasaConSi.Api.Models.Enums;

namespace CasaConSi.Api.Services.Interfaces;

public interface IMatchService
{
    Task<List<MatchFeedItemDto>> GetFeedAsync(string userId, UserRole role);
    Task<LikeResponseDto> RegisterDecisionAsync(string userId, UserRole role, string targetUserId, bool liked);
    Task<List<MatchSummaryDto>> GetMatchesAsync(string userId, UserRole role);
}