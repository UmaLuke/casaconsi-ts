namespace CasaConSi.Api.Models;

// Se crea cuando un Student y un Host se dieron like mutuamente (ver
// ProfileLike y MatchService.RegisterDecisionAsync). Es lo que habilita el
// chat — ver docs/vault-casaconsi/modulos/Match.md para el diseño acordado.
public class Match
{
    public Guid Id { get; set; }
    public required string StudentUserId { get; set; }
    public required string HostUserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}