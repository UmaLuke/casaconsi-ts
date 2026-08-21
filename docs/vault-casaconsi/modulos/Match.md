tags: [modulo, backend]

# Módulo: Match

**Estado:** ✅ Backend del like mutuo implementado y migrado a `db_ccs`. Los tres endpoints están conectados en el frontend: `GET /api/match` en `MessagesPage.tsx`, `POST /api/match/like` desde [[Space]] (`ExploreSpacesPage`/`SpaceDetailsModal`) y desde `DiscoverPage.tsx` (nuevo, swipe sobre `GET /api/match/feed`).

## Decisión: modelo de matching básico (gratis)
Se definió que el match básico (el del modelo freemium gratuito, no confundir con el "Match asistido" pago del [[../glosario|glosario]]) funciona por **like mutuo, estilo Tinder**:
- Los perfiles se muestran en un feed/carrusel (sección "Match's" de `MessagesPage.tsx`, ver Roadmap).
- Estudiante y anfitrión se marcan como "interesado" independientemente.
- Cuando ambos se marcaron mutuamente, se crea el `Match` y se habilita el chat (`Mensajes`).

Esto resuelve la pregunta abierta que tenía este documento antes ("¿manual asistido o algorítmico?"): el básico es algorítmico (like mutuo); el "Match asistido" pago (intervención humana de CASA CON SI) es una capa aparte, sobre este mismo mecanismo — no un reemplazo.

## Entidades (implementadas)
- `ProfileLike`: un "swipe" — la decisión de una persona (Student u Host) sobre el perfil de la otra. Un mismo par (`StudentUserId`, `HostUserId`) puede tener hasta dos filas, una por `DecidedByRole`. Índice único en (`StudentUserId`, `HostUserId`, `DecidedByRole`). FK a `AspNetUsers`: `Cascade` en `StudentUserId`, `Restrict` en `HostUserId` (decisión de diseño, no limitación técnica — ver comentario en `ApplicationDbContext.cs`).
- `Match`: se crea cuando existen las dos `ProfileLike` de un par (Student, Host) y ambas son `Liked = true`. Índice único en (`StudentUserId`, `HostUserId`). Misma política de FK que `ProfileLike`. Es lo que habilita la conversación (chat, todavía sin construir).
- Migración: `AddMatch` (`20260723214859_AddMatch`), aplicada a `db_ccs`.

## Backend (implementado)
- `MatchController` (`/api/match`, `[Authorize]`), igual que `ProfileController`: siempre opera sobre el usuario del token, nunca sobre un id que mande el cliente.
  - `GET /api/match/feed` — perfiles del rol opuesto que el usuario todavía no swipeó (sin filtro por generación todavía, ver más abajo).
  - `POST /api/match/like` — body `{ targetUserId, liked }`. Registra el swipe; si genera like mutuo, crea el `Match` y devuelve `{ isMatch: true, matchId }`.
  - `GET /api/match` — matches confirmados del usuario, con nombre y foto del contraparte (vía `IProfileRepository`, reutilizado de [[Perfiles]]).
- `MatchController` → `MatchService` → `MatchRepository`, respetando la separación de capas.
- DTOs públicos (`MatchFeedItemDto`, `MatchSummaryDto`) nunca incluyen `Health` ni `Dni` — solo nombre, foto, "sobre mí" y zona(s).

## Regla de generación: implementada
Se encontró que `frontend/src/types/filters.ts` ya define la regla real de negocio: `canMatch` exige generaciones **distintas** (`joven-adulto` ≠ `adulto-mayor`) — "el corazón del modelo de Solidaridad Intergeneracional". Es más fuerte que el `PreferredGeneration` (soft, con "indiferente") de las secciones del cuestionario.

Implementado en el backend en dos puntos (`MatchService`):
- `GetFeedAsync` — el feed solo devuelve perfiles de la generación opuesta a la del usuario (`MatchRepository.GetHostProfilesForFeedAsync`/`GetStudentProfilesForFeedAsync`, filtrando por `ApplicationUser.Generation`).
- `RegisterDecisionAsync` — valida de nuevo antes de registrar el like/pass (`EnsureOppositeGenerationAsync`), para no depender solo de que el frontend respete el feed filtrado.

Si alguna de las dos partes todavía no completó el cuestionario (`Generation == null`), se rechaza con un mensaje claro en vez de dejar pasar el match.

`StudentHostPreferences.PreferredGeneration` / `HostTenantPreferences.PreferredGeneration` (el campo granular del cuestionario, con "indiferente") queda sin usar por el matching — es una pregunta del formulario que hoy no filtra nada. Pendiente decidir si se usa como filtro secundario/de UI más adelante o se saca del cuestionario.

## Frontend
- `MessagesPage.tsx`, sección "Match's": conectada a `GET /api/match` (matches confirmados) vía `matchService.ts` — carrusel horizontal con foto/nombre de la contraparte, estados de loading/error/vacío.
- **(2026-08-13, bug de UI corregido)** La sección "Match's" estaba apilada (título/descripción arriba, cards en fila abajo) — el pedido de QA era reubicar las cards a la derecha del texto, dentro de un recuadro. Layout final: `flex flex-col md:flex-row` con el texto en `md:shrink-0` (ancho natural, sin caja) y el contenido (spinner/error/vacío/cards) en `md:flex-1` con `border border-base-200 rounded-2xl` — el recuadro envuelve **solo** el contenido, no el texto. Una primera versión envolvía todo (texto incluido) en un único `div` con borde — se descartó porque indentaba "Match's" respecto a "Mensajes" (la sección de abajo, sin caja), rompiendo la alineación de los dos títulos al mismo margen izquierdo. En mobile se sigue apilando igual que antes. El match más nuevo aparece primero (más a la izquierda) porque `MatchService.GetMatchesAsync` ya ordena por `CreatedAt` descendente (ver Backend arriba) y `matches.map` renderiza en ese orden — no requirió ningún cambio de backend ni de `matchService.ts`.
- `matchService.registerLikeDecision(token, targetUserId, liked)`: pega a `POST /api/match/like`, devuelve `LikeResponse` (`isMatch`, `matchId`). Tiene dos consumidores:
  - [[Space]] — `ExploreSpacesPage.tsx` manda `space.hostUserId` como `targetUserId` cuando el estudiante usa los botones ✕/✓ de `MatchDecisionButtons` (en la card o en `SpaceDetailsModal`). Ahí el contexto es "estoy mirando este Space puntual".
  - `DiscoverPage.tsx` (nuevo, ver abajo) — mismo componente `MatchDecisionButtons`, pero sobre `currentItem.userId` del feed. Ahí el contexto es el swipe tipo Tinder clásico.
  - En ambos casos, errores de negocio (generación igual, perfil incompleto, sin sesión) se muestran como toast/alert en la página, no bloquean la app.
- `matchService.getFeed(token)` (nuevo): pega a `GET /api/match/feed`, devuelve `MatchFeedItem[]` (`userId`, `fullName`, `profilePhotoUrl`, `presentationMediaUrl`, `aboutMe`, `neighborhoods`).
- `DiscoverPage.tsx` (nuevo, ruta `/descubrir`, dentro de `ProtectedRoute` sin `requireAdmin` — redirige a `/` si no hay sesión): pantalla de descubrimiento tipo swipe, un perfil a la vez (`queue[0]`). Al decidir (✕/✓), llama a `registerLikeDecision` y, si la request fue bien, saca el perfil de la cola (`queue.slice(1)`) y pasa al siguiente automáticamente — no hace falta mostrar el estado `liked`/`passed` de `MatchDecisionButtons` porque la card entera desaparece. Si `isMatch` es `true`, muestra un banner "¡Es un match con {nombre}!". `presentationMediaUrl` (video de presentación) todavía no se usa en esta pantalla — pendiente si se agrega.
- Quién ve la pantalla: el backend resuelve el rol desde el JWT (Student ve Hosts, Host ve Students), el frontend no distingue. Hoy el nav del `Header` solo linkea `/descubrir` para `user.role === 'host'` ("Descubrir Perfiles"), y `LoginModal` redirige ahí después del login si el rol es Host (antes mandaba a todos, estudiantes y anfitriones, a `/explorar` — por eso Rosa Martínez veía la pantalla de Espacios en vez de perfiles de estudiantes). El estudiante en teoría también podría usarla directamente si navega a la ruta, pero su flujo principal sigue siendo `/explorar` (Espacios).
- `FloatingNav.tsx` (el nav flotante circular a la izquierda): el ítem "Inicio" era un array estático (`NAV_ITEMS`) hardcodeado a `/explorar` para cualquier rol — quedó igual de desactualizado que `LoginModal` y por la misma razón. Ahora `navItems` se arma dentro del componente según `user.role` (`host` → `/descubrir`, si no → `/explorar`).

## Interesados en tu publicación (host ve estudiantes interesados) — (2026-08-21)

Nueva feature, pedida por la clienta como "que el host vea en cuadrícula los usuarios que buscan su publicación, igual que un estudiante ve los `Space`s de un host". **Construida (backend + frontend), pendiente de probar en vivo y de confirmar con la clienta** — no marcar como cerrada en el Roadmap hasta esa validación.

No agrega entidades nuevas ni migración: es una consulta distinta sobre `ProfileLike`, la misma tabla del like mutuo (ver "Entidades" arriba). La diferencia con `GetFeedAsync` (el feed de descubrimiento):
- `GetFeedAsync` trae candidatos que **ninguna de las dos partes** decidió todavía.
- Esta trae estudiantes que **ya dieron like al host** (`DecidedByRole = Student, Liked = true`) y sobre los que **el host todavía no decidió** (no existe fila con `DecidedByRole = Host` para ese par) — es decir, interesados pendientes de respuesta del host.

**Backend:**
- `IMatchRepository.GetInterestedStudentProfilesAsync(hostUserId)` (`MatchRepository`): la query de arriba, devuelve `List<StudentProfile>`.
- `MatchService` pasó a depender también de `ITrustService` (mismo patrón ya usado en `SpaceService` para exponer el puntaje de confianza del host en `SpaceResponseDto`) — inyectado por constructor, sin cambios en `Program.cs` porque `ITrustService` ya estaba registrado.
- `GetInterestedStudentsAsync(hostUserId)` → `List<InterestedStudentDto>` (`UserId`, `FullName`, `ProfilePhotoUrl`, `StudyOrWorkSummary`, `TrustScore`, `TrustLevel`). `StudyOrWorkSummary` es un texto armado en el backend (`BuildStudyOrWorkSummary`) a partir de `StudentTravelReason.Reason` (`estudios`/`trabajo`/`proyecto-personal`/`otro`) + `StudyDetails`/`WorkDetails`/`ReasonOther` — no existe un campo "carrera/oficio" dedicado en el cuestionario, se deriva de ahí.
- `GetInterestedStudentDetailAsync(hostUserId, studentUserId)` → `StudentDetailDto` (perfil completo: fotos de la galería del usuario — `ApplicationUser.GalleryPhotoPaths` —, `AboutMe`, `Motivation`, `PreferredNeighborhoods`, `StudyOrWorkSummary`, `StayDuration`, `Generation`, puntaje/nivel de confianza). Antes de devolver nada, verifica con `_matchRepository.GetDecisionAsync(studentUserId, hostUserId, UserRole.Student)` que ese estudiante realmente le dio like a este host — si no, `403` (`UnauthorizedAccessException`), evita que un host consulte el detalle de cualquier estudiante por id.
- Dos endpoints nuevos en `MatchController`, ambos `[Authorize(Roles = "Host")]` (a diferencia del resto de `/api/match`, que es `[Authorize]` genérico y resuelve el rol adentro):
  - `GET /api/match/interested` → lista para la cuadrícula.
  - `GET /api/match/interested/{studentUserId}` → detalle.

**Frontend:**
- `types/match.ts`: `InterestedStudent`, `StudentDetail` (espejo de los DTOs).
- `services/matchService.ts`: `getInterestedStudents`, `getInterestedStudentDetail` — mismo criterio que el resto del archivo, **no** resuelven URLs de fotos a absolutas (a diferencia de `spaceService.ts`), eso lo hace cada página al renderizar (`${API_URL}${path}`).
- `components/common/TrustBadgeCompact.tsx` (ya existía, creado para `SpaceDetailPage`): se le agregó `hideLabel?: boolean` para poder mostrar solo el anillo de puntaje (sin la etiqueta de nivel al lado) superpuesto en la foto de cada card de la cuadrícula.
- `pages/InterestedStudentsPage.tsx` (nueva, ruta `/interesados`): cuadrícula de cards (foto, nombre, `studyOrWorkSummary`, anillo de confianza), estados de loading/error/vacío. Al hacer click en una card, navega a `/interesados/:studentUserId`.
- `pages/StudentDetailPage.tsx` (nueva, ruta `/interesados/:studentUserId`): detalle a página completa, mismo layout de referencia que `SpaceDetailPage.tsx` (foto grande arriba, nombre + `TrustBadgeCompact`, chips de zona/motivo/duración, generación, "Sobre mí"/"Motivación", y `MatchDecisionButtons` para que el host decida ✕/✓ — reutiliza `registerLikeDecision`, el mismo endpoint `POST /api/match/like` que ya usa `DiscoverPage`/`ExploreSpacesPage`).
- `App.tsx`: ambas rutas nuevas registradas con `<ProtectedRoute>` genérico (sin gate de rol en el cliente) — mismo criterio que `/descubrir`: el backend ya rechaza con `403` a quien no sea Host, no se duplica esa validación en el frontend.

**Pendiente:**
- No hay link en `Header.tsx`/`FloatingNav.tsx` hacia `/interesados` todavía — hoy se accede escribiendo la URL a mano. Falta agregarlo (al lado de "Descubrir Perfiles", visible solo para `role === 'host'`) una vez que la clienta confirme el diseño.
- Sin probar en vivo con datos reales todavía.

## Interacciones

**Backend:** `MatchController` (`/api/match`, `[Authorize]`, salvo `interested`/`interested/{id}` que son `[Authorize(Roles = "Host")]`) → `MatchService` → `MatchRepository`. `MatchService` además usa — solo lectura — `IProfileRepository` (armar los DTOs públicos con nombre/foto, ver [[Perfiles]]) e `ITrustService` (puntaje/nivel de confianza, ver [[Confianza]]).

| Endpoint | Service / método |
|---|---|
| `GET /api/match/feed` | `GetFeedAsync` (filtra por generación opuesta) |
| `POST /api/match/like` | `RegisterDecisionAsync` (crea `Match` si hay like mutuo) |
| `GET /api/match` | `GetMatchesAsync` |
| `GET /api/match/interested` | `GetInterestedStudentsAsync` (solo Host) |
| `GET /api/match/interested/{studentUserId}` | `GetInterestedStudentDetailAsync` (solo Host) |

**Frontend:** `services/matchService.ts` (`getFeed`, `registerLikeDecision`, `getMatches`, `getInterestedStudents`, `getInterestedStudentDetail`) — vía `apiFetch`, ver [[../convenciones/http-client|convenciones/http-client]]. Es el service con más consumidores cruzados del frontend:

| Componente/página | Función usada | Contexto |
|---|---|---|
| `pages/MessagesPage.tsx` | `getMatches` | Sección "Match's" (matches confirmados) |
| `pages/DiscoverPage.tsx` | `getFeed`, `registerLikeDecision` | Swipe clásico sobre el feed (`/descubrir`) |
| `pages/ExploreSpacesPage.tsx` | `registerLikeDecision` | Botones ✕/✓ sobre un `Space`, usa `space.hostUserId` como `targetUserId` — ver [[Space]] |
| `components/features/landing/ExploreSpaces.tsx` | `registerLikeDecision` | Mismo botón, versión preview de la landing |
| `pages/InterestedStudentsPage.tsx` | `getInterestedStudents` | Cuadrícula "Interesados en tu publicación" (`/interesados`, solo Host) |
| `pages/StudentDetailPage.tsx` | `getInterestedStudentDetail`, `registerLikeDecision` | Detalle de un estudiante interesado + decisión ✕/✓ (`/interesados/:studentUserId`) |

Dos flujos distintos llegan al mismo endpoint `POST /api/match/like` con distinto origen del `targetUserId` — uno desde el feed de perfiles (`DiscoverPage`), otro desde un `Space` puntual (`ExploreSpacesPage`/landing). El backend no distingue el origen, solo valida generación opuesta y arma/no arma el `Match`.

```
DiscoverPage.tsx (swipe ✓ sobre currentItem)
  → registerLikeDecision(token, currentItem.userId, true)   [matchService.ts]
    → apiFetch('/api/match/like', { method: 'POST', ... })   [httpClient.ts]
      → MatchController.Like → MatchService.RegisterDecisionAsync
          ↳ EnsureOppositeGenerationAsync → MatchRepository (crea ProfileLike, y Match si hay mutuo)
    ← LikeResponseDto { isMatch, matchId }
  → si isMatch: banner "¡Es un match!" · siempre: saca el perfil de la cola
```

## ⚠️ Inconsistencia a revisar con el frontend
La Fase 2 del Roadmap (frontend) describe `ApplicationsList.jsx` / `IncomingRequests.jsx` con estados "Pendiente / En Entrevista / Aceptada" — eso corresponde a un modelo de **solicitud/aplicación a un Space puntual**, no al like mutuo recién decidido. Falta confirmar si:
- Ambos modelos conviven (like mutuo primero → luego, ya con Match, el estudiante aplica a un Space concreto del anfitrión), o
- Esas vistas de frontend quedan obsoletas y hay que reemplazarlas.

No asumir — confirmar antes de tocar `ApplicationsList.jsx` / `IncomingRequests.jsx`.

## Preguntas abiertas restantes
- ¿Cómo se relaciona exactamente con el chat en tiempo real (SignalR)? Definido que el Match lo habilita, pero falta diseñar el `Conversation`/`Message` y el Hub.
- ¿El "Match asistido" (pago) agrega una entidad propia, o es un flag/estado sobre el `Match` básico?

## Datos de prueba
- Ya existen perfiles demo (`DemoProfileSeeder`, ver [[../datos-demo|datos-demo]]) para probar la UI antes de que este módulo tenga lógica real.

## Enlaces relacionados
- [[../00-Roadmap|00-Roadmap]]
- [[Perfiles]]
- [[Space]]
- [[../convenciones/backend|convenciones/backend]]
- [[../glosario|glosario]]
