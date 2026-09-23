tags: [modulo, backend]

# Módulo: Space (espacios/propiedades)

**Estado:** ✅ Backend y frontend completos, incluida la autogestión de publicaciones (editar, pausar/reactivar, eliminar, gestionar fotos). Frontend: `ExploreSpacesPage.tsx` conectado a la lista pública, con modal de detalle (`SpaceDetailsModal`) y botones de like/pass conectados a [[Match]]. `SpaceDetailPage.tsx` ✅ construido. **(2026-09-15)** `MySpacesPage.tsx` (antes `MySpacesList`) y `NewSpacePage.tsx` (antes `NewSpaceForm`) ✅ construidos y conectados a `GET /mine`, `POST` y `POST /{id}/photos`. **(2026-09-18)** Autogestión completa: `MySpacesPage.tsx` ahora tiene botones de Editar/Pausar-Reactivar/Eliminar, y un modal nuevo (`EditSpaceModal.tsx`) permite editar título/precio/barrio/descripción, cambiar el estado activo/pausado, y agregar/reordenar/borrar fotos — ver detalle más abajo. **(2026-09-22)** Verificado con `dotnet build` que el backend compila; ajustada la grilla de miniaturas de fotos y confirmado que el fallback de fotos del perfil del anfitrión es el comportamiento esperado (ver Fotos y Frontend más abajo).

## Modelo
`Space`: una habitación/propiedad publicada por un anfitrión. Relación **N:1** con `ApplicationUser` (un anfitrión puede tener varios `Space` — no hay co-anfitriones, quedó resuelta la pregunta abierta que tenía este doc antes). No confundir con `HostProfile.HousingData` (eso es el cuestionario, "cómo es mi casa en general"); `Space` es cada publicación puntual que arma el anfitrión para ofrecer un lugar.

Campos: `Title`, `Description`, `Location` (descriptivo), `Neighborhood` (canónico, para filtrar), `HostTypeLabel` (texto libre, ej. "Propietario"/"Familia Anfitriona" — no tiene equivalente en `HostProfile`, se completa por publicación), `PriceArs`, `Purpose` (`compartir-gastos` | `estudiar`), `Duration`, `Amenities`, `Verified`, `IsActive` (publicado/pausado — expuesto en `SpaceResponseDto` y editable desde `MySpacesPage.tsx` vía `PATCH /api/space/{id}/status`, ver más abajo).

### Fotos
Mismo patrón que `HostProfile.HomePhotoPaths`: `PhotoPaths` (lista, subida real vía `FileStorageService`/multipart, `POST /api/space/{id}/photos`). Además hay un campo temporal `ExternalImageUrl` (URL absoluta externa) que solo se usa si `PhotoPaths` está vacío — sirve para los 3 espacios demo (reutilizan las URLs de Unsplash que tenía el mock del frontend) sin necesidad de subir archivos reales.

**(2026-08-05)** Hasta ahora `PhotoPaths` se subía pero nunca se exponía completo — `SpaceResponseDto` solo mandaba la primera foto (`ImageUrl`, para la miniatura de la card), el resto quedaba guardado pero invisible. Se agregó `PhotoUrls: List<string>` al DTO, con esta prioridad (`SpaceService.ToPhotoUrlsAsync`):
1. `Space.PhotoPaths` (fotos propias del anuncio, si el anfitrión subió alguna).
2. Si no hay ninguna: `HostProfile.HomePhotoPaths` (fotos generales de la casa, del cuestionario) — así un anuncio sin fotos propias no cae directo al placeholder de Unsplash si el anfitrión ya tiene fotos reales de su casa cargadas.
3. Si tampoco hay: `ExternalImageUrl` (o lista vacía si no hay nada).

`ImageUrl` (miniatura) queda siempre como `PhotoUrls[0]` — se mantiene por compatibilidad con la grilla, que solo necesita una imagen.

**(2026-09-18)** Se agregaron `DELETE /api/space/{id}/photos/{index}` (borra una foto puntual y su archivo físico en disco vía `IFileStorageService.DeleteAsync`) y `PUT /api/space/{id}/photos/order` (guarda un nuevo orden). Como `PhotoPaths` sigue siendo una `List<string>` simple sin id por foto, ambos endpoints trabajan por **índice de posición** en la lista actual — `ReorderSpacePhotosRequestDto.Order` es la lista de índices viejos en el orden nuevo (ej. `[2, 0, 1]`). Es una decisión de alcance consciente: una entidad `SpacePhoto` con id propio hubiera sido más robusta pero no se justificaba para esta iteración; si en el futuro hace falta reordenar con ediciones concurrentes entre pestañas, conviene revisitarlo.

**(2026-09-22)** Límite de tamaño por archivo: `FileStorageService.SaveAsync` rechaza fotos de más de 10 MB (`MaxFileSizeBytes`, ver `FileStorageService.cs`) con un `InvalidOperationException` — no hay validación de tamaño en el frontend antes de subir, así que el error recién aparece después de intentarlo. No hay límite de resolución ni se genera ningún thumbnail real: la imagen se guarda tal cual se sube y el frontend solo la recorta visualmente con `object-cover`; queda pendiente evaluar si conviene redimensionar en el backend al subir.

Se confirmó (probando con un espacio demo, que no tiene `PhotoPaths` propio — ver `DemoSpaceSeeder`) el comportamiento esperado de la prioridad 1→2→3 de arriba: mientras un `Space` no tenga fotos propias, `EditSpaceModal.tsx` muestra las fotos del perfil del anfitrión (`HostProfile.HomePhotoPaths`) como fallback. Apenas se sube la primera foto real, `ToPhotoUrls` pasa a usar únicamente `PhotoPaths` y esas fotos de fallback dejan de mostrarse — no se borra nada de la base, solo dejan de ser lo que se ve. Es el comportamiento correcto, se decidió dejarlo así tal cual sin agregar aviso en el modal (ver también [[../convenciones/backend|convenciones/backend]] → Gotchas).

## Backend (implementado)
- `SpaceController` (`/api/space`):
  - `GET /api/space` — lista pública, espacios activos (`[AllowAnonymous]` — `/explorar` no requiere login, ver `App.tsx`).
  - `GET /api/space/{id}` — detalle público.
  - `GET /api/space/mine` — espacios propios (`[Authorize(Roles = "Host")]`).
  - `POST /api/space` — crear (`[Authorize(Roles = "Host")]`).
  - `POST /api/space/{id}/photos` — subir fotos (`[Authorize(Roles = "Host")]`, valida que el `Space` sea del usuario del token).
  - `PUT /api/space/{id}` — editar (`[Authorize(Roles = "Host")]`, valida dueño). Espeja los 9 campos de `CreateSpaceRequestDto` (`UpdateSpaceRequestDto`).
  - `PATCH /api/space/{id}/status` — pausar/reactivar (`[Authorize(Roles = "Host")]`, valida dueño). Body: `{ isActive: bool }`.
  - `DELETE /api/space/{id}` — eliminar (`[Authorize(Roles = "Host")]`, valida dueño). Borra también los archivos de `PhotoPaths` en disco antes de remover la fila.
  - `DELETE /api/space/{id}/photos/{index}` — borra una foto puntual por índice (`[Authorize(Roles = "Host")]`, valida dueño).
  - `PUT /api/space/{id}/photos/order` — guarda el nuevo orden de fotos, por índices (`[Authorize(Roles = "Host")]`, valida dueño).
- **(2026-09-18)** `IFileStorageService` ganó `DeleteAsync(relativePath)` (borra el archivo físico bajo `wwwroot/uploads/`, no-op si ya no existe) e `ISpaceRepository` ganó `DeleteAsync(Space)` — ambos siguiendo el mismo patrón de abstracción que ya tenían `SaveAsync`/`AddAsync`.
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

**(2026-09-15) Autogestión de espacios del anfitrión — `MySpacesPage.tsx` / `NewSpacePage.tsx`:**
- `types/space.ts`: se agregó `CreateSpacePayload`, espejo exacto de `CreateSpaceRequestDto` (`title`, `description`, `location`, `neighborhood`, `hostType`, `price`, `purpose`, `duration`, `amenities` — nada más; el modelo `Space` no tiene dormitorios, baño privado, mascotas, fumador ni generación preferida, así que el formulario no pregunta nada de eso).
- `spaceService.ts`: se agregaron `getMine(token)` (`GET /api/space/mine`), `createSpace(token, payload)` (`POST /api/space`) y `uploadPhotos(token, spaceId, files)` (`POST /api/space/{id}/photos`), todos con el patrón `authHeaders(token)` + `apiFetch` ya usado en el resto de los services.
- `MySpacesPage.tsx` (`/mis-espacios`, `ProtectedRoute` sin `requireAdmin`, mismo criterio que `InterestedStudentsPage.tsx`): grilla de las publicaciones del host (`getMine`), con estado de carga/error/vacío igual al resto de las páginas del proyecto. Cada card tiene un botón "Ver publicación" (a `/espacios/:id`) y un botón "Publicar espacio" arriba (a `/mis-espacios/nuevo`). **No tiene** botones de "Editar" ni "Pausar/Reactivar" — quedó un comentario `TODO` explícito en el código: no hay `PUT`/`PATCH` en el backend todavía (ver Pendiente).
- `NewSpacePage.tsx` (`/mis-espacios/nuevo`): formulario de una sola pantalla (no wizard — el contrato real (`CreateSpaceRequestDto`) es chico, no justificaba un wizard de varios pasos como se había mockeado al principio). Reusa `PURPOSE_LABELS`/`DURATION_LABELS` de `types/filters.ts`. Comodidades (`amenities`) como input de tags de texto libre (coincide con como `Space.Amenities` se guarda y se muestra en `SpaceDetailsModal.tsx` — no es un checklist fijo). Llama `createSpace` y, si se cargaron fotos, encadena `uploadPhotos`; redirige a `/mis-espacios` al terminar.
- **Nav:** el único punto de entrada a estas dos páginas hoy es `Header.tsx` (para el rol Host, dentro del menú — hamburguesa en mobile, `menu-horizontal` en desktop): se reemplazó el link único "Descubrir Perfiles" por dos links, "Interesados" (`/interesados`) y "Mis espacios" (`/mis-espacios`). `FloatingNav.tsx` (la barra flotante circular en desktop / tab bar inferior en mobile, siempre visible) se dejó **sin tocar a propósito** — sigue con los mismos 3 accesos de siempre (Inicio/Mensajes/Asesorías). Fue una decisión explícita de alcance, no un olvido.

**(2026-09-18) Autogestión completa — Editar/Pausar/Eliminar + galería de fotos:**
- `types/space.ts`: `Space` ahora incluye `isActive: boolean`. Nuevo `UpdateSpacePayload` (alias de `CreateSpacePayload` — mismo contrato que espera `PUT /api/space/{id}`).
- `spaceService.ts`: 5 funciones nuevas — `updateSpace`, `updateSpaceStatus`, `deleteSpace`, `deleteSpacePhoto`, `reorderSpacePhotos` — mismo patrón `authHeaders(token)` + `apiFetch` que el resto del archivo.
- `MySpacesPage.tsx`: cada card pasó de tener solo "Ver publicación" a tener tres botones más: Editar (ícono lápiz, abre el modal), Pausar/Reactivar (el ícono cambia según `isActive`, llama a `updateSpaceStatus` directo, sin abrir modal) y Eliminar (ícono tacho). Eliminar **no** usa `window.confirm` — reemplaza la fila de botones por una confirmación inline ("¿Eliminar esta publicación?" + Cancelar/Eliminar) dentro de la misma card, consistente con el resto de la UI. El subtítulo de la página pasó de "`N` publicaciones activas" a "`N` publicaciones · `M` activas", para que se note de un vistazo cuántas están pausadas. Una card pausada muestra la foto atenuada (`grayscale brightness-90`) y un chip "Pausado" en vez del de "Verificado".
- `EditSpaceModal.tsx` (nuevo, `components/features/spaces/`): sigue el mismo patrón `<dialog>` nativo + DaisyUI, controlado por ref (`showModal()`/`close()`), que ya usaban `SpaceDetailsModal.tsx` y `LoginModal.tsx` — se prefirió reusar ese patrón antes que armar un modal `fixed`/`position: absolute` a mano. Expone Título, Precio, Barrio, Descripción, el switch de "Publicación activa" y la galería de fotos (ver abajo). Los campos que `UpdateSpaceRequestDto` exige pero el modal no expone (`Location`, `HostType`, `Purpose`, `Duration`, `Amenities`) se mandan tal cual estaban al guardar — decisión de alcance para esta iteración, no hay forma de editarlos desde acá todavía (ver Pendiente). **(2026-09-22)** La grilla de miniaturas pasó de `flex flex-wrap` con tamaño fijo (`w-16 h-16`, y luego se probó `w-35 h-35`, que en Tailwind v4 equivale a 140px y no a 35px — el número se multiplica por `0.25rem`) a `grid grid-cols-[repeat(auto-fill,minmax(8.75rem,1fr))] gap-2`, con cada foto en `aspect-square w-full`: las fotos ocupan un mínimo de 140px pero se reparten el ancho sobrante de la fila entre las que entraron, sin dejar hueco vacío al final (lo que sí pasaba con `flex-wrap`, que alinea a la izquierda y no estira los ítems).
  - Galería: cada foto tiene botones de mover antes/después (llaman a `reorderSpacePhotos` con el nuevo orden por índices, y revierten el estado local si falla) y de borrar (`deleteSpacePhoto`); un tile punteado "Agregar" reusa `uploadPhotos` (el mismo endpoint que ya usaba `NewSpacePage.tsx`). La primera foto de la lista siempre es la portada (coincide con `ImageUrl` del DTO).
  - Guardar llama a `updateSpace` y, solo si el switch de estado cambió respecto al valor original, encadena `updateSpaceStatus` — son dos requests porque son dos endpoints separados en el backend.

## Interacciones

**Backend:** `SpaceController` (`/api/space`) → `SpaceService` → `SpaceRepository`. `SpaceService` además depende de `IFileStorageService` (fotos) y — solo lectura — de `IProfileRepository` (fallback de fotos a `HostProfile.HomePhotoPaths`, ver [[Perfiles]]).

| Endpoint | Auth | Service / método |
|---|---|---|
| `GET /api/space` | público | `GetActiveSpacesAsync` |
| `GET /api/space/{id}` | público | `GetSpaceByIdAsync` |
| `GET /api/space/mine` | `Host` | `GetMySpacesAsync` |
| `POST /api/space` | `Host` | `CreateSpaceAsync` |
| `POST /api/space/{id}/photos` | `Host`, dueño del Space | `UploadPhotosAsync` |
| `PUT /api/space/{id}` (editar) | `Host`, dueño del Space | `UpdateSpaceAsync` |
| `PATCH /api/space/{id}/status` (pausar/activar) | `Host`, dueño del Space | `UpdateSpaceStatusAsync` |
| `DELETE /api/space/{id}` (eliminar) | `Host`, dueño del Space | `DeleteSpaceAsync` |
| `DELETE /api/space/{id}/photos/{index}` (borrar foto) | `Host`, dueño del Space | `DeleteSpacePhotoAsync` |
| `PUT /api/space/{id}/photos/order` (reordenar fotos) | `Host`, dueño del Space | `ReorderSpacePhotosAsync` |

**Frontend:** `services/spaceService.ts` — vía `apiFetch`, ver [[../convenciones/http-client|convenciones/http-client]]. **(2026-09-18)** Ya conecta los 10 endpoints reales del backend: `getSpaces`, `getSpaceById`, `getMine`, `createSpace`, `uploadPhotos`, `updateSpace`, `updateSpaceStatus`, `deleteSpace`, `deleteSpacePhoto`, `reorderSpacePhotos`.

| Componente/página | Función usada | Contexto |
|---|---|---|
| `pages/ExploreSpacesPage.tsx` | `getSpaces` | Grilla/perfil de espacios (`/explorar`) |
| `components/features/landing/ExploreSpaces.tsx` | `getSpaces` | Preview de 3 espacios en la landing |
| `pages/SpaceDetailPage.tsx` | `getSpaceById` | Ficha de un espacio (`/espacios/:id`) |
| `pages/MySpacesPage.tsx` | `getMine`, `updateSpaceStatus`, `deleteSpace` | Publicaciones propias del host (`/mis-espacios`) |
| `pages/NewSpacePage.tsx` | `createSpace`, `uploadPhotos` | Alta de publicación (`/mis-espacios/nuevo`) |
| `components/features/spaces/EditSpaceModal.tsx` | `updateSpace`, `updateSpaceStatus`, `deleteSpacePhoto`, `reorderSpacePhotos`, `uploadPhotos` | Modal de edición, abierto desde `MySpacesPage.tsx` |

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
- ~~`PUT /api/space/{id}` (editar) y `PATCH /api/space/{id}/status` (pausar/activar)~~ — **(2026-09-18) implementados**, junto con `DELETE /api/space/{id}` y el borrado/reordenado de fotos por índice (`DELETE /{id}/photos/{index}`, `PUT /{id}/photos/order`). Se implementó con luz verde explícita del cliente en el momento (ver [[../convenciones/backend|convenciones/backend]] → Ways of working) pero **antes** de tener la confirmación de Lucía sobre el alcance final de "Interesados"/"Mis espacios" — si ese alcance termina siendo distinto (ej. que el precio no se edite después de publicado, o que pausar pida un motivo), va a requerir un ajuste puntual sobre lo ya construido, no una reescritura.
- `EditSpaceModal.tsx` no expone `Location`, `HostType`, `Purpose`, `Duration` ni `Amenities` — si hace falta editarlos desde ahí, el backend ya los acepta (`UpdateSpaceRequestDto` pide los mismos 9 campos que `CreateSpaceRequestDto`), solo falta agregarlos al formulario.
- `NewSpacePage.tsx` ya permite subir fotos propias de un `Space` real vía `POST /{id}/photos` — el fallback a `HostProfile.HomePhotoPaths` ahora es solo para publicaciones sin fotos propias.
- Reemplazar `ExternalImageUrl` (solo usado por los 3 espacios demo) por fotos reales a medida que los hosts reales publiquen desde `NewSpacePage.tsx`.
- Evaluar filtrado server-side si el volumen de `Space` crece (hoy trae todo y filtra en el cliente).
- ⚠️ Ver [[Match]]: no está resuelto si `ApplicationsList.jsx`/`IncomingRequests.jsx` (modelo de "solicitud a un Space puntual") conviven con el like mutuo del módulo Match, o quedan obsoletos.
- El feedback de "¡Es un match!" (`LikeResponseDto.isMatch`) hoy solo cambia el estado del botón (✓ verde con texto "¡Le diste Like!" — a propósito no dice "match" ahí, porque el `Match` real recién se confirma cuando la contraparte también da like); no dispara ninguna notificación ni redirige al chat — evaluar si corresponde acá o al construirse el chat en tiempo real.

## Enlaces relacionados
- [[../00-Roadmap|00-Roadmap]]
- [[Match]]
- [[Perfiles]]
- [[../convenciones/backend|convenciones/backend]]
