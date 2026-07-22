using CasaConSi.Api.Data;
using Microsoft.EntityFrameworkCore;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using CasaConSi.Api.Models;
using CasaConSi.Api.Services;
using CasaConSi.Api.Services.Interfaces;
using Microsoft.AspNetCore.DataProtection;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// DbContext con PostgreSQL
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// CORS: permitir al frontend (Vite, puerto 5173) consumir la API
const string FrontendCorsPolicy = "FrontendCorsPolicy";
builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Identity: gestiona ApplicationUser, hashing de password, roles, etc.
builder.Services
    .AddIdentity<ApplicationUser, IdentityRole>(options =>
    {
        options.Password.RequiredLength = 8;
        options.User.RequireUniqueEmail = true;
    })
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

// JWT Bearer: valida el token en cada request autenticado
builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        var jwtKey = builder.Configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("Falta Jwt:Key.");

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "CasaConSi.Api",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "CasaConSi.Client",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        };
    });

// Servicios propios del módulo de Auth
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITokenService, TokenService>();

// Servicios propios del módulo de Perfiles (cuestionario post-registro)
builder.Services.AddScoped<CasaConSi.Api.Repositories.Interfaces.IProfileRepository, CasaConSi.Api.Repositories.ProfileRepository>();
builder.Services.AddScoped<CasaConSi.Api.Services.Interfaces.IProfileService, CasaConSi.Api.Services.ProfileService>();
builder.Services.AddScoped<CasaConSi.Api.Services.Interfaces.IFileStorageService, CasaConSi.Api.Services.FileStorageService>();

// Data Protection: cifra el DNI antes de guardarlo (ver ProfileService). Las
// claves se persisten en disco para que sobrevivan a un reinicio del proceso
// en desarrollo — en Azure, esto debería apuntar a Azure Key Vault / Blob
// Storage en vez de al filesystem local (pendiente para el deploy real).
builder.Services.AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo(Path.Combine(builder.Environment.ContentRootPath, "App_Data", "keys")))
    .SetApplicationName("CasaConSi.Api");

var app = builder.Build();

// Seed del rol Admin y del usuario admin (si hay credenciales en AdminSeed:* vía user-secrets).
// Si falla (password inválido, DB no disponible, etc.), lo logueamos como advertencia
// pero dejamos que la API arranque igual — un problema con el seed del admin no debería
// tumbar el backend para todos los usuarios normales.
using (var scope = app.Services.CreateScope())
{
    try
    {
        await CasaConSi.Api.Data.AdminSeeder.SeedAsync(scope.ServiceProvider);
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogWarning(ex, "No se pudo completar el seed del usuario admin.");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// Sirve wwwroot/uploads (fotos de perfil/hogar guardadas por FileStorageService)
// bajo /uploads/... — ver ProfileService.ToUrl.
app.UseStaticFiles();

app.UseCors(FrontendCorsPolicy);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}