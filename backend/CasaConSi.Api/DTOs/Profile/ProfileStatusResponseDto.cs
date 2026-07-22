namespace CasaConSi.Api.DTOs.Profile;

// "Perfil completado" = existe el registro de perfil para el usuario. No hay
// flag booleano separado que sincronizar (ver plan de arquitectura acordado).
public record ProfileStatusResponseDto
{
    public required bool HasProfile { get; init; }
}
