using CasaConSi.Api.Models.Enums;

namespace CasaConSi.Api.Models;

public class AdvisorySession
{
    public Guid Id { get; set; }
    public required string AdvisorUserId { get; set; }
    public required string ClientUserId { get; set; }
    public required AdvisorySessionType SessionType { get; set; }
    public required DateTime ScheduledAt { get; set; } // UTC
    public AdvisorySessionStatus Status { get; set; } = AdvisorySessionStatus.Pending;
    public decimal Price { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}