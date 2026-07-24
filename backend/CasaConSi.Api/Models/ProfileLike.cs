using CasaConSi.Api.Models.Enums;

namespace CasaConSi.Api.Models;

// Un "swipe": la decisión de una persona (Student u Host) sobre el perfil de
// la otra. Cada par (StudentUserId, HostUserId) puede tener hasta dos filas
// acá: una con DecidedByRole = Student y otra con DecidedByRole = Host. Un
// Match (ver Match.cs) se crea cuando existen las dos y ambas son Liked = true.
public class ProfileLike
{
    public Guid Id { get; set; }
    public required string StudentUserId { get; set; }
    public required string HostUserId { get; set; }
    public required UserRole DecidedByRole { get; set; }
    public required bool Liked { get; set; } // true = like, false = pass
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}