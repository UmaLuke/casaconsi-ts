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
- `matchService.registerLikeDecision(token, targetUserId, liked)`: pega a `POST /api/match/like`, devuelve `LikeResponse` (`isMatch`, `matchId`). Tiene dos consumidores:
  - [[Space]] — `ExploreSpacesPage.tsx` manda `space.hostUserId` como `targetUserId` cuando el estudiante usa los botones ✕/✓ de `MatchDecisionButtons` (en la card o en `SpaceDetailsModal`). Ahí el contexto es "estoy mirando este Space puntual".
  - `DiscoverPage.tsx` (nuevo, ver abajo) — mismo componente `MatchDecisionButtons`, pero sobre `currentItem.userId` del feed. Ahí el contexto es el swipe tipo Tinder clásico.
  - En ambos casos, errores de negocio (generación igual, perfil incompleto, sin sesión) se muestran como toast/alert en la página, no bloquean la app.
- `matchService.getFeed(token)` (nuevo): pega a `GET /api/match/feed`, devuelve `MatchFeedItem[]` (`userId`, `fullName`, `profilePhotoUrl`, `presentationMediaUrl`, `aboutMe`, `neighborhoods`).
- `DiscoverPage.tsx` (nuevo, ruta `/descubrir`, dentro de `ProtectedRoute` sin `requireAdmin` — redirige a `/` si no hay sesión): pantalla de descubrimiento tipo swipe, un perfil a la vez (`queue[0]`). Al decidir (✕/✓), llama a `registerLikeDecision` y, si la request fue bien, saca el perfil de la cola (`queue.slice(1)`) y pasa al siguiente automáticamente — no hace falta mostrar el estado `liked`/`passed` de `MatchDecisionButtons` porque la card entera desaparece. Si `isMatch` es `true`, muestra un banner "¡Es un match con {nombre}!". `presentationMediaUrl` (video de presentación) todavía no se usa en esta pantalla — pendiente si se agrega.
- Quién ve la pantalla: el backend resuelve el rol desde el JWT (Student ve Hosts, Host ve Students), el frontend no distingue. Hoy el nav del `Header` solo linkea `/descubrir` para `user.role === 'host'` ("Descubrir Perfiles"), y `LoginModal` redirige ahí después del login si el rol es Host (antes mandaba a todos, estudiantes y anfitriones, a `/explorar` — por eso Rosa Martínez veía la pantalla de Espacios en vez de perfiles de estudiantes). El estudiante en teoría también podría usarla directamente si navega a la ruta, pero su flujo principal sigue siendo `/explorar` (Espacios).
- `FloatingNav.tsx` (el nav flotante circular a la izquierda): el ítem "Inicio" era un array estático (`NAV_ITEMS`) hardcodeado a `/explorar` para cualquier rol — quedó igual de desactualizado que `LoginModal` y por la misma razón. Ahora `navItems` se arma dentro del componente según `user.role` (`host` → `/descubrir`, si no → `/explorar`).

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
