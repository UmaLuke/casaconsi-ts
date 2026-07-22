using CasaConSi.Api.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace CasaConSi.Api.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<StudentProfile> StudentProfiles => Set<StudentProfile>();
    public DbSet<HostProfile> HostProfiles => Set<HostProfile>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Perfiles del cuestionario post-registro (1:1 con ApplicationUser).
        // Cada sección se guarda como columna jsonb vía .ToJson() — ver el
        // modelo de datos híbrido acordado en el plan (secciones tipadas en
        // jsonb + un puñado de columnas promovidas, indexadas, para lo que el
        // futuro Match module va a necesitar filtrar).
        builder.Entity<StudentProfile>(entity =>
        {
            entity.HasIndex(p => p.UserId).IsUnique();
            entity.HasOne(p => p.User)
                .WithOne()
                .HasForeignKey<StudentProfile>(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.OwnsOne(p => p.PersonalData, o => o.ToJson());
            entity.OwnsOne(p => p.TravelReason, o => o.ToJson());
            entity.OwnsOne(p => p.LocationPreferences, o => o.ToJson());
            entity.OwnsOne(p => p.EconomicSituation, o => o.ToJson());
            entity.OwnsOne(p => p.ExchangesOffered, o => o.ToJson());
            entity.OwnsOne(p => p.Habits, o => o.ToJson());
            entity.OwnsOne(p => p.Health, o => o.ToJson());
            entity.OwnsOne(p => p.HostPreferences, o => o.ToJson());
            entity.OwnsOne(p => p.PersonalPresentation, o => o.ToJson());

            entity.HasIndex(p => p.PreferredHostGeneration);
        });

        builder.Entity<HostProfile>(entity =>
        {
            entity.HasIndex(p => p.UserId).IsUnique();
            entity.HasOne(p => p.User)
                .WithOne()
                .HasForeignKey<HostProfile>(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.OwnsOne(p => p.PersonalData, o => o.ToJson());
            entity.OwnsOne(p => p.WorkSituation, o => o.ToJson());
            entity.OwnsOne(p => p.HousingData, o => o.ToJson());
            entity.OwnsOne(p => p.ExchangesExpected, o => o.ToJson());
            entity.OwnsOne(p => p.Health, o => o.ToJson());
            entity.OwnsOne(p => p.Habits, o => o.ToJson());
            entity.OwnsOne(p => p.TenantPreferences, o => o.ToJson());
            entity.OwnsOne(p => p.PersonalPresentation, o => o.ToJson());

            entity.HasIndex(p => p.PreferredTenantGeneration);
        });

        // Acá van las configuraciones de Space, Match, etc. cuando lleguen esos módulos
    }
}