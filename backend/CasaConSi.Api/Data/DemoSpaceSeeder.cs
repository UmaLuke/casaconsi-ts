using CasaConSi.Api.Models;
using Microsoft.AspNetCore.Identity;

namespace CasaConSi.Api.Data;

// Solo Development, igual que DemoProfileSeeder (que tiene que correr antes:
// necesita que los anfitriones demo ya existan). Idempotente: si el anfitrión
// ya tiene algún Space, no crea otro.
public static class DemoSpaceSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var db = services.GetRequiredService<ApplicationDbContext>();

        foreach (var seed in Seeds)
        {
            var host = await userManager.FindByEmailAsync(seed.HostEmail);
            if (host is null) continue; // DemoProfileSeeder no corrió o falló — no rompemos el arranque por esto

            var alreadyHasSpace = db.Spaces.Any(s => s.HostUserId == host.Id);
            if (alreadyHasSpace) continue;

            db.Spaces.Add(new Space
            {
                Id = Guid.NewGuid(),
                HostUserId = host.Id,
                Title = seed.Title,
                Description = seed.Description,
                Location = seed.Location,
                Neighborhood = seed.Neighborhood,
                HostTypeLabel = seed.HostTypeLabel,
                PriceArs = seed.PriceArs,
                Purpose = seed.Purpose,
                Duration = seed.Duration,
                Amenities = seed.Amenities,
                ExternalImageUrl = seed.ExternalImageUrl,
                Verified = true,
            });
        }

        await db.SaveChangesAsync();
    }

    private record SpaceSeed(
        string HostEmail, string Title, string Description, string Location, string Neighborhood,
        string HostTypeLabel, decimal PriceArs, string Purpose, string Duration,
        List<string> Amenities, string ExternalImageUrl);

    private static readonly List<SpaceSeed> Seeds = new()
    {
        new(
            "rosa.anfitriona@demo.com",
            "Habitación Luminosa con Baño Privado",
            "Habitación amplia y luminosa, con baño privado, en departamento tranquilo de Nueva Córdoba.",
            "Nueva Córdoba, a 15 min de la Universidad",
            "Nueva Córdoba",
            "Propietaria",
            90000m,
            "estudiar",
            "anual",
            new() { "Wifi", "Escritorio", "Cocina compartida" },
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=60"),
        new(
            "carlos.anfitrion@demo.com",
            "Anexo Independiente en Casa Familiar",
            "Anexo con entrada independiente en casa familiar de Alberdi, jardín y servicios incluidos.",
            "Alberdi, Zona Residencial",
            "Alberdi",
            "Propietario",
            80000m,
            "compartir-gastos",
            "semestral-cuatrimestral",
            new() { "Entrada independiente", "Jardín", "Servicios incluidos" },
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=60"),
        new(
            "elena.anfitriona@demo.com",
            "Cuarto con Vista al Jardín",
            "Cuarto tranquilo con vista al jardín en casa de Cerro de las Rosas, zona arbolada.",
            "Cerro de las Rosas, zona tranquila y arbolada",
            "Cerro de las Rosas",
            "Propietaria",
            105000m,
            "estudiar",
            "semestral-cuatrimestral",
            new() { "Jardín", "Desayuno incluido", "Wifi" },
            "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&auto=format&fit=crop&q=60"),
    };
}