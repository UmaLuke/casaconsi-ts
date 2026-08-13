tags: [modulo, backend, perfiles, cuestionario]

# Módulo: Perfiles (cuestionario post-registro)

**Estado:** ✅ Implementado end-to-end (backend + frontend), incluida la re-edición de un perfil ya existente (ver sección Frontend, fix del 2026-08-04).

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

## Frontend

- `StudentQuestionnairePage.tsx` / `HostQuestionnairePage.tsx` arrancaban siempre con `createEmptyStudentQuestionnaire()`/`createEmptyHostQuestionnaire()`, sin cargar nunca el perfil ya guardado — **(2026-08-04, bug corregido)**: al entrar al cuestionario con un perfil existente, se veía en blanco, y como el `PUT` es upsert, guardar así pisaba el perfil completo con los defaults vacíos en los campos no vueltos a llenar (riesgo real de pérdida de datos, no solo cosmético).
  - Fix: `questionnaireService.ts` ahora expone `getStudentProfile`/`getHostProfile` (`GET /api/profile/student|host`, devuelven `null` en 404 — primera vez, no es error) y `toStudentQuestionnaireData`/`toHostQuestionnaireData` (inverso de `toStudentPayload`/`toHostPayload`, reconstruye el shape estricto del form a partir del DTO de respuesta).
  - Ambas páginas hacen un `useEffect` al montar que precarga `formData` si ya existe un perfil, con estado de carga (`isLoadingProfile`) y un aviso visible cuando se precargó desde uno existente.
  - **Fotos deliberadamente no precargadas:** `profilePhoto`/`homeAndRoomPhotos`/`presentationMedia` quedan en `null`/`[]` al reeditar (son campos `File` en el form; el backend solo expone URLs, no los bytes). Esto es seguro porque `ProfileService.SaveStudentProfileAsync`/`SaveHostProfileAsync` nunca tocan las rutas de foto — solo `SaveXPhotosAsync` las pisa, y eso solo se llama si el `FormData` de fotos trae algo. Dejar esos campos vacíos en el form al reeditar equivale a "no subas nada nuevo", no a "borrá lo que había". `housingData.homePhotos` queda igual en `[]` por el mismo motivo por el que ya no se envía en el submit (ver nota en `toHostPayload`).
  - Pendiente real: mostrarle a la persona una preview de sus fotos ya cargadas al reeditar (hoy solo hay un texto de aviso genérico, no la foto en sí) — requeriría que `QuestionnaireField`/`ImageField`/`ImagesField` acepten una URL existente además de un `File` nuevo, hoy no lo soportan.
- **(2026-08-10)** `StudentQuestionnairePage.tsx`/`HostQuestionnairePage.tsx` precargan `personalData.fullName` y `personalData.contactEmail` con `user.name`/`user.email` (del `AuthContext`) al armar el estado inicial del form — antes había que volver a tipearlos a mano justo después de haberlos puesto en `RegisterForm.tsx` un paso antes. Se hace en el inicializador de `useState` (no en el `useEffect` de precarga de perfil existente), así que si ya había un perfil guardado, `toStudentQuestionnaireData`/`toHostQuestionnaireData` lo pisan igual con los valores reales guardados — el prefill de cuenta es solo el punto de partida para un cuestionario nuevo, nunca gana contra un perfil ya completado.

## Interacciones

**Backend:** `ProfileController` (`/api/profile`, `[Authorize]`) → `ProfileService` → `ProfileRepository`. `ProfileService` también usa `IFileStorageService` (fotos) y `IDataProtector` (cifrado de DNI). `ProfileRepository` es reutilizado como solo-lectura por `MatchService` y `SpaceService` (ver [[Match]] y [[Space]] abajo).

| Endpoint | Service / método |
|---|---|
| `GET /api/profile/status` | `GetStatusAsync` |
| `GET/PUT /api/profile/student` | `GetStudentProfileAsync` / `SaveStudentProfileAsync` |
| `POST /api/profile/student/photos` | `SaveStudentPhotosAsync` |
| `GET/PUT /api/profile/host` | `GetHostProfileAsync` / `SaveHostProfileAsync` |
| `POST /api/profile/host/photos` | `SaveHostPhotosAsync` |

**Frontend:** `services/questionnaireService.ts` (`getProfileStatus`, `getStudentProfile`/`getHostProfile`, `submitStudentQuestionnaire`/`submitHostQuestionnaire`, `toStudentQuestionnaireData`/`toHostQuestionnaireData`) — vía `apiFetch`, ver [[../convenciones/http-client|convenciones/http-client]].

| Componente/página | Funciones usadas | Contexto |
|---|---|---|
| `pages/questionnaire/StudentQuestionnairePage.tsx` | `getStudentProfile`, `submitStudentQuestionnaire`, `toStudentQuestionnaireData` | Wizard de alta/edición (`/cuestionario/buscar`) |
| `pages/questionnaire/HostQuestionnairePage.tsx` | `getHostProfile`, `submitHostQuestionnaire`, `toHostQuestionnaireData` | Wizard de alta/edición (`/cuestionario/ofrecer`) |
| `pages/ProfilePage.tsx` (tab "Mi perfil de match", `HostMatchProfile`/`StudentMatchProfile`) | mismas funciones que el wizard | Edición inline en acordeón (`QuestionnaireAccordion`), ver [[Cuenta]] |

Flujo de re-edición (el que motivó el fix del 2026-08-04):

```
StudentQuestionnairePage.tsx (useEffect al montar)
  → getStudentProfile(token)                    [questionnaireService.ts]
    → apiFetch('/api/profile/student', ...)      [httpClient.ts]
      → ProfileController.GetStudent → ProfileService.GetStudentProfileAsync → ProfileRepository
    ← StudentProfileResponseDto | 404 (sin perfil todavía → null, no error)
  → toStudentQuestionnaireData(dto)               [reconstruye el shape del form]
  → setFormData(...)                              [precarga el wizard]
```

## Pendiente
- Cuando se construya el módulo Match, resolver el DTO "público" de perfil (sin `Health`, sin DNI) para mostrar en el feed de matches — ver nota de protección de datos en `StudentHealth`/`HostHealth`.

## Enlaces relacionados
- [[../00-Roadmap|00-Roadmap]]
- [[Match]]
- [[Auth]]
- [[../convenciones/backend|convenciones/backend]]
