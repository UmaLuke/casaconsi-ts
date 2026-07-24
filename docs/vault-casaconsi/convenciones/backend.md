tags: [convenciones, backend]

# Convenciones — Backend

## Stack
- ASP.NET Core / .NET 10 (`CasaConSi.Api`, single-project — ver [[decisiones/ADR-0001-arquitectura-single-project]]).
- EF Core 10 + Npgsql → PostgreSQL 18 (puerto **5433**, DB `db_ccs`).
- ASP.NET Identity + JWT Bearer para auth.
- Puerto local de la API: **8000**.

## Arquitectura
- Separación estricta **Controller → Service → Repository**.
- Los **Controllers** no contienen lógica de negocio, solo orquestan la petición/respuesta.
- La lógica de negocio (reglas, validaciones, orquestación) vive en los **Services**.
- Los **Repositories** solo hablan con la base de datos vía EF Core — nunca SQL crudo salvo indicación explícita.

## Endpoints
- Todos bajo el prefijo `/api/...` (el frontend los consume vía `VITE_API_URL`).

## Migraciones
- Versionadas y con nombres descriptivos (ej. `AddIdentityColumns`, no `migration1`).

## Secrets
- **Nunca** commitear connection strings ni claves JWT.
- `ConnectionStrings:DefaultConnection` y `Jwt:Key` viven en `dotnet user-secrets`.
- `appsettings.json` los mantiene vacíos intencionalmente.
- `.env` (si se usa) va gitignorado, nunca se commitea.

## Compatibilidad de entorno
- PowerShell 5.1 (Windows): usar patrones de métodos de instancia (ej. `RandomNumberGenerator`) en vez de métodos estáticos al generar claves.

## Build / control de versiones
- `bin/` y `obj/` (artefactos de compilación) **no se versionan** — deben estar en `.gitignore`.

## Gotchas / lecciones aprendidas
- **`dotnet build`/`dotnet ef` con el backend corriendo:** si tenés `dotnet run` (u otro proceso `CasaConSi.Api`) activo en otra terminal, `dotnet build` o `dotnet ef database update` fallan porque no pueden reemplazar `bin/Debug/net10.0/CasaConSi.Api.exe` (bloqueado). Parar el proceso (`Stop-Process -Id <pid> -Force` o Ctrl+C en la terminal donde corre) antes de migrar.
- **Relaciones EF Core con propiedad de navegación sin conectar:** si una entidad tiene una propiedad de navegación (ej. `Space.Host`) pero en `OnModelCreating` configurás la relación con el patrón "sin navegación" (`HasOne<ApplicationUser>().WithMany()...`) en vez de usar esa propiedad (`HasOne(s => s.Host).WithMany()...`), EF Core trata la navegación no conectada como una relación *aparte* y crea una FK sombra duplicada (pasó con `Space`: apareció una columna `HostId` fantasma además de `HostUserId`). Si una entidad tiene navegación, hay que usarla explícitamente en la config; si no la necesitás, mejor sacar la propiedad de navegación del modelo (como en `ProfileLike`/`Match`, que no la tienen).
- **Multiple cascade paths es un límite de SQL Server, no de Postgres:** Npgsql permite `OnDelete(DeleteBehavior.Cascade)` en dos FKs distintas a la misma tabla desde la misma entidad sin problema (ver `ProfileLike`/`Match`, que igual usan `Restrict` de un lado, pero por decisión de diseño — no por una limitación técnica de la base).

## Enlaces relacionados
- [[decisiones/ADR-0001-arquitectura-single-project]]
- [[00-Roadmap]]
