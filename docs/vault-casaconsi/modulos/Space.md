tags: [modulo, backend]

# Módulo: Space (espacios/propiedades)

**Estado:** ✅ Backend implementado y migrado a `db_ccs`. Frontend: `ExploreSpacesPage.tsx` conectado a la lista pública; `SpaceDetailPage`, `MySpacesList`, `NewSpaceForm` todavía sin construir (el backend ya tiene los endpoints que van a necesitar).

## Modelo
`Space`: una habitación/propiedad publicada por un anfitrión. Relación **N:1** con `ApplicationUser` (un anfitrión puede tener varios `Space` — no hay co-anfitriones, quedó resuelta la pregunta abierta que tenía este doc antes). No confundir con `HostProfile.HousingData` (eso es el cuestionario, "cómo es mi casa en general"); `Space` es cada publicación puntual que arma el anfitrión para ofrecer un lugar.

Campos: `Title`, `Description`, `Location` (descriptivo), `Neighborhood` (canónico, para filtrar), `HostTypeLabel` (texto libre, ej. "Propietario"/"Familia Anfitriona" — no tiene equivalente en `HostProfile`, se completa por publicación), `PriceArs`, `Purpose` (`compartir-gastos` | `estudiar`), `Duration`, `Amenities`, `Verified`, `IsActive` (publicado/pausado, para el futuro `MySpacesList`).

### Fotos
Mismo patrón que `HostProfile.HomePhotoPaths`: `PhotoPaths` (lista, subida real vía `FileStorageService`/multipart). Además hay un campo temporal `ExternalImageUrl` (URL absoluta externa) que solo se usa si `PhotoPaths` está vacío — sirve para los 3 espacios demo (reutilizan las URLs de Unsplash que tenía el mock del frontend) sin necesidad de subir archivos reales. El día que un `Space` real suba fotos, esas tienen prioridad. `SpaceService.ToImageUrl` resuelve esta prioridad.

## Backend (implementado)
- `SpaceController` (`/api/space`):
  - `GET /api/space` — lista pública, espacios activos (`[AllowAnonymous]` — `/explorar` no requiere login, ver `App.tsx`).
  - `GET /api/space/{id}` — detalle público.
  - `GET /api/space/mine` — espacios propios (`[Authorize(Roles = "Host")]`).
  - `POST /api/space` — crear (`[Authorize(Roles = "Host")]`).
  - `POST /api/space/{id}/photos` — subir fotos (`[Authorize(Roles = "Host")]`, valida que el `Space` sea del usuario del token).
- `SpaceController` → `SpaceService` → `SpaceRepository`, respetando la separación de capas.
- `SpaceResponseDto` nunca expone campos sensibles (no aplica acá como en Perfiles, pero sigue el mismo patrón de DTO público separado de la entidad).

## Migraciones
- `AddSpace` — crea la tabla `Spaces`.
- `FixSpaceHostRelationship` — corrige un bug de modelado: `Space` tenía una propiedad de navegación `Host` sin conectar explícitamente en `OnModelCreating` (se había configurado la relación con el patrón "sin navegación" en su lugar), y EF Core creó una FK sombra duplicada (`HostId`, además de la `HostUserId` real). Ver [[../convenciones/backend|convenciones/backend]] → Gotchas.

## Datos de prueba
- `Data/DemoSpaceSeeder.cs` (solo Development, corre después de `DemoProfileSeeder`): 3 espacios, uno por cada anfitrión demo, con barrio/precio acorde al perfil real de cada uno. Ver [[../datos-demo|datos-demo]].

## Frontend
- `spaceService.ts` (nuevo): `getSpaces()`, sin autenticación (endpoint público). Resuelve el fallback de imagen acá (`imageUrl` del DTO puede ser `null`, pero `types/space.ts` exige `string` — el service reemplaza `null` por una imagen placeholder antes de que le llegue a la UI).
- `types/space.ts`: corregido `id: number` → `id: string` (era una inconsistencia real con el resto del backend, que usa `Guid` en todos lados).
- `ExploreSpacesPage.tsx`: reemplazado el array `mockSpaces` hardcodeado por el fetch real. Los filtros (barrio, generación, propósito, duración, verificado) siguen siendo client-side sobre el array ya traído — no hay filtrado server-side todavía.

## Pendiente
- `SpaceDetailPage.tsx`, `MySpacesList.tsx`, `NewSpaceForm.tsx` — el backend ya tiene los endpoints (`GET /{id}`, `GET /mine`, `POST`, `POST /{id}/photos`), falta la UI.
- Reemplazar `ExternalImageUrl` por fotos reales subidas cuando exista `NewSpaceForm`.
- Evaluar filtrado server-side si el volumen de `Space` crece (hoy trae todo y filtra en el cliente).
- ⚠️ Ver [[Match]]: no está resuelto si `ApplicationsList.jsx`/`IncomingRequests.jsx` (modelo de "solicitud a un Space puntual") conviven con el like mutuo del módulo Match, o quedan obsoletos.

## Enlaces relacionados
- [[../00-Roadmap|00-Roadmap]]
- [[Match]]
- [[Perfiles]]
- [[../convenciones/backend|convenciones/backend]]
