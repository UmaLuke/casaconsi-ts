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

## Enlaces relacionados
- [[decisiones/ADR-0001-arquitectura-single-project]]
- [[00-Roadmap]]
