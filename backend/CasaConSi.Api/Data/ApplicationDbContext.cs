using Microsoft.EntityFrameworkCore;

namespace CasaConSi.Api.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    // Los DbSet<> de las entidades (User, Space, etc.) se agregan
    // a medida que se van definiendo los módulos.
}