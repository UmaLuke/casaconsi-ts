tags: [modulo, backend]

# Módulo: Match

**Estado:** ✅ Backend del like mutuo implementado y migrado a `db_ccs`. Falta conectar el frontend (feed/carrusel de `MessagesPage.tsx`) a estos endpoints.

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
- **No conectado todavía:** `GET /api/match/feed` y `POST /api/match/like` — no existe ninguna pantalla de swipe/descubrimiento en el frontend. Es una superficie de UI nueva a diseñar (ver Roadmap).

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
