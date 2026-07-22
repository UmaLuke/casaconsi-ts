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
- Pendiente aplicar la misma corrección en `LoginForm.tsx` si tiene el mismo problema (confirmar antes de tocar).

## Testeo
- Verificado con Postman (extensión de VS Code): códigos de estado y payloads correctos en registro y login.

## Pendiente
- [[decisiones/ADR-0002-persistencia-jwt]] — decisión abierta sobre dónde guardar el JWT.
- Conectar `AuthContext`, `LoginModal.tsx`, `RegisterPage.tsx` a los endpoints reales vía `src/config.ts` (`VITE_API_URL`).

## Enlaces relacionados
- [[convenciones/backend]]
- [[convenciones/frontend]]
- [[00-Roadmap]]
