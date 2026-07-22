using Microsoft.AspNetCore.Http;

namespace CasaConSi.Api.Services.Interfaces;

// Abstrae dónde se guardan los archivos subidos (fotos de perfil, del hogar,
// etc.). Hoy: disco local. Si más adelante se despliega a Azure y conviene
// mover esto a Azure Blob Storage, se cambia la implementación sin tocar
// ProfileService ni los Controllers.
public interface IFileStorageService
{
    /// <param name="subfolder">Ej. "profiles/{userId}" — se crea si no existe.</param>
    /// <returns>Ruta relativa (a partir de wwwroot/uploads) del archivo guardado.</returns>
    Task<string> SaveAsync(IFormFile file, string subfolder);
}
