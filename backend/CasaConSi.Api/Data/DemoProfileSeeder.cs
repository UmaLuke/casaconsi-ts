using CasaConSi.Api.Models;
using CasaConSi.Api.Models.Enums;
using CasaConSi.Api.Models.Profiles;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using CasaConSi.Api.Data;

namespace CasaConSi.Api.Data;

// Perfiles de prueba (estudiantes + anfitriones) para poder armar y probar la
// UI de Match's/Mensajes con datos reales antes de que exista el módulo Match.
// SOLO corre en Development (ver Program.cs) y es idempotente: si el email ya
// existe, lo salta. Password fija de test: cumple la política (8+, mayúscula,
// minúscula, dígito, no alfanumérico).
public static class DemoProfileSeeder
{
    private const string DemoPassword = "Demo1234!";

    public static async Task SeedAsync(IServiceProvider services)
    {
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var db = services.GetRequiredService<ApplicationDbContext>();
        var dataProtectionProvider = services.GetRequiredService<IDataProtectionProvider>();
        // Mismo purpose string que ProfileService — así ProfileService puede
        // desencriptar el DNI de estos perfiles sin problema.
        var dniProtector = dataProtectionProvider.CreateProtector("CasaConSi.Profile.Dni");

        foreach (var seed in Students)
        {
            await SeedStudentAsync(userManager, db, dniProtector, seed);
        }

        foreach (var seed in Hosts)
        {
            await SeedHostAsync(userManager, db, dniProtector, seed);
        }
    }

    private static async Task SeedStudentAsync(
        UserManager<ApplicationUser> userManager,
        ApplicationDbContext db,
        IDataProtector dniProtector,
        StudentSeed seed)
    {
        var existing = await userManager.FindByEmailAsync(seed.Email);
        if (existing is not null) return;

        var user = new ApplicationUser
        {
            UserName = seed.Email,
            Email = seed.Email,
            Name = seed.FullName,
            Role = UserRole.Student,
            EmailConfirmed = true,
            Generation = seed.Generation,
        };

        var result = await userManager.CreateAsync(user, DemoPassword);
        if (!result.Succeeded) return;

        var profile = new StudentProfile
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            EncryptedDni = dniProtector.Protect(seed.Dni),
            PersonalData = new StudentPersonalData
            {
                FullName = seed.FullName,
                BirthDate = seed.BirthDate,
                Gender = seed.Gender,
                Nationality = "Argentina",
                ContactEmail = seed.Email,
                ContactPhone = "3511234567",
                EmergencyContactName = "Contacto de emergencia",
                EmergencyContactRelationship = "Familiar",
                EmergencyContactPhone = "3511234568",
            },
            TravelReason = new StudentTravelReason
            {
                Reason = "estudios",
                StudyDetails = seed.StudyDetails,
                StayDuration = seed.StayDuration,
                AvailableFrom = seed.AvailableFrom,
            },
            LocationPreferences = new StudentLocationPreferences
            {
                PreferredNeighborhoods = seed.PreferredNeighborhoods,
                ProximityNeeds = "Cerca de la facultad",
            },
            EconomicSituation = new StudentEconomicSituation
            {
                CanPayMonthlyContribution = "si",
                ContributionRangeArs = seed.ContributionRangeArs,
            },
            ExchangesOffered = new StudentExchangesOffered
            {
                Offerings = new List<string> { "acompañamiento", "tareas-hogar" },
            },
            Habits = new StudentHabits(),
            Health = new StudentHealth(),
            HostPreferences = new StudentHostPreferences
            {
                PreferredGeneration = seed.PreferredHostGeneration,
            },
            PersonalPresentation = new StudentPersonalPresentation
            {
                Motivation = "Busco un hogar con buena onda y compañía.",
                AboutMe = seed.AboutMe,
            },
            PreferredHostGeneration = seed.PreferredHostGeneration,
            PreferredNeighborhoods = seed.PreferredNeighborhoods,
            ContributionRangeArs = seed.ContributionRangeArs,
            StayDuration = seed.StayDuration,
            AvailableFrom = DateOnly.TryParse(seed.AvailableFrom, out var availableFrom) ? availableFrom : null,
        };

        db.StudentProfiles.Add(profile);
        await db.SaveChangesAsync();
    }

    private static async Task SeedHostAsync(
        UserManager<ApplicationUser> userManager,
        ApplicationDbContext db,
        IDataProtector dniProtector,
        HostSeed seed)
    {
        var existing = await userManager.FindByEmailAsync(seed.Email);
        if (existing is not null) return;

        var user = new ApplicationUser
        {
            UserName = seed.Email,
            Email = seed.Email,
            Name = seed.FullName,
            Role = UserRole.Host,
            EmailConfirmed = true,
            Generation = seed.Generation,
        };

        var result = await userManager.CreateAsync(user, DemoPassword);
        if (!result.Succeeded) return;

        var profile = new HostProfile
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            EncryptedDni = dniProtector.Protect(seed.Dni),
            PersonalData = new HostPersonalData
            {
                FullName = seed.FullName,
                BirthDate = seed.BirthDate,
                Gender = seed.Gender,
                ContactEmail = seed.Email,
                ContactPhone = "3511234567",
                FamilyReferenceName = "Referente familiar",
                FamilyReferenceRelationship = "Hijo/a",
                FamilyReferencePhone = "3511234568",
            },
            WorkSituation = new HostWorkSituation { LivesAlone = "si" },
            HousingData = new HostHousingData
            {
                FullAddress = $"{seed.Neighborhood}, Córdoba",
                Neighborhood = seed.Neighborhood,
                HousingType = seed.HousingType,
                TotalBedrooms = seed.AvailableRooms + 1,
                AvailableRooms = seed.AvailableRooms,
                Amenities = new List<string> { "wifi", "lavarropas" },
            },
            ExchangesExpected = new HostExchangesExpected
            {
                ExpectsMonthlyContribution = "si",
                ExpectedAmountRangeArs = seed.ExpectedAmountRangeArs,
            },
            Health = new HostHealth(),
            Habits = new HostHabits(),
            TenantPreferences = new HostTenantPreferences
            {
                PreferredGeneration = seed.PreferredTenantGeneration,
            },
            PersonalPresentation = new HostPersonalPresentation
            {
                Motivation = "Quiero compartir mi casa y aprender de otra generación.",
                AboutMe = seed.AboutMe,
            },
            PreferredTenantGeneration = seed.PreferredTenantGeneration,
            Neighborhood = seed.Neighborhood,
            ExpectedAmountRangeArs = seed.ExpectedAmountRangeArs,
            AvailableRooms = seed.AvailableRooms,
            HousingType = seed.HousingType,
        };

        db.HostProfiles.Add(profile);
        await db.SaveChangesAsync();
    }

    private record StudentSeed(
        string Email, string FullName, string Dni, string BirthDate, string Gender,
        string StudyDetails, string StayDuration, string AvailableFrom,
        List<string> PreferredNeighborhoods, string ContributionRangeArs,
        string PreferredHostGeneration, string AboutMe, Generation Generation);

    private record HostSeed(
        string Email, string FullName, string Dni, string BirthDate, string Gender,
        string Neighborhood, string HousingType, int AvailableRooms,
        string ExpectedAmountRangeArs, string PreferredTenantGeneration,
        string AboutMe, Generation Generation);

    private static readonly List<StudentSeed> Students = new()
    {
        new("mia.estudiante@demo.com", "Mía Fernández", "30111222", "2003-04-12", "femenino",
            "Ingeniería en Sistemas, UNC", "mas-1-anio", "2026-08-01",
            new() { "Nueva Córdoba", "Alberdi" }, "80000-120000",
            "adulto-mayor", "Estudiante tranquila, busco un hogar con calidez.", Generation.JovenAdulto),
        new("juan.estudiante@demo.com", "Juan Pérez", "30222333", "2002-11-03", "masculino",
            "Abogacía, UNC", "hasta-1-anio", "2026-08-15",
            new() { "Cerro de las Rosas" }, "70000-100000",
            "indiferente", "Me gusta cocinar y compartir charlas.", Generation.JovenAdulto),
        new("sofia.estudiante@demo.com", "Sofía Gómez", "30333444", "2004-02-20", "femenino",
            "Diseño Gráfico, UBP", "4-6-meses", "2026-09-01",
            new() { "Güemes", "Nueva Córdoba" }, "60000-90000",
            "adulto-mayor", "Busco intercambio genuino, no solo alquiler.", Generation.JovenAdulto),
    };

    private static readonly List<HostSeed> Hosts = new()
    {
        new("rosa.anfitriona@demo.com", "Rosa Martínez", "20111222", "1958-06-15", "femenino",
            "Nueva Córdoba", "departamento", 1,
            "80000-100000", "indiferente",
            "Vivo sola hace años, me encantaría tener compañía joven en casa.", Generation.AdultoMayor),
        new("carlos.anfitrion@demo.com", "Carlos Díaz", "20222333", "1955-09-22", "masculino",
            "Alberdi", "casa", 2,
            "70000-90000", "indiferente",
            "Tengo una casa grande y me gustaría compartirla.", Generation.AdultoMayor),
        new("elena.anfitriona@demo.com", "Elena Ruiz", "20333444", "1962-01-30", "femenino",
            "Cerro de las Rosas", "casa", 1,
            "90000-120000", "joven-adulto",
            "Busco alguien responsable para compartir mi hogar.", Generation.AdultoMayor),
    };
}