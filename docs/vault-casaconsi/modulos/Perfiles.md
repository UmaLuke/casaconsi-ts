tags: [modulo, backend, perfiles, cuestionario]

# Módulo: Perfiles (cuestionario post-registro)

**Estado:** ✅ Implementado y migrado end-to-end (backend). Frontend del cuestionario ya construido (pendiente de conectar a estos endpoints).

## Backend

- `StudentProfile` / `HostProfile`: relación 1:1 con `ApplicationUser` vía `UserId`. "Perfil completado" = existe el registro — no hay flag aparte.
- Secciones del cuestionario modeladas como owned types mapeados a columnas **jsonb** vía `.ToJson()` (ver `ApplicationDbContext.OnModelCreating`):
  - Estudiante (9 secciones): `PersonalData`, `TravelReason`, `LocationPreferences`, `EconomicSituation`, `ExchangesOffered`, `Habits`, `Health`, `HostPreferences`, `PersonalPresentation`.
  - Anfitrión (8 secciones): `PersonalData`, `WorkSituation`, `HousingData`, `ExchangesExpected`, `Health`, `Habits`, `TenantPreferences`, `PersonalPresentation`.
- **DNI:** nunca en texto plano. Se cifra con ASP.NET Data Protection (`IDataProtector`, purpose fijo `"CasaConSi.Profile.Dni"`) antes de guardarse en `EncryptedDni`. Cambiar ese purpose string invalidaría todos los DNI ya cifrados.
- **Generation:** no viaja del cliente. Se deriva en el backend a partir de `BirthDate` en cada guardado (`ProfileService.SyncUserGenerationAsync`, umbral `EdadMinimaAdultoMayor = 60`) y se persiste en `ApplicationUser.Generation`.
- **Columnas promovidas** (fuera del jsonb, para que el futuro módulo Match pueda filtrar/indexar):
  - Estudiante: `PreferredHostGeneration`, `PreferredNeighborhoods`, `ContributionRangeArs`, `AvailableFrom`, `StayDuration`.
  - Anfitrión: `PreferredTenantGeneration`, `Neighborhood`, `ExpectedAmountRangeArs`, `AvailableRooms`, `HousingType`.
- Arquitectura respetada: `ProfileController` → `ProfileService` → `ProfileRepository` (el controller nunca toca `StudentProfile`/`HostProfile` ni el `DbContext` directamente).
- Fotos (perfil, presentación, fotos de casa/habitación para anfitrión) se suben aparte vía multipart, no en el submit del cuestionario.

### Endpoints (`/api/profile`, todos con `[Authorize]`)
- `GET /status` — indica si el usuario autenticado ya completó su perfil.
- `PUT /student` / `GET /student` — guardar/leer perfil de estudiante (`[Authorize(Roles = "Student")]`).
- `POST /student/photos` — subir foto de perfil + media de presentación (estudiante).
- `PUT /host` / `GET /host` — guardar/leer perfil de anfitrión (`[Authorize(Roles = "Host")]`).
- `POST /host/photos` — subir foto de perfil + fotos de casa/habitación + media de presentación (anfitrión).
- Todos los endpoints operan siempre sobre el perfil del usuario del token (`Sub`/`NameIdentifier` claim) — nunca se acepta un id de perfil como parámetro, así no hay forma de pedir o pisar el perfil de otra persona.

### Migración
- `AddProfiles` (`20260722174322_AddProfiles`) — crea `StudentProfiles` y `HostProfiles`, columnas jsonb, FK 1:1 a `AspNetUsers` con `ON DELETE CASCADE`, índices únicos en `UserId`, índices en `PreferredHostGeneration`/`PreferredTenantGeneration`. Aplicada a `db_ccs`.

### Datos de prueba
- `Data/DemoProfileSeeder.cs` — siembra estudiantes y anfitriones de prueba con perfiles completos, **solo en Development**. Idempotente (salta si el email ya existe). Ver [[../datos-demo|datos-demo]] para las credenciales.

## Pendiente
- Conectar el cuestionario del frontend (ya construido) a estos endpoints.
- Cuando se construya el módulo Match, resolver el DTO "público" de perfil (sin `Health`, sin DNI) para mostrar en el feed de matches — ver nota de protección de datos en `StudentHealth`/`HostHealth`.

## Enlaces relacionados
- [[../00-Roadmap|00-Roadmap]]
- [[Match]]
- [[Auth]]
- [[../convenciones/backend|convenciones/backend]]
