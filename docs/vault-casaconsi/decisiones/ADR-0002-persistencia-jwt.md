tags: [adr, frontend, auth]

# ADR-0002: Estrategia de persistencia del JWT en el frontend

- **Fecha:** (implementado antes de documentarse formalmente acá — corregido al encontrar el código real)
- **Estado:** Aceptada

## Contexto
El módulo Auth del backend ya está verificado end-to-end (`/api/auth/register`, `/api/auth/login`). Falta definir dónde y cómo persistir el JWT en el frontend antes de conectar `AuthContext`, `LoginModal.tsx` y `RegisterPage.tsx` a los endpoints reales.

## Opciones consideradas
1. **`localStorage`**
   - Ventaja: simple, persiste entre recargas y pestañas.
   - Desventaja: expuesto a XSS (cualquier script en la página puede leerlo).
2. **Estado en memoria (React, vía `AuthContext`)**
   - Ventaja: no persiste en disco, más seguro ante XSS.
   - Desventaja: se pierde al recargar la página — requeriría un refresh token o re-login constante.
3. **Cookie `httpOnly`**
   - Ventaja: no accesible por JS, mitiga XSS.
   - Desventaja: requiere que el backend la setee (`Set-Cookie`), manejo de CSRF, y ajustar CORS/credentials entre `localhost:5173` y `localhost:8000`.

## Decisión
**`localStorage`**, clave `casaconsi_auth` (`{ user, token, expiresAt }`). `AuthContext.tsx` rehidrata la sesión al montar la app leyendo esa clave; `login()`/`logout()` la escriben/limpian.

**Actualizado 2026-08-01:** el backend siempre devolvió `expiresAt` en `AuthResponseDto` (el JWT dura 8hs, ver `TokenService.GenerateToken`), pero el frontend lo descartaba. Ahora se persiste junto a `user`/`token` y `AuthContext` lo usa para:
- Al rehidratar la sesión desde `localStorage`, chequear si `expiresAt` ya pasó y desloguear directo si es así.
- Programar un `setTimeout` (`scheduleAutoLogout`) que dispara `logout()` en el momento exacto del vencimiento, sin esperar a que el usuario navegue o haga una request.
- `logout()` (manual o automático) navega a `/` con `useNavigate()`. Para esto `App.tsx` se reordenó: `Router` ahora envuelve a `AuthProvider` (antes era al revés, y `AuthProvider` no podía usar hooks de routing). Esto resuelve el caso donde `/explorar`, `/mensajes` y `/asesorias` — públicas, sin `ProtectedRoute` — se quedaban mostrando contenido con una sesión ya vencida hasta que el usuario recargaba manualmente.

Limitación que sigue en pie: no hay endpoint `/me` para validar el token contra el backend al rehidratar, y no hay interceptor de 401. Si el backend invalida el token *antes* de su vencimiento natural (ban, cambio de rol), el cliente no lo detecta hasta que falla la primera llamada autenticada — ahí no hay `logout()` automático todavía.

## Consecuencias
- `authService.ts` y `questionnaireService.ts` ya mandan el JWT como header `Authorization: Bearer <token>` en cada request protegido (patrón `authHeaders(token)`).
- Expuesto a XSS (cualquier script en la página puede leer `localStorage`) — riesgo aceptado por ahora, no mitigado.
- Pendiente: detectar 401 en las respuestas y disparar `logout()` automáticamente (hoy no existe ese interceptor; requeriría centralizar los `fetch` de `services/*.ts` en un `httpClient.ts` común).

## Enlaces relacionados
- [[modulos/Auth]]
- [[00-Roadmap]]
