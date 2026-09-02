using CasaConSi.Api.Models;
using CasaConSi.Api.Models.Enums;
using Microsoft.AspNetCore.Identity;

namespace CasaConSi.Api.Data;

// Perfiles de asesoras de prueba para el staff de Trabajo Social. SOLO corre
// en Development (ver Program.cs). Idempotente y "upsert": si el email ya
// existe, sincroniza Profession/Bio/IsPrimaryAdvisor por si el seed cambió
// (por ejemplo la primera vez que corrió esto todavía no existía el flag
// IsPrimaryAdvisor). Misma password de test que DemoProfileSeeder.
//
// Reservas centralizadas (decisión del 2/9 con Lucía): el catálogo de
// asesoras ya no se muestra en el front — el cliente solo ve horarios. Todo
// turno se asigna a la asesora con IsPrimaryAdvisor=true (Lic. Pozzo, ver
// AdvisoryService.GetPrimaryAdvisorAsync). Igual sembramos a las 4 del staff
// real para tener el equipo completo en la base — el MP duplicado entre
// Britos y Carrara (8888) es así en el doc fuente de la clienta, no un error
// de tipeo acá.
public static class DemoAdvisorSeeder
{
    private const string DemoPassword = "Demo1234!";

    public static async Task SeedAsync(IServiceProvider services)
    {
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();

        foreach (var seed in Advisors)
        {
            var existing = await userManager.FindByEmailAsync(seed.Email);
            if (existing is not null)
            {
                if (existing.Profession != seed.Profession || existing.Bio != seed.Bio || existing.IsPrimaryAdvisor != seed.IsPrimary)
                {
                    existing.Profession = seed.Profession;
                    existing.Bio = seed.Bio;
                    existing.IsPrimaryAdvisor = seed.IsPrimary;
                    await userManager.UpdateAsync(existing);
                }
                continue;
            }

            var user = new ApplicationUser
            {
                UserName = seed.Email,
                Email = seed.Email,
                Name = seed.Name,
                Role = UserRole.Advisor,
                EmailConfirmed = true,
                Profession = seed.Profession,
                Bio = seed.Bio,
                IsDemoUser = true,
                IsPrimaryAdvisor = seed.IsPrimary,
            };

            await userManager.CreateAsync(user, DemoPassword);
        }
    }

    private record AdvisorSeed(string Email, string Name, string Profession, string Bio, bool IsPrimary);

    private static readonly List<AdvisorSeed> Advisors = new()
    {
        new(
            "luni.pozzo@demo.com",
            "Lic. Pozzo Luni",
            "Trabajo Social · MP 3948 · Fundadora de Casa con Si",
            "Acompaña a anfitriones y estudiantes en los primeros acuerdos de convivencia: expectativas, límites y comunicación.",
            true),
        new(
            "daniela.arganaraz@demo.com",
            "Lic. Argañaraz Daniela",
            "Trabajo Social · MP 1111",
            "Asesora en mediación de convivencia: prevención y resolución de conflictos entre anfitriones y estudiantes.",
            false),
        new(
            "vaniana.britos@demo.com",
            "Lic. Britos Vaniana",
            "Trabajo Social · MP 8888",
            "Acompaña la elaboración de acuerdos de convivencia personalizados y su seguimiento durante la estadía.",
            false),
        new(
            "eugenia.carrara@demo.com",
            "Lic. Carrara Eugenia",
            "Trabajo Social · MP 8888",
            "Asesora en el cierre de convivencias: valoración de la experiencia y mediación final entre las partes.",
            false),
    };
}
