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
- **(2026-08-10)** `AuthResponseDto` ahora incluye `Gallery` (bug encontrado, no funcionalidad nueva): `AuthService.BuildAuthResponseAsync` no mandaba la galería de fotos de la cuenta (`ApplicationUser.GalleryPhotoPaths`) en `register`/`login`, a pesar de que `User` (frontend) la declara como campo obligatorio (`gallery: string[]`) desde que se armó la galería en [[Cuenta]]. Efecto real, no solo de tipos: cada login "fresco" (cerrar sesión y volver a entrar, o entrar desde otro dispositivo) pisaba el `user` en `localStorage` con `gallery: []`, y la pestaña de galería en `ProfilePage.tsx` se veía vacía hasta que la persona subía o borraba una foto (esas respuestas sí traen la lista completa) — las fotos seguían intactas en el servidor, pero no se mostraban. Fix: `AuthService.BuildAuthResponseAsync` ahora mapea `GalleryPhotoPaths` a URLs con el mismo `ToUrl` que ya usa `AccountService.ToDtoAsync` (mismo patrón, dos copias del helper — no se extrajo a un lugar común porque `AuthService`/`AccountService` no comparten una base).

## Frontend

- `User` (tipo): `id: string` no opcional (corregido).
- `RegisterForm.tsx`: `minLength=8` + patrón que exige mayúscula/minúscula/dígito/no-alfanumérico, con texto de ayuda visible.
- `authService.ts` conectado a `POST /api/auth/register` y `POST /api/auth/login` reales (vía `VITE_API_URL`).
- `AuthContext.tsx` persiste `{ user, token, expiresAt }` en `localStorage` (`casaconsi_auth`) — ver [[../decisiones/ADR-0002-persistencia-jwt|ADR-0002]].
- **(2026-08-01)** Logout automático por vencimiento de token: `AuthContext` programa un `setTimeout` sobre `expiresAt` y también chequea el vencimiento al rehidratar la sesión al montar la app. `logout()` (manual o automático) redirige a `/` con `useNavigate()` — requirió reordenar `App.tsx` para que `Router` envuelva a `AuthProvider`.
- Pendiente aplicar la misma corrección de password que `RegisterForm.tsx` en `LoginForm.tsx` si tiene el mismo problema (confirmar antes de tocar).
- **(2026-08-10)** `components/common/PasswordInput.tsx` (nuevo): input de contraseña con botón de ojo (`Eye`/`EyeOff` de `lucide-react`) para mostrar/ocultar el valor tipeado. Reemplaza el bloque repetido `<label><Lock/><input type="password"/></label>` en `LoginForm.tsx`, `RegisterForm.tsx` y `RegisterAdvisorForm.tsx` (y también en `SecurityTab` de [[Cuenta]]) — mismas clases DaisyUI que ya usaban, sin cambios visuales salvo el botón nuevo. El input sigue recibiendo `value`/`onChange`/`required`/`minLength`/`pattern`/`title`/`disabled` igual que antes, vía spread de props.
- **(2026-08-13, bug corregido)** `Header.tsx`: el botón "Iniciar Sesión" (`navbar-end`) tenía `hidden sm:flex` — invisible por debajo de 640px. El reporte de QA original decía que el botón que desaparecía era "Registrarse", pero en la práctica ese sí se veía (tiene fondo sólido `bg-brand-orange`, sin `hidden`); el que realmente faltaba era "Iniciar Sesión" (`btn-ghost`, sin fondo). El dropdown del hamburguesa tampoco tenía forma de abrir `LoginModal` — solo linkeaba a anclas de la landing (`#como-funciona`, `#explorar-espacios`). Resultado real: en mobile, sin sesión, no había ninguna forma de loguearse (sí de registrarse). Fix: se sacó el `hidden` del botón (queda `flex` en todos los breakpoints) — se confirmó antes con una captura que sobraba espacio al lado de "Registrarse" en 375px, así que no hizo falta mover nada al hamburguesa.
- **(2026-08-13, bug corregido)** `LoginModal.tsx`: `modal-box` tenía `overflow-hidden` a secas (sin `max-height`) — en mobile, con el form + una alerta de error visible, el contenido podía superar la altura de pantalla y quedaba sin forma de scrollear hasta el botón de submit ni el link "Regístrate aquí". Mismo bug que ya se había resuelto en `SpaceDetailsModal.tsx` (ver [[Space]]: "`max-h-[90vh] overflow-y-auto` en vez de `overflow-hidden` a secas"). Fix: en vez de mover el `overflow-y-auto`/`max-h-[90vh]` directo al `modal-box` (eso generaba un bug de renderizado real — un hueco blanco cuadrado en cada una de las 4 esquinas, porque el header/footer necesitaban un `border-radius` propio que no coincidía exactamente con el del `modal-box`), se anidó un `div` interno: el `modal-box` de afuera vuelve a `overflow-hidden` + `max-h-[90vh]` (recorta todo a su forma redondeada, sin scroll propio) y un `div` interno nuevo tiene `overflow-y-auto` + `max-h-[90vh]` (el que scrollea de verdad). Evita tener que adivinar/matchear valores de `border-radius` a mano.
- **(2026-08-11)** Interceptor de 401: `services/httpClient.ts` (nuevo) centraliza los requests de todos los `services/*.ts` en una función `apiFetch(path, init)`. Si la response es 401 y el request llevaba header `Authorization`, dispara `window.dispatchEvent(new CustomEvent('casaconsi:unauthorized'))`. `AuthContext.tsx` se suscribe a ese evento en un `useEffect` y llama a `logout()` — así los `services/*.ts` (funciones planas, fuera del árbol de React) no necesitan importar el Context. El filtro por header `Authorization` evita que un 401 de `/api/auth/login` (credenciales incorrectas, sin token todavía) dispare un logout espurio. Migrados: `accountService.ts`, `authService.ts`, `matchService.ts`, `questionnaireService.ts`, `spaceService.ts`, `trustService.ts` (`exchangeService.ts` no se tocó: pega a una API externa, no al backend propio). Detalle completo (código, flujo, mapa de qué componente usa cada `service`) en [[../convenciones/http-client|convenciones/http-client]].

## Interacciones

**Backend:** `AuthController` (`/api/auth`) → `AuthService` — **sin Repository** (mismo criterio que [[Cuenta]]: `UserManager<ApplicationUser>` hace de capa de datos, no hay entidad propia). `AuthService` también depende de `ITokenService`/`TokenService` para firmar el JWT.

| Endpoint | Service / método | Devuelve |
|---|---|---|
| `POST /api/auth/register` | `AuthService.RegisterAsync` | `AuthResponseDto` (incluye `Token`, `ExpiresAt`, `Gallery`) |
| `POST /api/auth/login` | `AuthService.LoginAsync` | `AuthResponseDto` |

Ninguno de los dos requiere `[Authorize]` (son el punto de entrada, todavía no hay token).

**Frontend:** `services/authService.ts` (`registerRequest`, `loginRequest`) — vía `apiFetch`, ver [[../convenciones/http-client|convenciones/http-client]].

| Componente/página | Función usada | Contexto |
|---|---|---|
| `components/features/auth/LoginModal.tsx` | `loginRequest` | Modal de login global (header) |
| `pages/auth/RegisterPage.tsx` | `registerRequest` | Alta de cuenta Student/Host |
| `pages/auth/RegisterAdvisorPage.tsx` | `registerRequest` | Alta de cuenta Advisor (`/register/asesor`, ver [[Asesorias]]) |

Flujo típico (login):

```
LoginForm (dentro de LoginModal.tsx)
  → loginRequest(data)                         [authService.ts]
    → apiFetch('/api/auth/login', ...)          [httpClient.ts]
      → AuthController.Login → AuthService.LoginAsync → UserManager + TokenService
    ← AuthResponseDto { user, token, expiresAt, gallery }
  → AuthContext.login(user, token, expiresAt)   [guarda en localStorage, programa auto-logout]
  → LoginModal redirige por rol (host → /descubrir, resto → /explorar)
```

Un 401 acá (credenciales incorrectas) **no** pasa por el interceptor de `apiFetch` — no hay `Authorization` header en el request, ver [[../convenciones/http-client|convenciones/http-client]] punto 2.

## Testeo
- Verificado con Postman (extensión de VS Code): códigos de estado y payloads correctos en registro y login.

## Pendiente
- Endpoint `/me` para revalidar el token contra el backend al rehidratar la sesión desde `localStorage` (el vencimiento por tiempo ya se resuelve del lado del cliente con `expiresAt`; el 401 de un token revocado en caliente ya se resuelve con el interceptor de arriba). Este caso es distinto: si el usuario no hace ningún request tras rehidratar, nunca se dispara un 401 y la sesión "revocada" se sigue viendo activa en el cliente hasta la próxima llamada a la API. **Nota (2026-08-04):** ya existe `GET /api/account/me` (ver [[Cuenta]]), pero vive en el módulo Cuenta y no fue pensado para esto — solo expone los datos vigentes del usuario del token. Evaluar si conviene reusarlo para el rehidratado en vez de crear un endpoint aparte en Auth.

## Enlaces relacionados
- [[Cuenta]] — datos de acceso (nombre, email, password, avatar) editables desde "Mi perfil", separado de este módulo pero opera sobre el mismo `ApplicationUser`/`UserManager`.
- [[convenciones/backend]]
- [[convenciones/frontend]]
- [[00-Roadmap]]
