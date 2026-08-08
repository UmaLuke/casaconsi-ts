tags: [modulo, backend, frontend, cuenta, auth]

# Módulo: Cuenta ("Mi perfil")

**Estado:** ✅ Implementado end-to-end (backend + frontend). Pendiente compilar/verificar con `dotnet build` real (no se pudo correr en el entorno donde se escribió este módulo — sin SDK de .NET disponible) y probar en Postman/UI.

Distinto del [[Perfiles|módulo de Perfiles]] (cuestionario host/student para el match): **Cuenta** cubre los datos de *acceso* — nombre, email, contraseña, avatar. El perfil de match sigue viviendo y editándose donde ya estaba (cuestionario), este módulo no lo duplica.

## Backend

- Mismo criterio arquitectónico que `AuthService`: **no hay Repository** — `UserManager<ApplicationUser>` hace de capa de datos (a diferencia de Perfiles/Match/Space, que sí tienen Repository, porque manejan sus propias entidades y no solo `ApplicationUser`).
- `DTOs/Account/AccountDtos.cs`: `AccountResponseDto` (espejo de `AuthResponseDto` pero sin `Token`/`ExpiresAt`), `UpdateAccountRequestDto`, `ChangePasswordRequestDto`, `ChangeEmailRequestDto`.
- `IAccountService` / `AccountService`:
  - `GetMeAsync` — trae los datos de cuenta del usuario del token.
  - `UpdateNameAsync` — actualiza `ApplicationUser.Name`.
  - `UpdateAvatarAsync` — sube el archivo vía `IFileStorageService` (mismo servicio que usa `ProfileService` para fotos, subfolder `avatars/{userId}`) y guarda la URL en `ApplicationUser.Avatar`.
  - `ChangePasswordAsync` — `UserManager.ChangePasswordAsync` (valida la contraseña actual internamente).
  - `ChangeEmailAsync` — valida contraseña actual a mano (`CheckPasswordAsync`), chequea que el nuevo email no esté en uso por otra cuenta, y actualiza `Email` + `UserName` juntos (`UserName` espeja al email en todo el sistema, ver `AuthService.RegisterAsync`).
- `AccountController` (`/api/account`, `[Authorize]`): `GET /me`, `PUT /me`, `POST /avatar`, `PUT /password`, `PUT /email`. Mismo patrón que `ProfileController`: todos los endpoints operan sobre el usuario del token (`Sub`/`NameIdentifier` claim) — nunca se acepta un id de usuario como parámetro.
- Registrado en `Program.cs`: `AddScoped<IAccountService, AccountService>`.
- **No hubo migración nueva** — reutiliza columnas ya existentes de `ApplicationUser` (`Name`, `Email`, `Avatar`), no se agregó ninguna.

## Frontend

- `services/accountService.ts`: espejo de `questionnaireService.ts` (mismo patrón de `authHeaders`/manejo de errores). Expone `getMe`, `updateName`, `uploadAvatar`, `changePassword`, `changeEmail`, todas mapeando `AccountResponseDto` → `User` (tipo ya existente en `types/auth.ts`).
- `AuthContextValue` (`types/auth.ts`) ganó `updateUser(userData: User)`: refresca el `user` en memoria + `localStorage` sin reprogramar el logout automático ni pedir un nuevo login — pensado para que "Mi perfil" pueda reflejar cambios (nombre, avatar, email) al instante en el Header sin deslogear a nadie.
- `utils/avatar.ts` (nuevo): `resolveAvatarUrl(avatar, name)` — antepone `VITE_API_URL` a la ruta relativa que devuelve el backend, o cae al fallback de `ui-avatars.com` si no hay avatar. **Antes** `Header.tsx` y `DashboardPage.tsx` usaban `user.avatar` directo como `src`, lo cual nunca había roto nada porque hasta ahora nada seteaba un avatar real (`Avatar` quedaba siempre `null`) — con `POST /api/account/avatar` ya devolviendo rutas relativas reales, hacía falta el helper. Se actualizaron ambos archivos para usarlo.
- `pages/ProfilePage.tsx` (nuevo, ruta `/mi-perfil`, protegida con `<ProtectedRoute>` sin `requireAdmin` — cualquier rol logueado): tabs con componentes de nivel de módulo (no anidados dentro del componente de página, para que no se remonten en cada render y pierdan el estado de los formularios al tipear):
  - **Datos de cuenta** (`AccountTab`): avatar (preview + subida) y nombre (editable). Email se muestra solo lectura, con nota de que se cambia desde "Seguridad".
  - **Seguridad** (`SecurityTab`): cambiar contraseña (actual + nueva) y cambiar email (nuevo email + contraseña actual), en dos cards separadas.
  - **Mi perfil de match** (`MatchProfileTab`, solo visible para `role === 'student' | 'host'`, no para `advisor`). **(2026-08-04, rediseñado)** Primera versión solo linkeaba a `/cuestionario/buscar`/`/cuestionario/ofrecer` — al construirla se encontró que esas páginas no precargaban el perfil existente (ver [[Perfiles]], bug ya corregido). Se rehízo para editar inline: `HostMatchProfile`/`StudentMatchProfile` (en `ProfilePage.tsx`) cargan el perfil con `getHostProfile`/`getStudentProfile` + `toHostQuestionnaireData`/`toStudentQuestionnaireData`, y lo muestran con el nuevo `QuestionnaireAccordion` (`components/features/questionnaire/`) — las 8/9 secciones colapsadas en acordeón (una abierta a la vez, chip "Completo"/"Faltan datos" por sección) en vez del wizard paso a paso. El guardado sigue siendo `submitHostQuestionnaire`/`submitStudentQuestionnaire`, los mismos que usa el wizard — es un layout distinto sobre el mismo contrato con el backend (`PUT` completo, no hay guardado parcial por sección).
  - `QuestionnaireAccordion` reutiliza `QuestionnaireField` y los helpers `isFieldVisible`/`isValueFilled` (recién exportados desde `QuestionnaireWizard.tsx` para no duplicar esa lógica) — antes de guardar, valida los obligatorios de **todas** las secciones (no solo la abierta) y si falta algo abre la primera sección incompleta.
  - El wizard (`/cuestionario/*`) no se tocó — sigue siendo el flujo de alta la primera vez, y ahora también sirve de fallback si alguien llega ahí directo.
- `App.tsx`: ruta `/mi-perfil` agregada, detrás de `ProtectedRoute` (sin `requireAdmin`).
- `Header.tsx`: dropdown de usuario — link **"Mi perfil"** agregado justo debajo del `menu-title` (nombre + rol) y arriba de "Ir a mi Panel" (admin)/"Cerrar Sesión". Resuelve el pendiente anotado en [[../00-Roadmap|00-Roadmap]] ("agregar botón Mi Perfil — depende de que exista ProfilePage").

## Decisión de diseño
- Se evaluó extender `ProfileController`/`ProfileService` existentes en vez de crear un módulo nuevo, pero esos ya tienen una responsabilidad clara y acotada (cuestionario de match, con DNI cifrado y lógica de `Generation`) — mezclar ahí datos de cuenta (password, email) habría acoplado dos conceptos distintos bajo el mismo Controller. Se optó por un módulo `Account` separado, replicando el criterio sin-Repository de `AuthService` (ambos operan pura y exclusivamente sobre `ApplicationUser` vía `UserManager`, sin entidades propias que justifiquen una capa de Repository).

## Pendiente
- Correr `dotnet build` real sobre el backend (el entorno de trabajo no tenía el SDK de .NET instalado) y probar los 5 endpoints en Postman.
- Decidir si cambiar el email debería re-emitir el JWT (hoy el token viejo sigue siendo válido hasta que expire naturalmente, y el claim `Email` que lleva adentro queda desactualizado hasta el próximo login) — no se tocó `TokenService` para no ampliar el alcance sin confirmarlo antes.
- `ChangeEmailRequestDto`/`ChangePasswordRequestDto` no tienen validación de complejidad de contraseña más allá de `MinLength(8)` — `RegisterForm.tsx` sí valida mayúscula/minúscula/dígito/símbolo en el registro; evaluar si el form de "Seguridad" debería exigir lo mismo.
- Sin tests automatizados (mismo estado que el resto del backend hoy).

## Enlaces relacionados
- [[Auth]]
- [[Perfiles]]
- [[../00-Roadmap|00-Roadmap]]
- [[../convenciones/backend|convenciones/backend]]
- [[../convenciones/frontend|convenciones/frontend]]
