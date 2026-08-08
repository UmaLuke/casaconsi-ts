using CasaConSi.Api.Models;
using CasaConSi.Api.Models.Enums;
using CasaConSi.Api.Models.Profiles;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using CasaConSi.Api.Data;

namespace CasaConSi.Api.Data;

// Perfiles de prueba (estudiantes + anfitriones) para poder armar y probar la
// UI de Match's/Mensajes con datos reales antes de que exista el módulo Match.
// SOLO corre en Development (ver Program.cs) y es idempotente: si el email ya
// existe, lo salta. Password fija de test: cumple la política (8+, mayúscula,
// minúscula, dígito, no alfanumérico).
//
// Todas las 9 secciones del cuestionario de Student y las 8 de Host están
// completas acá (antes Habits/Health quedaban con los defaults del modelo,
// vacíos) — sirve para poder ver el cuestionario ya completado end-to-end
// en el frontend, y para tener perfiles "ricos" al swipear en DiscoverPage.
// Los valores de cada campo `select`/`multiselect` respetan las opciones
// definidas en frontend/src/data/studentQuestionnaireSchema.ts y
// hostQuestionnaireSchema.ts (antes `ExchangesOffered.Offerings` tenía
// valores que no existían en ese schema — "acompañamiento"/"tareas-hogar" en
// vez de "compania-actividades"/"tareas-domesticas" — quedó corregido).
public static class DemoProfileSeeder
{
    private const string DemoPassword = "Demo1234!";

    public static async Task SeedAsync(IServiceProvider services)
    {
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var db = services.GetRequiredService<ApplicationDbContext>();
        var dataProtectionProvider = services.GetRequiredService<IDataProtectionProvider>();
        var environment = services.GetRequiredService<IWebHostEnvironment>();
        // Mismo purpose string que ProfileService — así ProfileService puede
        // desencriptar el DNI de estos perfiles sin problema.
        var dniProtector = dataProtectionProvider.CreateProtector("CasaConSi.Profile.Dni");

        foreach (var seed in Students)
        {
            await SeedStudentAsync(userManager, db, dniProtector, environment, seed);
        }

        foreach (var seed in Hosts)
        {
            await SeedHostAsync(userManager, db, dniProtector, environment, seed);
        }
    }

    // Copia una foto de perfil de prueba (Data/DemoAssets/*.jpg, versionada en
    // el repo) a wwwroot/uploads/profiles/{userId}/ — mismo destino y misma
    // convención de ruta relativa que un upload real vía
    // ProfileService.SaveStudentPhotosAsync (FileStorageService.SaveAsync con
    // subfolder $"profiles/{userId}"). No usa IFormFile porque no hay un
    // request HTTP real acá, así que no se puede reusar FileStorageService tal
    // cual — se copia el archivo directo a disco con la misma convención.
    // Devuelve null (perfil sin foto) si el asset no está o falla la copia,
    // en vez de tirar abajo el seeder entero.
    private static string? CopyDemoProfilePhoto(IWebHostEnvironment environment, string userId, string sourceFileName)
    {
        try
        {
            var sourcePath = Path.Combine(environment.ContentRootPath, "Data", "DemoAssets", sourceFileName);
            if (!File.Exists(sourcePath)) return null;

            var webRoot = environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot");
            var targetDirectory = Path.Combine(webRoot, "uploads", "profiles", userId);
            Directory.CreateDirectory(targetDirectory);

            var targetPath = Path.Combine(targetDirectory, sourceFileName);
            File.Copy(sourcePath, targetPath, overwrite: true);

            return $"profiles/{userId}/{sourceFileName}";
        }
        catch (IOException)
        {
            return null;
        }
    }

    // Completa los ítems 1..N en el orden fijo del docx "Verificación de Perfil"
    // (mismo orden que TrustService.BuildResponse). Si el tier es Freemium, cap
    // en 6 aunque pidas más — los ítems 7-10 son exclusivos de Premium.
    private static void ApplyTrustScore(ProfileVerification verification, int targetScore, MembershipTier tier)
        {
            var maxAllowed = tier == MembershipTier.Premium ? 10 : 6;
            var score = Math.Clamp(targetScore, 0, maxAllowed);

            verification.IdentityVerified = score >= 1;
            verification.ContactVerified = score >= 2;
            verification.SocialMediaVerified = score >= 3;
            verification.CreditStatusVerified = score >= 4;
            verification.ProofOfStatusVerified = score >= 5;
            verification.SwornDeclarationAccepted = score >= 6;
            verification.PersonalReferencesVerified = score >= 7;
            verification.VirtualInterviewCompleted = score >= 8;
            verification.CriminalRecordVerified = score >= 9;
            verification.CohabitationHistoryVerified = score >= 10;
        }
    private static async Task SeedStudentAsync(
        UserManager<ApplicationUser> userManager,
        ApplicationDbContext db,
        IDataProtector dniProtector,
        IWebHostEnvironment environment,
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
            IsDemoUser = true,
            MembershipTier = seed.MembershipTier,
        };

        var result = await userManager.CreateAsync(user, DemoPassword);
        if (!result.Succeeded) return;

        var profilePhotoPath = CopyDemoProfilePhoto(environment, user.Id, seed.ProfilePhotoFileName);
        if (profilePhotoPath is not null)
        {
            user.Avatar = $"/uploads/{profilePhotoPath}";
            await userManager.UpdateAsync(user);
        }

        var profile = new StudentProfile
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            EncryptedDni = dniProtector.Protect(seed.Dni),
            ProfilePhotoPath = profilePhotoPath,
            PersonalData = new StudentPersonalData
            {
                FullName = seed.FullName,
                BirthDate = seed.BirthDate,
                Gender = seed.Gender,
                Nationality = "Argentina",
                ContactEmail = seed.Email,
                ContactPhone = seed.ContactPhone,
                EmergencyContactName = seed.EmergencyContactName,
                EmergencyContactRelationship = seed.EmergencyContactRelationship,
                EmergencyContactPhone = seed.EmergencyContactPhone,
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
                ExcludedNeighborhoods = seed.ExcludedNeighborhoods,
                ProximityNeeds = seed.ProximityNeeds,
            },
            EconomicSituation = new StudentEconomicSituation
            {
                MonthlyIncomeRange = seed.MonthlyIncomeRange,
                IncomeSources = seed.IncomeSources,
                CanPayMonthlyContribution = "si",
                ContributionRangeArs = seed.ContributionRangeArs,
            },
            ExchangesOffered = new StudentExchangesOffered
            {
                Offerings = seed.Offerings,
            },
            Habits = new StudentHabits
            {
                Smokes = seed.Smokes,
                HasPets = seed.HasPets,
                PetsDetail = seed.PetsDetail,
                HasChildrenAtHome = "no",
                UsualScheduleOut = seed.UsualScheduleOut,
                UsualScheduleBack = seed.UsualScheduleBack,
                VisitFrequency = seed.VisitFrequency,
                WeekendAbsenceFrequency = seed.WeekendAbsenceFrequency,
                MealPreference = seed.MealPreference,
                CooksRegularly = seed.CooksRegularly,
                CleanlinessExpectation = seed.CleanlinessExpectation,
                RelevantAllergies = seed.RelevantAllergies,
            },
            Health = new StudentHealth
            {
                RelevantHealthCondition = seed.RelevantHealthCondition,
                NeedsDailySupport = "no",
                HealthCoverage = seed.HealthCoverage,
            },
            HostPreferences = new StudentHostPreferences
            {
                PreferredGeneration = seed.PreferredHostGeneration,
                PreferredHostGender = seed.PreferredHostGender,
                AcceptsCoupleHost = seed.AcceptsCoupleHost,
                BotherIfHostSmokes = seed.BotherIfHostSmokes,
                AcceptsPetsAtHome = seed.AcceptsPetsAtHome,
                AcceptsHostChildren = "si",
                OtherResidentsCount = seed.OtherResidentsCount,
                DealBreakers = seed.DealBreakers,
            },
            PersonalPresentation = new StudentPersonalPresentation
            {
                Motivation = seed.Motivation,
                AboutMe = seed.AboutMe,
            },
            PreferredHostGeneration = seed.PreferredHostGeneration,
            PreferredNeighborhoods = seed.PreferredNeighborhoods,
            ContributionRangeArs = seed.ContributionRangeArs,
            StayDuration = seed.StayDuration,
            AvailableFrom = DateOnly.TryParse(seed.AvailableFrom, out var availableFrom) ? availableFrom : null,
        };

    
        var verification = new ProfileVerification { Id = Guid.NewGuid(), UserId = user.Id };
        ApplyTrustScore(verification, seed.TrustScore, seed.MembershipTier);

        db.StudentProfiles.Add(profile);
        db.ProfileVerifications.Add(verification);
        await db.SaveChangesAsync();
    }

    private static async Task SeedHostAsync(
        UserManager<ApplicationUser> userManager,
        ApplicationDbContext db,
        IDataProtector dniProtector,
        IWebHostEnvironment environment,
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
            IsDemoUser = true,
            MembershipTier = seed.MembershipTier,
        };

        var result = await userManager.CreateAsync(user, DemoPassword);
        if (!result.Succeeded) return;

        var profilePhotoPath = CopyDemoProfilePhoto(environment, user.Id, seed.ProfilePhotoFileName);
        if (profilePhotoPath is not null)
        {
            user.Avatar = $"/uploads/{profilePhotoPath}";
            await userManager.UpdateAsync(user);
        }
        
        var homePhotoPaths = seed.HomePhotoFileNames
            .Select(fileName => CopyDemoProfilePhoto(environment, user.Id, fileName))
            .Where(path => path is not null)
            .Select(path => path!)
            .ToList();

        var profile = new HostProfile
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            EncryptedDni = dniProtector.Protect(seed.Dni),
            ProfilePhotoPath = profilePhotoPath,
            HomePhotoPaths = homePhotoPaths,
            PersonalData = new HostPersonalData
            {
                FullName = seed.FullName,
                BirthDate = seed.BirthDate,
                Gender = seed.Gender,
                MaritalStatus = seed.MaritalStatus,
                ContactEmail = seed.Email,
                ContactPhone = seed.ContactPhone,
                FamilyReferenceName = seed.FamilyReferenceName,
                FamilyReferenceRelationship = seed.FamilyReferenceRelationship,
                FamilyReferencePhone = seed.FamilyReferencePhone,
            },
            WorkSituation = new HostWorkSituation
            {
                WorkStatus = "jubilado",
                ProfessionOrEducation = seed.ProfessionOrEducation,
                LivesAlone = seed.LivesAlone,
                OtherResidents = seed.OtherResidents,
            },
            HousingData = new HostHousingData
            {
                FullAddress = $"{seed.Neighborhood}, Córdoba",
                Neighborhood = seed.Neighborhood,
                HousingType = seed.HousingType,
                TotalBedrooms = seed.AvailableRooms + 1,
                AvailableRooms = seed.AvailableRooms,
                Amenities = new List<string> { "internet", "agua-caliente", "lavadora" },
                HasPrivateBathroom = seed.HasPrivateBathroom,
                Accessibility = seed.Accessibility,
                PublicTransportDistance = seed.PublicTransportDistance,
            },
            ExchangesExpected = new HostExchangesExpected
            {
                ExpectsMonthlyContribution = "si",
                ExpectedAmountRangeArs = seed.ExpectedAmountRangeArs,
                OtherExchanges = seed.OtherExchanges,
            },
            Health = new HostHealth
            {
                CurrentHealthStatus = seed.CurrentHealthStatus,
                RelevantHealthCondition = seed.RelevantHealthCondition,
                TakesScheduledMedication = seed.TakesScheduledMedication,
                HasCurrentHelp = "no",
            },
            Habits = new HostHabits
            {
                SmokesAtHome = "no",
                HasPets = seed.HasPets,
                PetsDetail = seed.PetsDetail,
                HasMinorChildrenAtHome = "no",
                FreeTimeActivities = seed.FreeTimeActivities,
                BelongsToAssociation = seed.BelongsToAssociation,
                VisitFrequency = seed.VisitFrequency,
                MealPreference = seed.MealPreference,
                CleanlinessExpectation = seed.CleanlinessExpectation,
            },
            TenantPreferences = new HostTenantPreferences
            {
                PreferredGeneration = seed.PreferredTenantGeneration,
                PreferredTenantGender = "indiferente",
                AcceptsOtherNationality = seed.AcceptsOtherNationality,
                TenantCanStayAloneIfHostAway = "si",
                TenantCanReceiveVisits = seed.TenantCanReceiveVisits,
                AcceptsTenantSmoking = "no",
                AcceptsTenantPets = seed.AcceptsTenantPets,
                AcceptsTenantChildrenVisiting = "si",
                NightCurfew = seed.NightCurfew,
                DealBreakers = seed.DealBreakers,
            },
            PersonalPresentation = new HostPersonalPresentation
            {
                Motivation = seed.Motivation,
                AboutMe = seed.AboutMe,
            },
            PreferredTenantGeneration = seed.PreferredTenantGeneration,
            Neighborhood = seed.Neighborhood,
            ExpectedAmountRangeArs = seed.ExpectedAmountRangeArs,
            AvailableRooms = seed.AvailableRooms,
            HousingType = seed.HousingType,
        };

        var verification = new ProfileVerification { Id = Guid.NewGuid(), UserId = user.Id };
        ApplyTrustScore(verification, seed.TrustScore, seed.MembershipTier);

        db.HostProfiles.Add(profile);
        db.ProfileVerifications.Add(verification);
        await db.SaveChangesAsync();
    }

    private record StudentSeed
    {
        public required string Email { get; init; }
        public required string FullName { get; init; }
        public required string Dni { get; init; }
        public required string BirthDate { get; init; }
        public required string Gender { get; init; }
        public required Generation Generation { get; init; }
        public MembershipTier MembershipTier { get; init; } = MembershipTier.Freemium;
        public int TrustScore { get; init; } = 6; // 0..10, ver ApplyTrustScore
        public required string ProfilePhotoFileName { get; init; }
        public string ContactPhone { get; init; } = "3511234567";
        public string EmergencyContactName { get; init; } = "Contacto de emergencia";
        public string EmergencyContactRelationship { get; init; } = "Familiar";
        public string EmergencyContactPhone { get; init; } = "3511234568";

        public required string StudyDetails { get; init; }
        public required string StayDuration { get; init; }
        public required string AvailableFrom { get; init; }

        public required List<string> PreferredNeighborhoods { get; init; }
        public List<string> ExcludedNeighborhoods { get; init; } = new();
        public required string ProximityNeeds { get; init; }

        public required string MonthlyIncomeRange { get; init; }
        public required List<string> IncomeSources { get; init; }
        public required string ContributionRangeArs { get; init; }

        public required List<string> Offerings { get; init; }

        public string Smokes { get; init; } = "no";
        public string HasPets { get; init; } = "no";
        public string PetsDetail { get; init; } = string.Empty;
        public required string UsualScheduleOut { get; init; }
        public required string UsualScheduleBack { get; init; }
        public required string VisitFrequency { get; init; }
        public required string WeekendAbsenceFrequency { get; init; }
        public required string MealPreference { get; init; }
        public string CooksRegularly { get; init; } = "si";
        public required int CleanlinessExpectation { get; init; }
        public string RelevantAllergies { get; init; } = string.Empty;

        public string RelevantHealthCondition { get; init; } = string.Empty;
        public required string HealthCoverage { get; init; }

        public required string PreferredHostGeneration { get; init; }
        public required string PreferredHostGender { get; init; }
        public required string AcceptsCoupleHost { get; init; }
        public required string BotherIfHostSmokes { get; init; }
        public required string AcceptsPetsAtHome { get; init; }
        public int OtherResidentsCount { get; init; }
        public required string DealBreakers { get; init; }

        public required string Motivation { get; init; }
        public required string AboutMe { get; init; }
    }

    private record HostSeed
    {
        public required string Email { get; init; }
        public required string FullName { get; init; }
        public required string Dni { get; init; }
        public required string BirthDate { get; init; }
        public required string Gender { get; init; }
        public required string MaritalStatus { get; init; }
        public required Generation Generation { get; init; }
        public MembershipTier MembershipTier { get; init; } = MembershipTier.Freemium;
        public int TrustScore { get; init; } = 6; // 0..10, ver ApplyTrustScore
        // Fotos: mismo mecanismo que StudentSeed.ProfilePhotoFileName — se
        // copian desde Data/DemoAssets/ a wwwroot/uploads/profiles/{userId}/
        // vía CopyDemoProfilePhoto. HomePhotoFileNames son placeholders
        // genéricos compartidos entre los 3 hosts demo (no hay fotos reales
        // de cada casa) — reemplazar por fotos reales cuando existan, sin
        // tocar código: solo pisar los .jpg en Data/DemoAssets con el mismo
        // nombre de archivo.
        public required string ProfilePhotoFileName { get; init; }
        public List<string> HomePhotoFileNames { get; init; } = new();
        public string ContactPhone { get; init; } = "3511234567";
        public required string FamilyReferenceName { get; init; }
        public string FamilyReferenceRelationship { get; init; } = "Hijo/a";
        public string FamilyReferencePhone { get; init; } = "3511234568";

        public required string ProfessionOrEducation { get; init; }
        public string LivesAlone { get; init; } = "si";
        public string OtherResidents { get; init; } = string.Empty;

        public required string Neighborhood { get; init; }
        public required string HousingType { get; init; }
        public required int AvailableRooms { get; init; }
        public required string HasPrivateBathroom { get; init; }
        public required List<string> Accessibility { get; init; }
        public required string PublicTransportDistance { get; init; }

        public required string ExpectedAmountRangeArs { get; init; }
        public required List<string> OtherExchanges { get; init; }

        public required int CurrentHealthStatus { get; init; }
        public string RelevantHealthCondition { get; init; } = string.Empty;
        public string TakesScheduledMedication { get; init; } = "no";

        public string HasPets { get; init; } = "no";
        public string PetsDetail { get; init; } = string.Empty;
        public required string FreeTimeActivities { get; init; }
        public string BelongsToAssociation { get; init; } = string.Empty;
        public required string VisitFrequency { get; init; }
        public required string MealPreference { get; init; }
        public required int CleanlinessExpectation { get; init; }

        public required string PreferredTenantGeneration { get; init; }
        public string AcceptsOtherNationality { get; init; } = "depende";
        public required string TenantCanReceiveVisits { get; init; }
        public string AcceptsTenantPets { get; init; } = "no";
        public required string NightCurfew { get; init; }
        public required string DealBreakers { get; init; }

        public required string Motivation { get; init; }
        public required string AboutMe { get; init; }
    }

    private static readonly List<StudentSeed> Students = new()
    {
        new StudentSeed
        {
            Email = "mia.estudiante@demo.com",
            FullName = "Mía Fernández",
            Dni = "30111222",
            BirthDate = "2003-04-12",
            Gender = "femenino",
            Generation = Generation.JovenAdulto,
            MembershipTier = MembershipTier.Freemium, TrustScore = 4,
            ProfilePhotoFileName = "mia-fernandez.jpg",
            EmergencyContactName = "Marta Fernández",
            EmergencyContactRelationship = "Madre",
            StudyDetails = "Ingeniería en Sistemas, UNC — 3er año, cursado por la mañana",
            StayDuration = "mas-1-anio",
            AvailableFrom = "2026-08-01",
            PreferredNeighborhoods = new() { "Nueva Córdoba", "Alberdi" },
            ExcludedNeighborhoods = new() { "Centro" },
            ProximityNeeds = "Cerca del campus de Ciudad Universitaria",
            MonthlyIncomeRange = "150000-300000",
            IncomeSources = new() { "beca", "familia" },
            ContributionRangeArs = "80000-120000",
            Offerings = new() { "tareas-domesticas", "asistencia-tecnologica" },
            Smokes = "no",
            HasPets = "no",
            UsualScheduleOut = "8:00",
            UsualScheduleBack = "19:00",
            VisitFrequency = "ocasional",
            WeekendAbsenceFrequency = "A veces viaja a visitar a la familia",
            MealPreference = "con-anfitrion",
            CleanlinessExpectation = 8,
            RelevantAllergies = "Alergia leve al polen",
            HealthCoverage = "obra-social",
            PreferredHostGeneration = "adulto-mayor",
            PreferredHostGender = "indiferente",
            AcceptsCoupleHost = "si",
            BotherIfHostSmokes = "depende",
            AcceptsPetsAtHome = "si",
            OtherResidentsCount = 0,
            DealBreakers = "Que no se respeten los horarios de descanso",
            Motivation = "Quiero vivir una experiencia de convivencia real, no solo alquilar una habitación.",
            AboutMe = "Estudiante tranquila, busco un hogar con calidez.",
            
        },
        new StudentSeed
        {
            Email = "juan.estudiante@demo.com",
            FullName = "Juan Pérez",
            Dni = "30222333",
            BirthDate = "2002-11-03",
            Gender = "masculino",
            Generation = Generation.JovenAdulto,
            MembershipTier = MembershipTier.Freemium, TrustScore = 6,
            ProfilePhotoFileName = "juan-perez.jpg",
            EmergencyContactName = "Roberto Pérez",
            EmergencyContactRelationship = "Padre",
            StudyDetails = "Abogacía, UNC — 4to año, cursado por la tarde",
            StayDuration = "hasta-1-anio",
            AvailableFrom = "2026-08-15",
            PreferredNeighborhoods = new() { "Cerro de las Rosas" },
            ExcludedNeighborhoods = new(),
            ProximityNeeds = "Cerca de Tribunales y la Ciudad Universitaria",
            MonthlyIncomeRange = "menos-150000",
            IncomeSources = new() { "trabajo", "familia" },
            ContributionRangeArs = "70000-100000",
            Offerings = new() { "oficios-mantenimiento", "clases-mentorias" },
            Smokes = "no",
            HasPets = "si",
            PetsDetail = "Un gato pequeño, muy tranquilo",
            UsualScheduleOut = "9:00",
            UsualScheduleBack = "21:00",
            VisitFrequency = "ocasional",
            WeekendAbsenceFrequency = "Casi nunca se ausenta",
            MealPreference = "indistinto",
            CleanlinessExpectation = 7,
            HealthCoverage = "prepaga",
            PreferredHostGeneration = "indiferente",
            PreferredHostGender = "indiferente",
            AcceptsCoupleHost = "si",
            BotherIfHostSmokes = "no",
            AcceptsPetsAtHome = "si",
            OtherResidentsCount = 1,
            DealBreakers = "Ruido excesivo por las noches",
            Motivation = "Me interesa el intercambio intergeneracional y ayudar con tareas del hogar.",
            AboutMe = "Me gusta cocinar y compartir charlas.",
            
        },
        new StudentSeed
        {
            Email = "sofia.estudiante@demo.com",
            FullName = "Sofía Gómez",
            Dni = "30333444",
            BirthDate = "2004-02-20",
            Gender = "femenino",
            Generation = Generation.JovenAdulto,
            MembershipTier = MembershipTier.Freemium, TrustScore = 9,
            ProfilePhotoFileName = "sofia-gomez.jpg",
            EmergencyContactName = "Laura Gómez",
            EmergencyContactRelationship = "Madre",
            StudyDetails = "Diseño Gráfico, UBP — 2do año, cursado full-time",
            StayDuration = "4-6-meses",
            AvailableFrom = "2026-09-01",
            PreferredNeighborhoods = new() { "Güemes", "Nueva Córdoba" },
            ExcludedNeighborhoods = new() { "Alta Córdoba" },
            ProximityNeeds = "Cerca de la sede de la UBP en Nueva Córdoba",
            MonthlyIncomeRange = "150000-300000",
            IncomeSources = new() { "familia", "ahorros" },
            ContributionRangeArs = "60000-90000",
            Offerings = new() { "compania-actividades", "asistencia-tecnologica" },
            Smokes = "no",
            HasPets = "no",
            UsualScheduleOut = "10:00",
            UsualScheduleBack = "18:00",
            VisitFrequency = "nunca",
            WeekendAbsenceFrequency = "Viaja algunos fines de semana",
            MealPreference = "con-anfitrion",
            CooksRegularly = "no",
            CleanlinessExpectation = 9,
            RelevantAllergies = "Alergia a los mariscos",
            HealthCoverage = "sin-cobertura",
            PreferredHostGeneration = "adulto-mayor",
            PreferredHostGender = "femenino",
            AcceptsCoupleHost = "no",
            BotherIfHostSmokes = "depende",
            AcceptsPetsAtHome = "depende",
            OtherResidentsCount = 0,
            DealBreakers = "Falta de respeto a los espacios personales",
            Motivation = "Busco un ambiente tranquilo y cálido para completar mis estudios.",
            AboutMe = "Busco intercambio genuino, no solo alquiler.",
        },
    };

    private static readonly List<HostSeed> Hosts = new()
    {
        new HostSeed
        {
            Email = "rosa.anfitriona@demo.com",
            FullName = "Rosa Martínez",
            Dni = "20111222",
            BirthDate = "1958-06-15",
            Gender = "femenino",
            MaritalStatus = "viudo",
            Generation = Generation.AdultoMayor,
            MembershipTier = MembershipTier.Premium, TrustScore = 10,
            ProfilePhotoFileName = "rosa-martinez.jpg",
            HomePhotoFileNames = new() { "casa-living.jpg", "casa-cocina.jpg", "casa-bano.jpg", "casa-habitacion.jpg" },
            FamilyReferenceName = "Ana Martínez",
            FamilyReferenceRelationship = "Hija",
            ProfessionOrEducation = "Jubilada, ex docente de escuela primaria",
            LivesAlone = "si",
            Neighborhood = "Nueva Córdoba",
            HousingType = "departamento",
            AvailableRooms = 1,
            HasPrivateBathroom = "no",
            Accessibility = new() { "ninguna" },
            PublicTransportDistance = "A 2 cuadras de una parada de colectivo",
            ExpectedAmountRangeArs = "80000-100000",
            OtherExchanges = new() { "compania-actividades", "tareas-domesticas" },
            CurrentHealthStatus = 8,
            RelevantHealthCondition = "Hipertensión controlada",
            TakesScheduledMedication = "si",
            HasPets = "si",
            PetsDetail = "Una perra pequeña muy tranquila",
            FreeTimeActivities = "Tejer, leer y salir a caminar por el parque",
            BelongsToAssociation = "Centro de jubilados del barrio",
            VisitFrequency = "Algunas veces al mes",
            MealPreference = "con-locatario",
            CleanlinessExpectation = 8,
            PreferredTenantGeneration = "indiferente",
            AcceptsOtherNationality = "si",
            TenantCanReceiveVisits = "con-condiciones",
            AcceptsTenantPets = "no",
            NightCurfew = "Sin límite, solo pide avisar",
            DealBreakers = "Desorden constante en espacios comunes",
            Motivation = "Vivo sola hace años y quiero compartir mi casa con alguien joven y de confianza.",
            AboutMe = "Vivo sola hace años, me encantaría tener compañía joven en casa.",
            
        },
        new HostSeed
        {
            Email = "carlos.anfitrion@demo.com",
            FullName = "Carlos Díaz",
            Dni = "20222333",
            BirthDate = "1955-09-22",
            Gender = "masculino",
            MaritalStatus = "casado",
            Generation = Generation.AdultoMayor,
            MembershipTier = MembershipTier.Freemium, TrustScore = 2,
            ProfilePhotoFileName = "carlos-diaz.jpg",
            HomePhotoFileNames = new() { "casa-living.jpg", "casa-cocina.jpg", "casa-bano.jpg", "casa-habitacion.jpg" },
            FamilyReferenceName = "Marcelo Díaz",
            FamilyReferenceRelationship = "Hijo",
            ProfessionOrEducation = "Jubilado, ex empleado bancario",
            LivesAlone = "no",
            OtherResidents = "Vive con su esposa",
            Neighborhood = "Alberdi",
            HousingType = "casa",
            AvailableRooms = 2,
            HasPrivateBathroom = "si",
            Accessibility = new() { "rampa" },
            PublicTransportDistance = "A 5 cuadras de la estación de ómnibus",
            ExpectedAmountRangeArs = "70000-90000",
            OtherExchanges = new() { "oficios-mantenimiento", "tramites-gestiones" },
            CurrentHealthStatus = 7,
            TakesScheduledMedication = "no",
            HasPets = "no",
            FreeTimeActivities = "Jardinería y partidos de fútbol con amigos",
            VisitFrequency = "Casi todos los fines de semana",
            MealPreference = "indistinto",
            CleanlinessExpectation = 6,
            PreferredTenantGeneration = "indiferente",
            AcceptsOtherNationality = "depende",
            TenantCanReceiveVisits = "si",
            AcceptsTenantPets = "no",
            NightCurfew = "23:00 entre semana",
            DealBreakers = "Fiestas o reuniones sin avisar",
            Motivation = "Tengo una casa grande y disfruto compartirla, sobre todo con gente joven con ganas de aprender.",
            AboutMe = "Tengo una casa grande y me gustaría compartirla.",
            
        },
        new HostSeed
        {
            Email = "elena.anfitriona@demo.com",
            FullName = "Elena Ruiz",
            Dni = "20333444",
            BirthDate = "1962-01-30",
            Gender = "femenino",
            MaritalStatus = "divorciado",
            Generation = Generation.AdultoMayor,
            MembershipTier = MembershipTier.Freemium, TrustScore = 8,
            ProfilePhotoFileName = "elena-ruiz.jpg",
            HomePhotoFileNames = new() { "casa-living.jpg", "casa-cocina.jpg", "casa-bano.jpg", "casa-habitacion.jpg" },
            FamilyReferenceName = "Pablo Ruiz",
            FamilyReferenceRelationship = "Hijo",
            ProfessionOrEducation = "Jubilada, ex profesora universitaria",
            LivesAlone = "si",
            Neighborhood = "Cerro de las Rosas",
            HousingType = "casa",
            AvailableRooms = 1,
            HasPrivateBathroom = "no",
            Accessibility = new() { "ninguna" },
            PublicTransportDistance = "A 10 cuadras de la parada más cercana",
            ExpectedAmountRangeArs = "90000-120000",
            OtherExchanges = new() { "clases-mentorias", "compania-actividades" },
            CurrentHealthStatus = 9,
            TakesScheduledMedication = "no",
            HasPets = "no",
            FreeTimeActivities = "Pintura, yoga y jardín",
            BelongsToAssociation = "Grupo de lectura del barrio",
            VisitFrequency = "Rara vez",
            MealPreference = "con-locatario",
            CleanlinessExpectation = 9,
            PreferredTenantGeneration = "adulto-joven",
            AcceptsOtherNationality = "si",
            TenantCanReceiveVisits = "si",
            AcceptsTenantPets = "no",
            NightCurfew = "Sin restricciones",
            DealBreakers = "Falta de comunicación",
            Motivation = "Busco compañía enriquecedora y la posibilidad de aprender cosas nuevas de otra generación.",
            AboutMe = "Busco alguien responsable para compartir mi hogar.",

        },
    };
}
