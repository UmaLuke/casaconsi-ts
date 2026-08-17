tags: [modulo, backend, frontend]

# Módulo: Chat

**Estado:** ✅ Backend cerrado (entidades, `ChatHub` SignalR, endpoints REST, migración aplicada). ✅ Frontend funcional de punta a punta (mensajería en tiempo real conectada en `MessagesPage.tsx`) — **queda abierto para mejoras de UI/UX**, ver sección al final.

Habilitado por un `Match` confirmado (like mutuo, ver [[Match]]): una vez que existe el `Match`, la conversación queda disponible sin pasos adicionales.

## Decisión: sin entidad `Conversation` separada
`Match` ya es la conversación 1:1 (par único Student/Host, ver [[Match]]). En vez de agregar una entidad `Conversation` intermedia, `Message` cuelga directo de `MatchId` — menos una tabla, un join menos en cada query, y el `matchId` funciona como identificador de conversación tanto en el REST como en los grupos de SignalR.

## Entidades (implementadas)
- `Message`: `Id`, `MatchId` (FK a `Match`, `Cascade` — si se borra el `Match` se borran sus mensajes), `SenderUserId` (FK a `AspNetUsers`, `Restrict`, mismo criterio que `ProfileLike`/`Match`), `Content` (`varchar(4000)`), `CreatedAt`. Índices en `MatchId` y `CreatedAt`.
- Migración: `AddChat` (`20260817025719_AddChat`), aplicada a `db_ccs`.

## Backend (implementado)
- `ChatController` (`/api/chat`, `[Authorize]`), mismo criterio que `MatchController`/`ProfileController`: opera sobre el usuario del token, nunca sobre un id que mande el cliente.
  - `GET /api/chat` — conversaciones del usuario (una por `Match`), con nombre/foto de la contraparte (vía `IProfileRepository`, reutilizado) y preview del último mensaje.
  - `GET /api/chat/{matchId}/messages` — historial completo de una conversación, orden cronológico ascendente. 403 si el usuario no es Student ni Host de ese `Match`.
- `ChatController` → `ChatService` → `ChatRepository`, respetando la separación de capas. `ChatService` además usa — solo lectura — `IMatchRepository` (listar matches del usuario) e `IProfileRepository` (nombre/foto de la contraparte).
- `IChatService.EnsureParticipantAsync(userId, matchId)`: valida que el usuario sea Student o Host del `Match` antes de leer/escribir. La usan tanto `ChatController` como `ChatHub` — un solo lugar para esa regla.
- **`Hubs/ChatHub.cs`** (`/hubs/chat`, `[Authorize]`): sin REST para enviar mensajes, todo pasa por acá.
  - `JoinConversation(matchId)` / `LeaveConversation(matchId)`: suman/sacan la conexión del grupo de SignalR `match-{matchId}`, validando participación con `EnsureParticipantAsync`.
  - `SendMessage(matchId, content)`: persiste vía `ChatService.SendMessageAsync` y hace `Clients.Group("match-{matchId}").SendAsync("ReceiveMessage", messageDto)` — le llega a todos los conectados a esa conversación, incluido quien lo mandó (así el remitente ve su propio mensaje aparecer igual que el resto, sin duplicar lógica en el frontend).
  - Errores de negocio (`InvalidOperationException`/`UnauthorizedAccessException`) se relanzan como `HubException` para que el cliente los vea (si no, SignalR devuelve un error genérico sin mensaje).

## Gotcha: JWT + SignalR + CORS
El cliente WebSocket no puede mandar el header `Authorization` en el handshake — SignalR JS lo resuelve mandando el token por query string (`?access_token=...`). Dos ajustes necesarios que no son obvios:

1. **Backend** (`Program.cs`, dentro de `AddJwtBearer`): agregar `options.Events = new JwtBearerEvents { OnMessageReceived = ... }` que lea `access_token` de la query string y lo asigne a `context.Token`, filtrado por `path.StartsWithSegments("/hubs/chat")`. Sin esto, `ChatHub` rechaza toda conexión con 401 aunque el token sea válido.
2. **Frontend** (`chatService.ts`, `createChatConnection`): `HubConnectionBuilder().withUrl(...)` manda `withCredentials: true` **por default**. Como acá no se usan cookies (auth 100% por JWT vía `accessTokenFactory`), esa credencial de más choca con la política CORS del backend (que no tiene `.AllowCredentials()`, a propósito) y el navegador bloquea la conexión en el negotiate con un error de CORS — sin ningún error claro del lado del Hub, porque nunca llega. Se resuelve seteando `withCredentials: false` explícito en las opciones de `withUrl`. **No** hace falta (ni conviene) agregar `.AllowCredentials()` en el backend para esto — sería aflojar la política CORS sin necesidad, ya que no hay cookies de por medio.

Caveat menor que queda así a propósito: el JWT viaja en la URL de la request de negotiate/WebSocket, lo que puede terminar en logs de acceso del servidor o de un proxy intermedio. Se mitiga con HTTPS en producción y tokens de vida corta (`expiresAt` + auto-logout, ver [[decisiones/ADR-0002-persistencia-jwt]]) — no se consideró necesario nada adicional para el alcance actual.

## Frontend (implementado)
- `src/types/chat.ts`: `ConversationSummary`, `ChatMessage` — espejo de `ConversationSummaryDto`/`MessageDto`.
- `src/services/chatService.ts`: `getConversations`/`getMessages` (REST vía `apiFetch`) + `createChatConnection(token)` (arma el `HubConnection` apuntando a `${API_URL}/hubs/chat`, `API_URL` centralizado en `config.ts` como el resto del proyecto).
- `MessagesPage.tsx`, sección "Mensajes" (reemplaza el placeholder anterior): lista de conversaciones a la izquierda + panel de chat a la derecha. Una sola conexión SignalR por sesión (no una por conversación); al cambiar de conversación seleccionada se hace `JoinConversation`/`LeaveConversation` del grupo correspondiente. Historial se carga por REST al seleccionar una conversación; los mensajes nuevos llegan por el evento `ReceiveMessage` y se anexan si coinciden con la conversación abierta (usa un `ref` para no depender de closures viejas del `useEffect` de conexión).

## Mejoras pendientes (frontend)
Backend cerrado y estable; lo que sigue es pulido de UI/UX, no funcionalidad crítica:
- Layout del panel de chat (hoy es una primera versión funcional, sin pasar por una vuelta de diseño con el cliente como sí tuvo la sección "Match's").
- Estados de conexión/reconexión visibles para el usuario (hoy `isConnected` solo se usa para habilitar/deshabilitar el envío, no hay indicador visual de "conectando..."/"desconectado").
- Historial sin paginar (`GetMessagesAsync` trae todo el historial completo) — no es un problema con el volumen de datos demo, pero conviene paginar antes de tener conversaciones largas reales.
- Sin indicador de mensaje enviado/entregado/leído (decisión de alcance del MVP, ver Roadmap — evaluar si se agrega más adelante).
- Sin notificación (badge/toast) de mensaje nuevo si el usuario no tiene `/mensajes` abierto.

## Datos de prueba
Mismos perfiles demo que [[Match]] (`DemoProfileSeeder`) — para probar hace falta que dos usuarios demo tengan un `Match` confirmado (like mutuo desde `/descubrir` o `/explorar`).

## Enlaces relacionados
- [[../00-Roadmap|00-Roadmap]]
- [[Match]]
- [[../convenciones/backend|convenciones/backend]]
- [[../convenciones/http-client|convenciones/http-client]]
- [[../decisiones/ADR-0002-persistencia-jwt|ADR-0002]]
