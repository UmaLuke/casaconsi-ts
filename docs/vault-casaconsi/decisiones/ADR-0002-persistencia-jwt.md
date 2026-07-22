tags: [adr, frontend, auth, pendiente]

# ADR-0002: Estrategia de persistencia del JWT en el frontend

- **Fecha:** (pendiente de decidir)
- **Estado:** Propuesta — DECISIÓN ABIERTA

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
_Pendiente — completar cuando se resuelva._

## Consecuencias
_Completar tras decidir. Afecta directamente cómo se implementan `AuthContext`, el interceptor de peticiones HTTP, y la configuración de CORS en `Program.cs`._

## Enlaces relacionados
- [[modulos/Auth]]
- [[00-Roadmap]]
