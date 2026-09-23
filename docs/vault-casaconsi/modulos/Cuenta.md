tags: [modulo, backend, frontend, cuenta, auth]

# Módulo: Cuenta ("Mi perfil")

**Estado:** ✅ Implementado end-to-end (backend + frontend). Pendiente compilar/verificar con `dotnet build` real (no se pudo correr en el entorno donde se escribió este módulo — sin SDK de .NET disponible) y probar en Postman/UI.

Distinto del [[Perfiles|módulo de Perfiles]] (cuestionario host/student para el match): **Cuenta** cubre los datos de *acceso* — nombre, email, contraseña, avatar y galería de fotos. El perfil de match sigue viviendo y editándose donde ya estaba (cuestionario), este módulo no lo duplica.

**(2026-09-16)** Auditoría de este módulo contra el código real: la galería de fotos ya estaba implementada en backend y frontend pero no figuraba en las secciones de Backend/Frontend de abajo (solo aparecía suelta en "Interacciones"), y la afirmación de "no hubo migración nueva" quedó desactualizada porque `ApplicationUser.GalleryPhotoPaths` es una columna nueva. Se corrige todo eso más abajo.

## Backend

- Mismo criterio arquitectónico que `AuthService`: **no hay Repository** — `UserManager<ApplicationUser>` hace de capa de datos (a diferencia de Perfiles/Match/Space, que sí tienen Repository, porque manejan sus propias entidades y no solo `ApplicationUser`).
- `DTOs/Account/AccountDtos.cs`: `AccountResponseDto` (espejo de `AuthResponseDto` pero sin `Token`/`ExpiresAt`) con `Id`, `Name`, `Email`, `Role`, `Avatar`, `Title`, `Profession`, `Generation`, `IsAdmin` y `Gallery` (lista de URLs); `UpdateAccountRequestDto` (`Name`, requerido, máx. 120); `ChangePasswordRequestDto` (`CurrentPassword`, `NewPassword` con `MinLength(8)`, mismo mínimo que Identity); `ChangeEmailRequestDto` (`NewEmail` con `[EmailAddress]`, `CurrentPassword`).
- `IAccountService` / `AccountService`:
  - `GetMeAsync` — trae los datos de cuenta del usuario del token.
  - `UpdateNameAsync` — actualiza `ApplicationUser.Name`.
  - `UpdateAvatarAsync` — sube el archivo vía `IFileStorageService` (mismo servicio que usa `ProfileService` para fotos, subfolder `avatars/{userId}`) y guarda la URL en `ApplicationUser.Avatar`.
  - `ChangePasswordAsync` — `UserManager.ChangePasswordAsync` (valida la contraseña actual internamente).
  - `ChangeEmailAsync` — valida contraseña actual a mano (`CheckPasswordAsync`), chequea que el nuevo email no esté en uso por otra cuenta, y actualiza `Email` + `UserName` juntos (`UserName` espeja al email en todo el sistema, ver `AuthService.RegisterAsync`).
  - **(2026-09-16)** `AddGalleryPhotoAsync` — sube la foto vía `IFileStorageService` (subfolder `gallery/{userId}`) y la agrega a `ApplicationUser.GalleryPhotoPaths`; rechaza con `InvalidOperationException` si ya hay `MaxGalleryPhotos` (10, constante hardcodeada en `AccountService`) o más.
  - **(2026-09-16)** `RemoveGalleryPhotoAsync` — recibe la URL devuelta al frontend (`/uploads/gallery/{userId}/...`), le saca el prefijo `/uploads/` para comparar contra la ruta relativa guardada, y la remueve de `GalleryPhotoPaths`; si no la encuentra (foto de otro usuario o URL inválida) tira `InvalidOperationException` ("La foto no pertenece a la galería de este usuario.").
- `AccountController` (`/api/account`, `[Authorize]`): `GET /me`, `PUT /me`, `POST /avatar`, `POST /gallery`, `DELETE /gallery`, `PUT /password`, `PUT /email`. Mismo patrón que `ProfileController`: todos los endpoints operan sobre el usuario del token (`Sub`/`NameIdentifier` claim) — nunca se acepta un id de usuario como parámetro.
- Registrado en `Program.cs`: `AddScoped<IAccountService, AccountService>`.
- **(2026-09-16, corregido)** `ApplicationUser` tiene un campo `GalleryPhotoPaths` (`List<string>`) que no existía cuando se escribió este módulo por primera vez — es una columna nueva, no una reutilización de `Name`/`Email`/`Avatar`. La afirmación anterior de "no hubo migración nueva" quedaba desactualizada; no se encontró la carpeta `Migrations/` en el snapshot auditado para confirmar el nombre exacto de la migración que la agregó, así que no se puede afirmar con certeza si ya está aplicada — solo que el modelo la requiere.

## Frontend

- `services/accountService.ts`: espejo de `questionnaireService.ts` (mismo patrón de `authHeaders`/manejo de errores). Expone `getMe`, `updateName`, `uploadAvatar`, `changePassword`, `changeEmail`, `uploadGalleryPhoto`, `removeGalleryPhoto` **(2026-09-16: las últimas dos no figuraban en esta lista)**, todas mapeando `AccountResponseDto` → `User` (tipo ya existente en `types/auth.ts`).
- `AuthContextValue` (`types/auth.ts`) ganó `updateUser(userData: User)`: refresca el `user` en memoria + `localStorage` sin reprogramar el logout automático ni pedir un nuevo login — pensado para que "Mi perfil" pueda reflejar cambios (nombre, avatar, email) al instante en el Header sin deslogear a nadie.
- `utils/avatar.ts`: `resolveAvatarUrl(avatar, name)` — antepone `VITE_API_URL` a la ruta relativa que devuelve el backend, o cae al fallback de `ui-avatars.com` si no hay avatar. También expone `resolveUploadedFileUrl(path)`, el mismo prepend de `VITE_API_URL` sin fallback, usado por `PhotoGalleryCard.tsx` para las fotos de la galería. **Antes** `Header.tsx` y `DashboardPage.tsx` usaban `user.avatar` directo como `src`, lo cual nunca había roto nada porque hasta ahora nada seteaba un avatar real (`Avatar` quedaba siempre `null`) — con `POST /api/account/avatar` ya devolviendo rutas relativas reales, hacía falta el helper. Se actualizaron ambos archivos para usarlo.
- `pages/ProfilePage.tsx` (ruta `/mi-perfil`, protegida con `<ProtectedRoute>` sin `requireAdmin` — cualquier rol logueado): tabs con componentes de nivel de módulo (no anidados dentro del componente de página, para que no se remonten en cada render y pierdan el estado de los formularios al tipear):
  - **Datos de cuenta** (`AccountTab`): avatar (preview + subida) y nombre (editable), con badge de rol (`ROLE_LABELS`) de solo lectura. Email se muestra solo lectura, con nota de que se cambia desde "Seguridad". **(2026-09-16)** También pide el estado de confianza (`getTrustStatus`, ver [[Confianza]]) y muestra `TrustBadge`/`PremiumBadge` junto al avatar — esto no estaba documentado acá. Debajo de la card de nombre/avatar se renderiza `PhotoGalleryCard` (galería de fotos), tampoco mencionado antes en este bullet (solo aparecía en la tabla de "Interacciones").
  - **Seguridad** (`SecurityTab`): cambiar contraseña (actual + nueva) y cambiar email (nuevo email + contraseña actual), en dos cards separadas.
  - **Mi perfil de match** (`MatchProfileTab`, solo visible para `role === 'student' | 'host'`, no para `advisor`). **(2026-08-04, rediseñado)** Primera versión solo linkeaba a `/cuestionario/buscar`/`/cuestionario/ofrecer` — al construirla se encontró que esas páginas no precargaban el perfil existente (ver [[Perfiles]], bug ya corregido). Se rehízo para editar inline: `HostMatchProfile`/`StudentMatchProfile` (en `ProfilePage.tsx`) cargan el perfil con `getHostProfile`/`getStudentProfile` + `toHostQuestionnaireData`/`toStudentQuestionnaireData`, y lo muestran con el nuevo `QuestionnaireAccordion` (`components/features/questionnaire/`) — las 8/9 secciones colapsadas en acordeón (una abierta a la vez, chip "Completo"/"Faltan datos" por sección) en vez del wizard paso a paso. El guardado sigue siendo `submitHostQuestionnaire`/`submitStudentQuestionnaire`, los mismos que usa el wizard — es un layout distinto sobre el mismo contrato con el backend (`PUT` completo, no hay guardado parcial por sección). Nota: esta pestaña es en rigor el módulo [[Perfiles]] (cuestionario host/student), no "Cuenta" — vive acá porque `ProfilePage.tsx` es una pantalla compartida entre ambos módulos; no se tocó su documentación de contenido más allá de constatar que coincide con lo ya descrito en [[Perfiles]].
  - `QuestionnaireAccordion` reutiliza `QuestionnaireField` y los helpers `isFieldVisible`/`isValueFilled` (recién exportados desde `QuestionnaireWizard.tsx` para no duplicar esa lógica) — antes de guardar, valida los obligatorios de **todas** las secciones (no solo la abierta) y si falta algo abre la primera sección incompleta.
  - El wizard (`/cuestionario/*`) no se tocó — sigue siendo el flujo de alta la primera vez, y ahora también sirve de fallback si alguien llega ahí directo.
- **(2026-09-16)** `components/features/profile/PhotoGalleryCard.tsx`: card dentro de `AccountTab`, debajo de nombre/avatar. Sube y borra fotos al toque (sin botón de "guardar" aparte), igual que `AccountTab.handleAvatarChange`. Límite de `MAX_PHOTOS = 10` hardcodeado en el propio componente (oculta el botón "Agregar" al llegar al tope) — duplica el mismo número que `AccountService.MaxGalleryPhotos` en el backend, sin que viaje por la API; ver nota en "Pendiente".
- `App.tsx`: ruta `/mi-perfil` agregada, detrás de `ProtectedRoute` (sin `requireAdmin`).
- `Header.tsx`: dropdown de usuario — link **"Mi perfil"** agregado justo debajo del `menu-title` (nombre + rol) y arriba de "Ir a mi Panel" (admin)/"Cerrar Sesión". Resuelve el pendiente anotado en [[../00-Roadmap|00-Roadmap]] ("agregar botón Mi Perfil — depende de que exista ProfilePage").
- **(2026-08-10)** `SecurityTab` (contraseña actual, nueva contraseña, contraseña de confirmación para cambiar email) pasó a usar el `PasswordInput` compartido (`components/common/PasswordInput.tsx`, ver [[Auth]]) — botón de ojo para mostrar/ocultar, mismo componente que ahora también usan los forms de login/registro.
- **(2026-08-10, bug corregido)** La galería de fotos (`PhotoGalleryCard.tsx`, lee `user.gallery`) se veía vacía justo después de un login nuevo (cerrar sesión y volver a entrar, o entrar en otro dispositivo), aunque las fotos siguieran guardadas — porque `/api/auth/login`/`register` no mandaban `Gallery` en la respuesta y `AuthContext.login()` pisa el `user` completo. Se corrigió del lado de Auth, no acá — ver detalle en [[Auth]]. `GET /api/account/me` y las respuestas de `POST`/`DELETE /api/account/gallery` (este módulo) siempre habían devuelto la galería completa y correcta; el bug era exclusivo del flujo de login/registro.

## Interacciones

**Backend:** `AccountController` (`/api/account`, `[Authorize]`) → `AccountService` — **sin Repository** (igual que [[Auth]]: `UserManager<ApplicationUser>` + `IFileStorageService`, sin entidad propia).

| Endpoint | Service / método |
|---|---|
| `GET /api/account/me` | `GetMeAsync` |
| `PUT /api/account/me` | `UpdateNameAsync` |
| `POST /api/account/avatar` | `UpdateAvatarAsync` (vía `IFileStorageService`, subfolder `avatars/{userId}`) |
| `POST /api/account/gallery` | `AddGalleryPhotoAsync` (vía `IFileStorageService`, subfolder `gallery/{userId}`, máx. 10 fotos) |
| `DELETE /api/account/gallery` | `RemoveGalleryPhotoAsync` (query param `photoUrl`) |
| `PUT /api/account/password` | `ChangePasswordAsync` |
| `PUT /api/account/email` | `ChangeEmailAsync` |

**Frontend:** `services/accountService.ts` (`getMe`, `updateName`, `uploadAvatar`, `changePassword`, `changeEmail`, `uploadGalleryPhoto`, `removeGalleryPhoto`) — vía `apiFetch`, ver [[../convenciones/http-client|convenciones/http-client]].

| Componente | Funciones usadas | Contexto |
|---|---|---|
| `pages/ProfilePage.tsx` (`AccountTab`, `SecurityTab`) | `updateName`, `uploadAvatar`, `changePassword`, `changeEmail` | Tabs "Datos de cuenta" y "Seguridad" de `/mi-perfil` |
| `components/features/profile/PhotoGalleryCard.tsx` | `uploadGalleryPhoto`, `removeGalleryPhoto` | Galería de fotos dentro de `AccountTab` |

Cada función exitosa devuelve el `User` actualizado, que el componente pasa a `AuthContext.updateUser(userData)` (no reprograma el auto-logout, solo refresca `user` en memoria/`localStorage` — así el Header y el resto de la app ven el cambio al instante sin relogin).

```
AccountTab (ProfilePage.tsx)
  → updateName(name, token)                    [accountService.ts]
    → apiFetch('/api/account/me', { method: 'PUT', ... })   [httpClient.ts]
      → AccountController.UpdateMe → AccountService.UpdateNameAsync → UserManager
    ← AccountResponseDto
  → AuthContext.updateUser(user)                [refresca sin relogin]
```

## Decisión de diseño
- Se evaluó extender `ProfileController`/`ProfileService` existentes en vez de crear un módulo nuevo, pero esos ya tienen una responsabilidad clara y acotada (cuestionario de match, con DNI cifrado y lógica de `Generation`) — mezclar ahí datos de cuenta (password, email) habría acoplado dos conceptos distintos bajo el mismo Controller. Se optó por un módulo `Account` separado, replicando el criterio sin-Repository de `AuthService` (ambos operan pura y exclusivamente sobre `ApplicationUser` vía `UserManager`, sin entidades propias que justifiquen una capa de Repository).

## Pendiente
- Correr `dotnet build` real sobre el backend (el entorno de trabajo no tenía el SDK de .NET instalado) y probar los 7 endpoints en Postman.
- Decidir si cambiar el email debería re-emitir el JWT (hoy el token viejo sigue siendo válido hasta que expire naturalmente, y el claim `Email` que lleva adentro queda desactualizado hasta el próximo login) — no se tocó `TokenService` para no ampliar el alcance sin confirmarlo antes.
- `ChangeEmailRequestDto`/`ChangePasswordRequestDto` no tienen validación de complejidad de contraseña más allá de `MinLength(8)` — `RegisterForm.tsx` sí valida mayúscula/minúscula/dígito/símbolo en el registro; evaluar si el form de "Seguridad" debería exigir lo mismo.
- **(2026-09-16)** El límite de fotos de la galería (10) está hardcodeado por duplicado: `AccountService.MaxGalleryPhotos` en el backend y `PhotoGalleryCard.MAX_PHOTOS` en el frontend. `AccountResponseDto` no expone ese número, así que si el backend lo cambia, el frontend queda desincronizado (mostraría el botón "Agregar" hasta 10 aunque el backend ya rechace con otro tope, o al revés). Evaluar exponerlo en la respuesta de `/api/account/me` o centralizarlo en config.
- **(2026-09-16)** No se encontró la carpeta `Migrations/` en el código auditado para confirmar si `GalleryPhotoPaths` ya tiene su migración aplicada — verificar antes de dar por cerrado este módulo.
- Sin tests automatizados (mismo estado que el resto del backend hoy).

## Enlaces relacionados
- [[Auth]]
- [[Perfiles]]
- [[Confianza]]
- [[../00-Roadmap|00-Roadmap]]
- [[../convenciones/backend|convenciones/backend]]
- [[../convenciones/frontend|convenciones/frontend]]
