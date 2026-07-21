using CasaConSi.Api.Models;
using CasaConSi.Api.Models.Enums;
using Microsoft.AspNetCore.Identity;

namespace CasaConSi.Api.Data;

// Corre una sola vez al iniciar la app (ver Program.cs). Idempotente: si el rol
// o el usuario admin ya existen, no hace nada. No hay ningún endpoint público
// que dispare esto — la única forma de crear/actualizar el admin es acá.
public static class AdminSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var configuration = services.GetRequiredService<IConfiguration>();

        const string adminRole = "Admin";
        if (!await roleManager.RoleExistsAsync(adminRole))
        {
            await roleManager.CreateAsync(new IdentityRole(adminRole));
        }

        var adminEmail = configuration["AdminSeed:Email"];
        var adminPassword = configuration["AdminSeed:Password"];

        if (string.IsNullOrWhiteSpace(adminEmail) || string.IsNullOrWhiteSpace(adminPassword))
        {
            // Sin credenciales configuradas todavía (ej. clon nuevo del repo sin
            // user-secrets seteados) no creamos nada. No es un error.
            return;
        }

        var existingAdmin = await userManager.FindByEmailAsync(adminEmail);
        if (existingAdmin is not null)
        {
            if (!await userManager.IsInRoleAsync(existingAdmin, adminRole))
            {
                await userManager.AddToRoleAsync(existingAdmin, adminRole);
            }
            return;
        }

        var admin = new ApplicationUser
        {
            UserName = adminEmail,
            Email = adminEmail,
            Name = "Administrador",
            Role = UserRole.Host, // placeholder: el admin no participa del matching host/student, ver nota abajo
            EmailConfirmed = true,
        };

        var result = await userManager.CreateAsync(admin, adminPassword);
        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(admin, adminRole);
        }
        else
        {
            var errors = string.Join(" ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"No se pudo crear el usuario admin: {errors}");
        }
    }
}