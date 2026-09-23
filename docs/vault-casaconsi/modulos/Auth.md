tags: [modulo, backend, frontend, auth]

# Módulo: Auth

**Estado:** ✅ Implementado y verificado end-to-end (backend y frontend). **(2026-09-16)** Corregido — antes decía "frontend pendiente de conexión real", desactualizado: `authService.ts`, `AuthContext.tsx`, `LoginModal.tsx` y `RegisterPage.tsx` ya están conectados a los endpoints reales, con persistencia en `localStorage`, auto-logout por vencimiento e interceptor de 401 (todo lo que describe la sección "Frontend" de abajo ya está en funcionamiento, no es un plan).

## Backend

- `ApplicationUser` extiende `IdentityUser` con: `Name`, `Role`, `Avatar`, `Title`, `Generation`. **(2026-09-16)** También tiene `Profession` (string opcional) — se usa en `RegisterRequestDto` y viaja de vuelta en `AuthResponseDto`; no estaba listado acá. (El modelo real tiene además `GalleryPhotoPaths`, `MembershipTier`, `Bio`, `IsDemoUser`, `IsPrimaryAdvisor`, pero esos son de otros módulos — ver [[Cuenta]], [[Confianza]], [[Asesorias]] — salvo `GalleryPhotoPaths`, que sí es relevante acá por el bug de `Gallery` de más abajo.)
- `JsonConverter` custom: serializa los enums `Role`/`Generation` a strings en minúscula con guiones, alineado con los tipos del frontend.
- `AuthService`, `TokenService`, `AuthController`:
  - `POST /api/auth/register` → 409 en duplicado o contraseña débil. Body: `RegisterRequestDto` (`Name`, `Email`, `Password`, `Role`, `Profession?`).
  - `POST /api/auth/login` → 401 en credenciales inválidas. Body: `LoginRequestDto` (`Email`, `Password`).
- Identity + JWT Bearer configurado en `Program.cs`.
- `Jwt:Key` en `dotnet user-secrets` (nunca en `appsettings.json`).
- Migración de Identity aplicada a `db_ccs` — 20 columnas verificadas.
- Política de contraseña: mínimo 8 caracteres, mayúscula + minúscula + dígito + carácter no alfanumérico.
- **(2026-08-10)** `AuthResponseDto` ahora incluye `Gallery` (bug encontrado, no funcionalidad nueva): `AuthService.BuildAuthResponseAsync` no mandaba la galería de fotos de la cuenta (`ApplicationUser.GalleryPhotoPaths`) en `register`/`login`, a pesar de que `User` (frontend) la declara como campo obligatorio (`gallery: string[]`) desde que se armó la galería en [[Cuenta]]. Efecto real, no solo de tipos: cada login "fresco" (cerrar sesión y volver a entrar, o entrar desde otro dispositivo) pisaba el `user` en `localStorage` con `gallery: []`, y la pestaña de galería en `ProfilePage.tsx` se veía vacía hasta que la persona subía o borraba una foto (esas respuestas sí traen la lista completa) — las fotos seguían intactas en el servidor, pero no se mostraban. Fix: `AuthService.BuildAuthResponseAsync` ahora mapea `GalleryPhotoPaths` a URLs con el mismo `ToUrl` que ya usa `AccountService.ToDtoAsync` (mismo patrón, dos copias del helper — no se extrajo a un lugar común porque `AuthService`/`AccountService` no comparten una base).

## Admin (rol de Identity, separado del `UserRole` de negocio)

`Admin` es un rol de ASP.NET Identity (`RoleManager<IdentityRole>`), **no** un valor del enum `UserRole` (que sigue siendo solo `Host`/`Student`/`Advisor`) — cualquier cuenta, sea Host, Student o Advisor, puede además pertenecer al rol Admin. **(2026-09-16, corregido)** Antes esta misma línea decía "sea Host o Student", inconsistente con el propio párrafo que dos palabras antes lista `Advisor` como tercer valor del enum.

- `Data/AdminSeeder.cs` corre una vez al arrancar el backend (`Program.cs`, antes de `DemoProfileSeeder`). Es idempotente: si el rol o el usuario ya existen, no hace nada.
- Sin credenciales configuradas no crea nada — no es un error, simplemente no hay admin. Las credenciales van por `dotnet user-secrets` (`AdminSeed:Email`/`AdminSeed:Password`), nunca en `appsettings.json` — ahí quedan a propósito vacías, mismo criterio que `Jwt:Key`.
- Para crear/actualizar el admin local:
  ```
  cd backend/CasaConSi.Api
  dotnet user-secrets set "AdminSeed:Email" "admin@casaconsi.com"
  dotnet user-secrets set "AdminSeed:Password" "Admin2026!"
  ```
  y reiniciar `dotnet run` — el seeder crea la cuenta (o le suma el rol Admin si el email ya existía con otro rol).
- **(2026-08-21)** Cuenta admin de desarrollo creada con esas credenciales (`admin@casaconsi.com` / `Admin2026!`) — solo en `dotnet user-secrets` de esta máquina, no se commitea a ningún lado. Sirve para entrar a `/dashboard` (gateado en el frontend por `<ProtectedRoute requireAdmin>`, ver [[00-Roadmap]] → Módulo Admin).
- `IsAdmin` no es una columna de `ApplicationUser`: se calcula en el momento con `userManager.IsInRoleAsync(user, "Admin")`, tanto en `AuthService.BuildAuthResponseAsync` como en `AccountService.ToDtoAsync`.
- ✅ **(2026-08-27) Corregido — el JWT ya lleva el claim "Admin".** Era el bloqueante anotado el 2026-08-21 (texto original del hallazgo, para no perder el contexto: *`TokenService.GenerateToken` solo agregaba `ClaimTypes.Role` con el `UserRole` de negocio (Host/Student/Advisor) — el JWT nunca llevaba el rol "Admin"; el gate de `/dashboard` vivía solo en el frontend, chequeando `user.isAdmin`*). Fix: `ITokenService.GenerateToken` pasó a recibir `(ApplicationUser user, bool isAdmin)`; `TokenService` agrega un segundo `ClaimTypes.Role = "Admin"` solo cuando `isAdmin` es `true` (`[Authorize(Roles=...)]` soporta múltiples claims del mismo tipo, mismo patrón que ya usa el `UserRole` de negocio en `MatchController`/`SpaceController`). `AuthService.BuildAuthResponseAsync` calcula `isAdmin` con `userManager.IsInRoleAsync` antes de llamar a `GenerateToken` (ya lo calculaba para el DTO de respuesta; ahora también se lo pasa al token). **Importante:** los JWT emitidos antes de este fix no llevan el claim — cualquier sesión admin ya logueada necesita volver a iniciar sesión para que `[Authorize(Roles = "Admin")]` la reconozca. Este era el prerequisito bloqueante para el primer endpoint real de `/api/admin/*` — ver [[Confianza]] → "Panel Admin — cola de revisión de Alta Confianza", el primero en usarlo. **(2026-09-16, verificado)** Se releyó `TokenService.cs`/`AuthService.cs`: el fix sigue vigente tal cual está descripto acá, sin cambios adicionales.

## Frontend

- `User` (tipo): `id: string` no opcional (corregido).
- `RegisterForm.tsx`: `minLength=8` + patrón que exige mayúscula/minúscula/dígito/no-alfanumérico, con texto de ayuda visible. **(2026-09-16)** `RegisterFormData` también declara `profession?: string` (para calzar con el `Profession` de `RegisterRequestDto`), pero el JSX de este formulario no tiene ningún `<input>` para cargarlo — hoy siempre viaja `undefined` desde acá. Probablemente lo complete `RegisterAdvisorForm.tsx` (alta de cuenta Advisor, archivo fuera del alcance de esta auditoría) — sin verificar.
- `authService.ts` conectado a `POST /api/auth/register` y `POST /api/auth/login` reales (vía `VITE_API_URL`).
- `AuthContext.tsx` persiste `{ user, token, expiresAt }` en `localStorage` (`casaconsi_auth`) — ver [[../decisiones/ADR-0002-persistencia-jwt|ADR-0002]].
- **(2026-08-01)** Logout automático por vencimiento de token: `AuthContext` programa un `setTimeout` sobre `expiresAt` y también chequea el vencimiento al rehidratar la sesión al montar la app. `logout()` (manual o automático) redirige a `/` con `useNavigate()` — requirió reordenar `App.tsx` para que `Router` envuelva a `AuthProvider`.
- **(2026-09-16, confirmado)** Se revisó `LoginForm.tsx`: el campo de contraseña sigue sin `minLength`/`pattern` (solo `required`), a diferencia de `RegisterForm.tsx`. Sigue sin decidirse si conviene igualarlo — aplicar sin pensar el mismo `pattern` de registro rompería el login de cualquier cuenta cuya contraseña no lo cumpla (por ejemplo, una cuenta admin sembrada por `AdminSeeder.cs` con una contraseña que no matchee el patrón). Queda igual como pendiente, ver sección "Pendiente".
- **(2026-08-10)** `components/common/PasswordInput.tsx` (nuevo): input de contraseña con botón de ojo (`Eye`/`EyeOff` de `lucide-react`) para mostrar/ocultar el valor tipeado. Reemplaza el bloque repetido `<label><Lock/><input type="password"/></label>` en `LoginForm.tsx`, `RegisterForm.tsx` y `RegisterAdvisorForm.tsx` (y también en `SecurityTab` de [[Cuenta]]) — mismas clases DaisyUI que ya usaban, sin cambios visuales salvo el botón nuevo. El input sigue recibiendo `value`/`onChange`/`required`/`minLength`/`pattern`/`title`/`disabled` igual que antes, vía spread de props.
- **(2026-08-13, bug corregido)** `Header.tsx`: el botón "Iniciar Sesión" (`navbar-end`) tenía `hidden sm:flex` — invisible por debajo de 640px. El reporte de QA original decía que el botón que desaparecía era "Registrarse", pero en la práctica ese sí se veía (tiene fondo sólido `bg-brand-orange`, sin `hidden`); el que realmente faltaba era "Iniciar Sesión" (`btn-ghost`, sin fondo). El dropdown del hamburguesa tampoco tenía forma de abrir `LoginModal` — solo linkeaba a anclas de la landing (`#como-funciona`, `#explorar-espacios`). Resultado real: en mobile, sin sesión, no había ninguna forma de loguearse (sí de registrarse). Fix: se sacó el `hidden` del botón (queda `flex` en todos los breakpoints) — se confirmó antes con una captura que sobraba espacio al lado de "Registrarse" en 375px, así que no hizo falta mover nada al hamburguesa.
- **(2026-08-13, bug corregido)** `LoginModal.tsx`: `modal-box` tenía `overflow-hidden` a secas (sin `max-height`) — en mobile, con el form + una alerta de error visible, el contenido podía superar la altura de pantalla y quedaba sin forma de scrollear hasta el botón de submit ni el link "Regístrate aquí". Mismo bug que ya se había resuelto en `SpaceDetailsModal.tsx` (ver [[Space]]: "`max-h-[90vh] overflow-y-auto` en vez de `overflow-hidden` a secas"). Fix: en vez de mover el `overflow-y-auto`/`max-h-[90vh]` directo al `modal-box` (eso generaba un bug de renderizado real — un hueco blanco cuadrado en cada una de las 4 esquinas, porque el header/footer necesitaban un `border-radius` propio que no coincidía exactamente con el del `modal-box`), se anidó un `div` interno: el `modal-box` de afuera vuelve a `overflow-hidden` + `max-h-[90vh]` (recorta todo a su forma redondeada, sin scroll propio) y un `div` interno nuevo tiene `overflow-y-auto` + `max-h-[90vh]` (el que scrollea de verdad). Evita tener que adivinar/matchear valores de `border-radius` a mano. **(2026-09-16, verificado)** Sigue así en el código actual, sin cambios.
- **(2026-08-11)** Interceptor de 401: `services/httpClient.ts` (nuevo) centraliza los requests de todos los `services/*.ts` en una función `apiFetch(path, init)`. Si la response es 401 y el request llevaba header `Authorization`, dispara `window.dispatchEvent(new CustomEvent('casaconsi:unauthorized'))`. `AuthContext.tsx` se suscribe a ese evento en un `useEffect` y llama a `logout()` — así los `services/*.ts` (funciones planas, fuera del árbol de React) no necesitan importar el Context. El filtro por header `Authorization` evita que un 401 de `/api/auth/login` (credenciales incorrectas, sin token todavía) dispare un logout espurio. Migrados: `accountService.ts`, `authService.ts`, `matchService.ts`, `questionnaireService.ts`, `spaceService.ts`, `trustService.ts` (`exchangeService.ts` no se tocó: pega a una API externa, no al backend propio). Detalle completo (código, flujo, mapa de qué componente usa cada `service`) en [[../convenciones/http-client|convenciones/http-client]].
- **(2026-09-16)** `LoginModal.tsx`: la redirección post-login tiene 3 ramas, no 2 — `host` → `/descubrir`, `advisor` → `/asesorias`, resto (`student`) → `/explorar`. El diagrama de flujo de la sección "Interacciones" solo mencionaba "resto → /explorar" sin el caso `advisor`; corregido ahí abajo.
- **(2026-09-16)** `RegisterPage.tsx`: tras un registro exitoso, además de loguear (`login(user, token, expiresAt)`), redirige por rol al cuestionario obligatorio: `role === 'host'` → `/cuestionario/ofrecer`, resto → `/cuestionario/buscar`. No estaba documentado en este módulo. El módulo dueño de esas rutas de cuestionario no está identificado entre los módulos conocidos del vault, así que no se linkea a ninguno por las dudas.
- **(2026-09-16, hallazgo nuevo)** `LoginForm.tsx` tiene un botón "Google" ("O continúa con") que es solo UI: no tiene `onClick` ni ninguna integración con un proveedor OAuth, y no hay ningún endpoint de login social en `AuthController`. No estaba documentado. Ver "Pendiente".

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
    ← AuthResponseDto (plano: id, name, email, role, avatar, title, profession,
       generation, isAdmin, gallery, token, expiresAt — ver AuthResponseDto.cs)
    → authService.ts arma un AuthResult { user, token, expiresAt } a partir de eso
  → AuthContext.login(user, token, expiresAt)   [guarda en localStorage, programa auto-logout]
  → LoginModal redirige por rol (host → /descubrir, advisor → /asesorias, resto → /explorar)
```

**(2026-09-16)** Corregido: el diagrama anterior mostraba `AuthResponseDto { user, token, expiresAt, gallery }` como si el DTO del backend ya viniera anidado en un objeto `user` — el `AuthResponseDto` real es plano (campos sueltos, ver arriba); el objeto anidado `{ user, token, expiresAt }` es `AuthResult`, un tipo que arma `authService.ts` en el frontend al recibir la respuesta. También se agregó la rama `advisor` que faltaba en la redirección de `LoginModal`.

Un 401 acá (credenciales incorrectas) **no** pasa por el interceptor de `apiFetch` — no hay `Authorization` header en el request, ver [[../convenciones/http-client|convenciones/http-client]] punto 2.

## Testeo
- Verificado con Postman (extensión de VS Code): códigos de estado y payloads correctos en registro y login.

## Pendiente
- Endpoint `/me` para revalidar el token contra el backend al rehidratar la sesión desde `localStorage` (el vencimiento por tiempo ya se resuelve del lado del cliente con `expiresAt`; el 401 de un token revocado en caliente ya se resuelve con el interceptor de arriba). Este caso es distinto: si el usuario no hace ningún request tras rehidratar, nunca se dispara un 401 y la sesión "revocada" se sigue viendo activa en el cliente hasta la próxima llamada a la API. **Nota (2026-08-04):** ya existe `GET /api/account/me` (ver [[Cuenta]]), pero vive en el módulo Cuenta y no fue pensado para esto — solo expone los datos vigentes del usuario del token. Evaluar si conviene reusarlo para el rehidratado en vez de crear un endpoint aparte en Auth.
- Decidir si aplicar a `LoginForm.tsx` el mismo `minLength`/`pattern` de contraseña que tiene `RegisterForm.tsx` (confirmado el 2026-09-16 que sigue sin aplicarse — ver nota en "Frontend"). No hacerlo sin pensar: podría bloquear el login de cuentas cuya contraseña no cumpla ese patrón (ej. una cuenta admin sembrada manualmente con otra contraseña).
- **(2026-09-16, nuevo)** Definir qué hacer con el botón "Google" de `LoginForm.tsx`: hoy es puramente decorativo (sin `onClick`, sin backend de OAuth). Implementarlo o sacarlo de la UI mientras no esté en el roadmap.
- **(2026-09-16, nuevo)** Confirmar si `RegisterForm.tsx` (alta Host/Student) debería pedir `profession` como input propio, o si ese campo es exclusivo del alta de Advisor vía `RegisterAdvisorForm.tsx` (no revisado en esta auditoría) — hoy `RegisterFormData.profession` existe en el tipo pero nunca se completa desde este formulario.

## Enlaces relacionados
- [[Cuenta]] — datos de acceso (nombre, email, password, avatar) editables desde "Mi perfil", separado de este módulo pero opera sobre el mismo `ApplicationUser`/`UserManager`.
- [[Confianza]] — primer consumidor real del claim "Admin" (panel de revisión de Alta Confianza).
- [[convenciones/backend]]
- [[convenciones/frontend]]
- [[00-Roadmap]]
