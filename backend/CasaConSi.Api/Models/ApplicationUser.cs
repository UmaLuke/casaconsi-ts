using CasaConSi.Api.Models.Enums;
using Microsoft.AspNetCore.Identity;

namespace CasaConSi.Api.Models;

public class ApplicationUser : IdentityUser
{
    public required string Name { get; set; }
    public required UserRole Role { get; set; }
    public string? Avatar { get; set; }
    public string? Title { get; set; }
    // Se completa después, en el cuestionario post-registro — no viaja en RegisterRequestDto
    public Generation? Generation { get; set; }
}