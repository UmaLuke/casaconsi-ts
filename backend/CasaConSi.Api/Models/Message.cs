// Models/Message.cs
public class Message
{
    public Guid Id { get; set; }
    public required Guid MatchId { get; set; }
    public required string SenderUserId { get; set; }
    public required string Content { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}