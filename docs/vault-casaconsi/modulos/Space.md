tags: [modulo, backend]

# Módulo: Space (espacios/propiedades)

**Estado:** ✅ Backend implementado y migrado a `db_ccs`. Frontend: `ExploreSpacesPage.tsx` conectado a la lista pública, con modal de detalle (`SpaceDetailsModal`) y botones de like/pass conectados a [[Match]]. `SpaceDetailPage`, `MySpacesList`, `NewSpaceForm` todavía sin construir (el backend ya tiene los endpoints que van a necesitar).

## Modelo
`Space`: una habitación/propiedad publicada por un anfitrión. Relación **N:1** con `ApplicationUser` (un anfitrión puede tener varios `Space` — no hay co-anfitriones, quedó resuelta la pregunta abierta que tenía este doc antes). No confundir con `HostProfile.HousingData` (eso es el cuestionario, "cómo es mi casa en general"); `Space` es cada publicación puntual que arma el anfitrión para ofrecer un lugar.

Campos: `Title`, `Description`, `Location` (descriptivo), `Neighborhood` (canónico, para filtrar), `HostTypeLabel` (texto libre, ej. "Propietario"/"Familia Anfitriona" — no tiene equivalente en `HostProfile`, se completa por publicación), `PriceArs`, `Purpose` (`compartir-gastos` | `estudiar`), `Duration`, `Amenities`, `Verified`, `IsActive` (publicado/pausado, para el futuro `MySpacesList`).

### Fotos
Mismo patrón que `HostProfile.HomePhotoPaths`: `PhotoPaths` (lista, subida real vía `FileStorageService`/multipart, `POST /api/space/{id}/photos`). Además hay un campo temporal `ExternalImageUrl` (URL absoluta externa) que solo se usa si `PhotoPaths` está vacío — sirve para los 3 espacios demo (reutilizan las URLs de Unsplash que tenía el mock del frontend) sin necesidad de subir archivos reales.

**(2026-08-05)** Hasta ahora `PhotoPaths` se subía pero nunca se exponía completo — `SpaceResponseDto` solo mandaba la primera foto (`ImageUrl`, para la miniatura de la card), el resto quedaba guardado pero invisible. Se agregó `PhotoUrls: List<string>` al DTO, con esta prioridad (`SpaceService.ToPhotoUrlsAsync`):
1. `Space.PhotoPaths` (fotos propias del anuncio, si el anfitrión subió alguna).
2. Si no hay ninguna: `HostProfile.HomePhotoPaths` (fotos generales de la casa, del cuestionario) — así un anuncio sin fotos propias no cae directo al placeholder de Unsplash si el anfitrión ya tiene fotos reales de su casa cargadas.
3. Si tampoco hay: `ExternalImageUrl` (o lista vacía si no hay nada).

`ImageUrl` (miniatura) queda siempre como `PhotoUrls[0]` — se mantiene por compatibilidad con la grilla, que solo necesita una imagen.

## Backend (implementado)
- `SpaceController` (`/api/space`):
  - `GET /api/space` — lista pública, espacios activos (`[AllowAnonymous]` — `/explorar` no requiere login, ver `App.tsx`).
  - `GET /api/space/{id}` — detalle público.
  - `GET /api/space/mine` — espacios propios (`[Authorize(Roles = "Host")]`).
  - `POST /api/space` — crear (`[Authorize(Roles = "Host")]`).
  - `POST /api/space/{id}/photos` — subir fotos (`[Authorize(Roles = "Host")]`, valida que el `Space` sea del usuario del token).
- `SpaceController` → `SpaceService` → `SpaceRepository`, respetando la separación de capas.
- `SpaceResponseDto` nunca expone campos sensibles (no aplica acá como en Perfiles, pero sigue el mismo patrón de DTO público separado de la entidad).
- `SpaceResponseDto` ahora también expone `HostUserId` (antes solo `HostType`, el texto libre) — lo necesita el frontend para poder mandar `targetUserId` a `POST /api/match/like` desde la card/modal de un Space (ver abajo y [[Match]]). No es sensible: ya es de algún modo público vía `HostType`/fotos, y el `Match` original ya usa `UserId`s como clave pública en sus propios DTOs.
- `SpaceResponseDto` también expone `HostName` (= `ApplicationUser.Name` del anfitrión, ya requerido y sin `Health`/`Dni`) — la card y el modal mostraban "Anfitrión: Propietaria"/"Propietario" (el `HostTypeLabel` genérico) y con 3 espacios demo dos decían lo mismo; ahora muestran el nombre real (ej. "Anfitrión: Elena Ruiz"). `HostTypeLabel` sigue existiendo en el modelo/DTO, solo dejó de mostrarse en estas dos pantallas.

## Migraciones
- `AddSpace` — crea la tabla `Spaces`.
- `FixSpaceHostRelationship` — corrige un bug de modelado: `Space` tenía una propiedad de navegación `Host` sin conectar explícitamente en `OnModelCreating` (se había configurado la relación con el patrón "sin navegación" en su lugar), y EF Core creó una FK sombra duplicada (`HostId`, además de la `HostUserId` real). Ver [[../convenciones/backend|convenciones/backend]] → Gotchas.

## Datos de prueba
- `Data/DemoSpaceSeeder.cs` (solo Development, corre después de `DemoProfileSeeder`): 3 espacios, uno por cada anfitrión demo, con barrio/precio acorde al perfil real de cada uno. Ver [[../datos-demo|datos-demo]].

## Frontend
- `spaceService.ts` (nuevo): `getSpaces()`, sin autenticación (endpoint público). Resuelve el fallback de imagen acá (`imageUrl` del DTO puede ser `null`, pero `types/space.ts` exige `string` — el service reemplaza `null` por una imagen placeholder antes de que le llegue a la UI). `types/space.ts`/`Space` incluye `hostUserId` (mapeado 1:1 desde el DTO).
- `types/space.ts`: corregido `id: number` → `id: string` (era una inconsistencia real con el resto del backend, que usa `Guid` en todos lados).
- `ExploreSpacesPage.tsx`: reemplazado el array `mockSpaces` hardcodeado por el fetch real. Los filtros (barrio, generación, propósito, duración, verificado) siguen siendo client-side sobre el array ya traído — no hay filtrado server-side todavía.
- `SpaceDetailsModal.tsx` (nuevo, `components/features/spaces/`): modal `<dialog>` + DaisyUI (mismo patrón que `LoginModal`) que muestra el detalle completo de un `Space` (imagen, precio, verificado, ubicación, anfitrión, propósito, duración, generación, comodidades). Se abre desde el botón "Ver detalles" de cada card; se mantiene siempre montado fuera del `.map` y se controla por ref (`showModal()`/`close()`). `modal-box` usa `max-h-[90vh] overflow-y-auto` (no `overflow-hidden` a secas) para que el contenido scrollee y el footer nunca quede cortado.
  - **(2026-08-05)** La imagen única del header pasó a ser un carrusel sobre `space.photoUrls` (flechas prev/next + dots, con fade entre fotos) — solo se muestran los controles si hay más de una foto. Estado `currentPhotoIndex` local al modal, se resetea a `0` con un `useEffect` sobre `space?.id` (el modal se reutiliza para cualquier `Space` que se abra, sin desmontarse). El badge de precio se movió de la esquina inferior-derecha a la superior (junto al botón de cerrar) para no pisarse con los dots del carrusel, que ahora ocupan el centro-inferior.
- `MatchDecisionButtons.tsx` (nuevo, `components/features/spaces/`): par de botones (✕ rechazar / ✓ verde marcar match), compartido entre la card de la grilla (debajo de "Ver detalles") y el footer de `SpaceDetailsModal` (reemplazó al botón "Cerrar" de ahí). Estado `idle | loading | liked | passed` por `Space.id`, manejado en `ExploreSpacesPage` para que card y modal queden sincronizados.
- Al presionar cualquiera de los dos botones, `ExploreSpacesPage.handleDecide` llama a `matchService.registerLikeDecision(token, space.hostUserId, liked)` (ver [[Match]]) — cierra el modal si estaba abierto y muestra un toast de error si falla (sin sesión, generación igual, etc.).

## Interacciones

**Backend:** `SpaceController` (`/api/space`) → `SpaceService` → `SpaceRepository`. `SpaceService` además depende de `IFileStorageService` (fotos) y — solo lectura — de `IProfileRepository` (fallback de fotos a `HostProfile.HomePhotoPaths`, ver [[Perfiles]]).

| Endpoint | Auth | Service / método |
|---|---|---|
| `GET /api/space` | público | `GetActiveSpacesAsync` |
| `GET /api/space/{id}` | público | `GetByIdAsync` |
| `GET /api/space/mine` | `Host` | `GetMineAsync` |
| `POST /api/space` | `Host` | `CreateAsync` |
| `POST /api/space/{id}/photos` | `Host`, dueño del Space | `UploadPhotosAsync` |

**Frontend:** `services/spaceService.ts` (`getSpaces`) — vía `apiFetch`, ver [[../convenciones/http-client|convenciones/http-client]]. Solo `GetActiveSpacesAsync` está conectado hoy; `GET /{id}`, `GET /mine`, `POST`, `POST /{id}/photos` ya existen en el backend pero no tienen pantalla (ver Pendiente).

| Componente/página | Función usada | Contexto |
|---|---|---|
| `pages/ExploreSpacesPage.tsx` | `getSpaces` | Grilla/perfil de espacios (`/explorar`) |
| `components/features/landing/ExploreSpaces.tsx` | `getSpaces` | Preview de 3 espacios en la landing |

El botón ✕/✓ (`MatchDecisionButtons`) sobre un `Space` **no** llama a `spaceService` — llama a `matchService.registerLikeDecision(token, space.hostUserId, liked)`, ver [[Match]].

```
ExploreSpacesPage.tsx (useEffect al montar)
  → getSpaces()                                  [spaceService.ts, sin token]
    → apiFetch('/api/space')                      [httpClient.ts]
      → SpaceController.GetAll → SpaceService.GetActiveSpacesAsync → SpaceRepository
                                                     ↳ ToPhotoUrlsAsync usa ProfileRepository como fallback
    ← SpaceResponseDto[]
  → toSpace(dto) por cada uno                      [placeholder de imagen si no hay fotos]
```

## Pendiente
- `SpaceDetailPage.tsx`, `MySpacesList.tsx`, `NewSpaceForm.tsx` — el backend ya tiene los endpoints (`GET /{id}`, `GET /mine`, `POST`, `POST /{id}/photos`), falta la UI. Sin `NewSpaceForm`, hoy no hay forma de probar `POST /{id}/photos` con fotos propias de un `Space` real — el fallback a `HostProfile.HomePhotoPaths` es lo único que se ve en la práctica hasta que exista esa pantalla.
- Reemplazar `ExternalImageUrl` por fotos reales subidas cuando exista `NewSpaceForm`.
- Evaluar filtrado server-side si el volumen de `Space` crece (hoy trae todo y filtra en el cliente).
- ⚠️ Ver [[Match]]: no está resuelto si `ApplicationsList.jsx`/`IncomingRequests.jsx` (modelo de "solicitud a un Space puntual") conviven con el like mutuo del módulo Match, o quedan obsoletos.
- El feedback de "¡Es un match!" (`LikeResponseDto.isMatch`) hoy solo cambia el estado del botón (✓ verde con texto "¡Le diste Like!" — a propósito no dice "match" ahí, porque el `Match` real recién se confirma cuando la contraparte también da like); no dispara ninguna notificación ni redirige al chat — evaluar si corresponde acá o al construirse el chat en tiempo real.

## Enlaces relacionados
- [[../00-Roadmap|00-Roadmap]]
- [[Match]]
- [[Perfiles]]
- [[../convenciones/backend|convenciones/backend]]
