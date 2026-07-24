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
**`localStorage`**, clave `casaconsi_auth` (`{ user, token }`). `AuthContext.tsx` rehidrata la sesión al montar la app leyendo esa clave; `login()`/`logout()` la escriben/limpian.

Limitación aceptada explícitamente (comentario en el propio `AuthContext.tsx`): no hay endpoint `/me` todavía para validar el token contra el backend al rehidratar. Si el token venció, recién se detecta cuando falla la primera llamada autenticada (401) — el `logout()` automático ante un 401 queda pendiente.

## Consecuencias
- `authService.ts` y `questionnaireService.ts` ya mandan el JWT como header `Authorization: Bearer <token>` en cada request protegido (patrón `authHeaders(token)`).
- Expuesto a XSS (cualquier script en la página puede leer `localStorage`) — riesgo aceptado por ahora, no mitigado.
- Pendiente: detectar 401 en las respuestas y disparar `logout()` automáticamente (hoy no existe ese interceptor).

## Enlaces relacionados
- [[modulos/Auth]]
- [[00-Roadmap]]
