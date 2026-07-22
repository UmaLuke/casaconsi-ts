using CasaConSi.Api.Services.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace CasaConSi.Api.Services;

public class FileStorageService : IFileStorageService
{
    private readonly IWebHostEnvironment _environment;
    private const long MaxFileSizeBytes = 10 * 1024 * 1024; // 10 MB

    public FileStorageService(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    public async Task<string> SaveAsync(IFormFile file, string subfolder)
    {
        if (file.Length == 0)
        {
            throw new InvalidOperationException("El archivo está vacío.");
        }
        if (file.Length > MaxFileSizeBytes)
        {
            throw new InvalidOperationException("El archivo supera el tamaño máximo permitido (10 MB).");
        }

        var webRoot = _environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot");
        var targetDirectory = Path.Combine(webRoot, "uploads", subfolder);
        Directory.CreateDirectory(targetDirectory);

        var extension = Path.GetExtension(file.FileName);
        var fileName = $"{Guid.NewGuid()}{extension}";
        var fullPath = Path.Combine(targetDirectory, fileName);

        await using (var stream = new FileStream(fullPath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Ruta relativa a wwwroot/uploads — ProfileService arma la URL pública a partir de esto.
        return $"{subfolder}/{fileName}".Replace('\\', '/');
    }
}
