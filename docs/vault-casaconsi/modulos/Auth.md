tags: [modulo, backend, frontend, auth]

# Módulo: Auth

**Estado:** ✅ Implementado y verificado end-to-end (backend). Frontend pendiente de conexión real.

## Backend

- `ApplicationUser` extiende `IdentityUser` con: `Name`, `Role`, `Avatar`, `Title`, `Generation`.
- `JsonConverter` custom: serializa los enums `Role`/`Generation` a strings en minúscula con guiones, alineado con los tipos del frontend.
- `AuthService`, `TokenService`, `AuthController`:
  - `POST /api/auth/register` → 409 en duplicado o contraseña débil.
  - `POST /api/auth/login` → 401 en credenciales inválidas.
- Identity + JWT Bearer configurado en `Program.cs`.
- `Jwt:Key` en `dotnet user-secrets` (nunca en `appsettings.json`).
- Migración de Identity aplicada a `db_ccs` — 20 columnas verificadas.
- Política de contraseña: mínimo 8 caracteres, mayúscula + minúscula + dígito + carácter no alfanumérico.

## Frontend

- `User` (tipo): `id: string` no opcional (corregido).
- `RegisterForm.tsx`: `minLength=8` + patrón que exige mayúscula/minúscula/dígito/no-alfanumérico, con texto de ayuda visible.
- `authService.ts` conectado a `POST /api/auth/register` y `POST /api/auth/login` reales (vía `VITE_API_URL`).
- `AuthContext.tsx` persiste `{ user, token, expiresAt }` en `localStorage` (`casaconsi_auth`) — ver [[../decisiones/ADR-0002-persistencia-jwt|ADR-0002]].
- **(2026-08-01)** Logout automático por vencimiento de token: `AuthContext` programa un `setTimeout` sobre `expiresAt` y también chequea el vencimiento al rehidratar la sesión al montar la app. `logout()` (manual o automático) redirige a `/` con `useNavigate()` — requirió reordenar `App.tsx` para que `Router` envuelva a `AuthProvider`.
- Pendiente aplicar la misma corrección de password que `RegisterForm.tsx` en `LoginForm.tsx` si tiene el mismo problema (confirmar antes de tocar).

## Testeo
- Verificado con Postman (extensión de VS Code): códigos de estado y payloads correctos en registro y login.

## Pendiente
- Detectar 401 en respuestas autenticadas y disparar `logout()` automáticamente, para el caso en que el backend invalida el token *antes* de su vencimiento natural — ban, cambio de rol, etc. (no hay interceptor todavía, ver [[../decisiones/ADR-0002-persistencia-jwt|ADR-0002]]).
- Endpoint `/me` para revalidar el token contra el backend al rehidratar la sesión desde `localStorage` (el vencimiento por tiempo ya se resuelve del lado del cliente con `expiresAt`, sin necesitar este endpoint). **Nota (2026-08-04):** ya existe `GET /api/account/me` (ver [[Cuenta]]), pero vive en el módulo Cuenta y no fue pensado para esto — no resuelve revocación server-side (ban, cambio de rol), solo expone los datos vigentes del usuario del token. Evaluar si conviene reusarlo para el rehidratado en vez de crear un endpoint aparte en Auth.

## Enlaces relacionados
- [[Cuenta]] — datos de acceso (nombre, email, password, avatar) editables desde "Mi perfil", separado de este módulo pero opera sobre el mismo `ApplicationUser`/`UserManager`.
- [[convenciones/backend]]
- [[convenciones/frontend]]
- [[00-Roadmap]]
