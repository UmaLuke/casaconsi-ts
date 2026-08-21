tags: [roadmap, casaconsi]

# 🗺️ Roadmap — CASA con SI

Estado general del proyecto. Última actualización: 2026-08-21 ("Interesados en tu publicación" — host ve estudiantes interesados, construida y pendiente de validar con la clienta, ver [[modulos/Match]]).

Ver también: [[glosario]] · [[convenciones/backend]] · [[convenciones/frontend]]

---

## 📌 Nuevos pendientes (reportados por la clienta, 2026-08-18)

Todavía sin desarrollar — quedan anotados acá para no perderlos, con las preguntas abiertas que hay que resolver antes de tocar código en cada uno.

- [ ] **Bug — `ExploreSpacesPage.tsx` sigue mostrando `Space`s ya decididos.** Un estudiante que ya le dio ✕/✓ a un `Space` (o ya hizo match con su anfitrión) lo sigue viendo en la grilla/perfil de `/explorar`. Comparar con `DiscoverPage.tsx`: ahí el feed (`GET /api/match/feed`) ya excluye perfiles decididos vía `MatchRepository.GetHostProfilesForFeedAsync`/`GetStudentProfilesForFeedAsync` (ver [[modulos/Match]]), pero `GET /api/space` (el que usa `ExploreSpacesPage`) es un listado público (`[AllowAnonymous]`, lo consume también el preview del landing sin sesión) sin ese filtro — ahí está la causa. A definir: ¿el filtro va en el backend (requiere diferenciar el caso autenticado del anónimo en `SpaceService`) o alcanza con filtrar client-side contra los matches/decisiones ya cargadas? Ver [[modulos/Space]] y [[modulos/Match]].
- [ ] **Feature — 3 matches semanales gratis, el resto pago.** Redefine el "Modelo freemium" tal como está descripto hoy en [[glosario]] (ahí dice que el match básico es gratis *sin límite*; esto lo cambia, hay que actualizar el glosario una vez que se cierre el diseño). Encaja naturalmente con `MembershipTier.Freemium`/`Premium` que ya existe en `ApplicationUser` para [[modulos/Confianza]], pero hace falta definir antes de implementar: ¿el límite cuenta *likes* dados o *matches* confirmados (mutuos)? ¿reset por semana calendario o ventana móvil de 7 días? ¿qué pasa con un like ya pendiente cuando se llega al límite, se bloquea o se permite terminar de confirmar? ¿cómo se paga el excedente — upgrade a Premium completo, o un cobro puntual por match extra? Esto último probablemente dependa de tener algún medio de pago integrado, que hoy el proyecto no tiene (ver Asesorías más abajo, que también necesita cobro y tampoco lo tiene resuelto).

  **Referencia de precios recibida de la clienta (2026-08-21, hipótesis inicial, no definitiva):**

  | Pack | Matches | Precio | Precio por match |
  |---|---|---|---|
  | 🟢 Gratis | 3 / mes | — | — |
  | 🟡 Pack Inicial | 5 | $5.500 | $1.100 |
  | 🔵 Pack Exploración ⭐ (sugerido por la clienta como el destacado) | 10 | $10.000 | $1.000 |
  | 🟣 Pack Búsqueda | 20 | $18.000 | $900 |
  | 💎 Pack Intensivo | 30 | $25.000 | $833 |

  Nota: la clienta habló de "3 Match / mes" gratis acá, no "3 semanales" como se había anotado antes en este mismo ítem — confirmar cuál es la cadencia real (mensual vs. semanal) antes de implementar el reset. Son packs de compra (no suscripción recurrente), a diferencia de `MembershipTier.Freemium`/`Premium` que hoy es un flag binario — falta definir si esto conviene modelarlo como un contador de créditos consumibles en vez de (o además de) el `MembershipTier` existente.
- [ ] **Bug — fotos de los anuncios de host.** Reportado sin detalle todavía; falta que la clienta precise el síntoma exacto (¿no se suben desde `NewSpaceForm`/edición? ¿no se ven en la grilla de `/explorar`? ¿en el detalle del anuncio?) antes de diagnosticar. Candidatos ya conocidos en el código que podrían estar relacionados: el gotcha de `wwwroot`/`UseStaticFiles()` en [[../convenciones/backend|convenciones/backend]] (fotos que dan 404 aunque el archivo exista en disco), y el fallback de `PhotoUrls` a `HostProfile.HomePhotoPaths` cuando el anuncio no tiene fotos propias, documentado en [[modulos/Space]] (2026-08-05) — puede ser que ese fallback esté mostrando la foto equivocada en algún caso. Confirmar reproducción antes de tocar nada.
- [ ] **Módulo Admin — priorizado por la clienta.** Ya estaba listado como "no iniciado" (ver sección [[#🔐 Módulo Admin (pendiente, no iniciado)]] más abajo); pasa a ser prioridad. Sigue sin alcance definido — antes de arrancar hay que decidir qué incluye (gestión de usuarios, moderación de `Space`s, aprobación/revisión de verificación de perfiles — ver [[modulos/Confianza]] pendiente de "flujo de revisión de staff" —, y probablemente gestión de membresías/pagos si sale el punto anterior).

---

## ✅ Backend — Completado

### Módulo Auth ([[modulos/Auth]])
- `ApplicationUser` (extiende `IdentityUser`) con `Name`, `Role`, `Avatar`, `Title`, `Generation`.
- `AuthService`, `TokenService`, `AuthController` con `POST /api/auth/register` y `POST /api/auth/login`.
- Identity + JWT Bearer configurado en `Program.cs`.
- Migración de Identity aplicada a `db_ccs` (20 columnas).
- Verificado end-to-end con Postman.

### Módulo Cuenta ([[modulos/Cuenta]])
- **(2026-08-04)** Datos de *cuenta* (nombre, email, password, avatar) — distinto del perfil de match. `AccountController` → `AccountService` (sin Repository, mismo criterio que Auth: `UserManager<ApplicationUser>` hace de capa de datos) con endpoints `GET/PUT /api/account/me`, `POST /api/account/avatar`, `PUT /api/account/password`, `PUT /api/account/email`.
- Sin migración nueva: reutiliza columnas existentes de `ApplicationUser`.
- Frontend: `accountService.ts`, `AuthContext.updateUser` (refresca sesión sin relogin), `ProfilePage.tsx` (ruta `/mi-perfil`) con tabs de cuenta/seguridad/perfil de match, y link "Mi perfil" en el dropdown de `Header.tsx`.
- Pendiente compilar con `dotnet build` real y probar en Postman/UI — ver [[modulos/Cuenta]].

### Módulo Perfiles / cuestionario post-registro ([[modulos/Perfiles]])
- `StudentProfile` (9 secciones) y `HostProfile` (8 secciones), jsonb + columnas promovidas para el futuro Match.
- `ProfileController` → `ProfileService` → `ProfileRepository`, endpoints `GET /status`, `PUT/GET /student`, `PUT/GET /host`, subida de fotos para ambos roles.
- DNI cifrado (Data Protection), `Generation` derivada de `BirthDate` en el backend.
- Migración `AddProfiles` aplicada a `db_ccs`.
- `DemoProfileSeeder` (solo Development): 3 estudiantes + 3 anfitriones con perfiles completos — ver [[datos-demo]].

### Módulo Match ([[modulos/Match]])
- Like mutuo: `ProfileLike` (swipe direccional) + `Match` (se crea cuando hay like mutuo).
- `MatchController` → `MatchService` → `MatchRepository`. Endpoints: `GET /api/match/feed`, `POST /api/match/like`, `GET /api/match`.
- Migración `AddMatch` aplicada a `db_ccs`.
- Regla de generación opuesta (`canMatch` de `frontend/src/types/filters.ts`) implementada en el feed y en el like.
- Frontend: `GET /api/match` conectado en `MessagesPage.tsx` (sección "Match's"). `POST /api/match/like` conectado desde `ExploreSpacesPage.tsx`/`SpaceDetailsModal.tsx` (botones ✕ rechazar / ✓ match sobre un Space, ver [[modulos/Space]]) y desde `DiscoverPage.tsx` (`GET /api/match/feed` + swipe, ver [[modulos/Match]]).

### Módulo Space ([[modulos/Space]])
- `Space`: habitación/propiedad publicada por un anfitrión (N:1 con `ApplicationUser`, no confundir con `HostProfile.HousingData`, que es el cuestionario).
- `SpaceController` → `SpaceService` → `SpaceRepository`. Endpoints: `GET /api/space` (público), `GET /api/space/{id}` (público), `GET /api/space/mine`, `POST /api/space`, `POST /api/space/{id}/photos` (los últimos tres, solo Host).
- Migraciones `AddSpace` + `FixSpaceHostRelationship` aplicadas a `db_ccs` (la segunda corrige una FK sombra duplicada — ver [[convenciones/backend]], sección Gotchas).
- `DemoSpaceSeeder` (solo Development): 3 espacios de prueba, uno por cada anfitrión demo — ver [[datos-demo]].
- Frontend: `ExploreSpacesPage.tsx` conectado a `GET /api/space` vía `spaceService.ts`, reemplazando el array `mockSpaces` hardcodeado. Filtros siguen siendo client-side sobre los datos ya traídos.
- `SpaceResponseDto` ahora expone `HostUserId`. Botón "Ver detalles" de cada card abre `SpaceDetailsModal.tsx` (nuevo); debajo del botón (y en el footer del modal) hay botones ✕/✓ (`MatchDecisionButtons.tsx`, nuevo) que llaman a `POST /api/match/like` — ver [[modulos/Match]].

## ✅ Frontend — Completado (Fase 1, según Hoja de Ruta técnica)

- Enrutamiento resuelto (Vite `import-analysis`, árbol de rutas en `App.jsx`).
- Sistema de diseño: DaisyUI 5 + Tailwind CSS 4.
- `AuthContext.jsx`: manejo reactivo de sesión (login/logout).
- `LoginModal.jsx`: formulario unificado (pendiente de conectar a API real, ver abajo).
- `Header.jsx`: dinámico, transparente→translúcido con scroll, dropdown de usuario autenticado.
- `DashboardPage.jsx`: layout responsivo con sidebar, breadcrumbs y métricas por rol.
- `User` (tipo) corregido: `id: string` no opcional.
- `RegisterForm.tsx`: valida complejidad de contraseña igual que el backend.

---

## 🚧 En curso / próximos pasos inmediatos

- [x] JWT: `localStorage` (ver [[decisiones/ADR-0002-persistencia-jwt]]). `AuthContext`, `authService.ts` y `questionnaireService.ts` ya conectados a los endpoints reales.
- [x] Backend del cuestionario post-registro (estudiante: 9 secciones, anfitrión: 8 secciones) — ver [[modulos/Perfiles]]. Falta conectar el frontend del cuestionario (ya construido) a estos endpoints.
- [x] Frontend: unificadas las páginas `MessagesPage` y `MatchesPage` en una sola (`/mensajes`, con sección "Match's" arriba de "Mensajes"). `MatchesPage.tsx` eliminada, ruta `/matches` sacada de `App.tsx`, botón correspondiente sacado del `FloatingNav`.
- [x] `MessagesPage.tsx` (sección "Match's") conectada a `GET /api/match` — ver [[modulos/Match]].
- [x] Backend del módulo Space + `ExploreSpacesPage.tsx` conectado a `GET /api/space` (ver [[modulos/Space]]) — 3 espacios demo enlazados a los anfitriones demo, reemplazando `mockSpaces`.
- [x] `SpaceDetailsModal.tsx` + botones de like/pass (`MatchDecisionButtons.tsx`) sobre un `Space`, conectados a `POST /api/match/like` — ver [[modulos/Space]] y [[modulos/Match]]. Requirió exponer `HostUserId` y `HostName` en `SpaceResponseDto`.
- [x] `DiscoverPage.tsx` (ruta `/descubrir`, protegida): pantalla de swipe (un perfil a la vez) conectada a `GET /api/match/feed` + `POST /api/match/like` — ver [[modulos/Match]]. `Header` linkea "Descubrir Perfiles" solo para `role === 'host'`; `LoginModal` ahora redirige por rol (`host` → `/descubrir`, `student` → `/explorar`) en vez de mandar a todos a `/explorar`.
- [x] **(2026-08-01)** `AuthContext.tsx` ahora persiste también `expiresAt` (ya lo devolvía el backend en `AuthResponseDto`, no se usaba) y programa un `setTimeout` que dispara `logout()` justo al vencer el token; al rehidratar desde `localStorage` también chequea si ya venció. `logout()` pasó a navegar directo a `/` (`App.tsx` se reordenó: `Router` ahora envuelve a `AuthProvider` para que pueda usar `useNavigate()`) — así el logout automático redirige a la landing sin depender de que la página esté detrás de `ProtectedRoute` (`/explorar`, `/mensajes` y `/asesorias` son públicas). Ver [[decisiones/ADR-0002-persistencia-jwt]] actualizado.
- [x] **(2026-08-11)** Interceptor de 401 → `logout()` automático para el caso en que el backend invalida el token *antes* de su vencimiento natural (ban, cambio de rol, etc.). Nuevo `services/httpClient.ts` (`apiFetch`) centraliza todos los requests de `services/*.ts`; si la response es 401 **y** el request llevaba header `Authorization`, dispara un `CustomEvent` (`casaconsi:unauthorized`) en `window`. `AuthContext.tsx` se suscribe a ese evento y llama a `logout()` — mismo patrón desacoplado que usa `scheduleAutoLogout` para el vencimiento por tiempo. El filtro por "llevaba Authorization" es a propósito: un 401 en `/api/auth/login`/`register` (que no llevan token) es "credenciales incorrectas", no una sesión invalidada, y no debe disparar logout. Pendiente real: sigue sin existir un endpoint `/me` para revalidar el token contra el backend al rehidratar desde `localStorage` (hoy solo se chequea `expiresAt` localmente) — eso es un caso distinto (invalidación silenciosa que nunca llega a generar un 401 porque no hay ningún request de por medio) y queda abierto.
- [x] **(2026-08-03)** `App.tsx`: `/mensajes`, `/cuestionario/buscar` y `/cuestionario/ofrecer` pasaron a estar detrás de `ProtectedRoute`. Las tres ya usaban `token` internamente (`MessagesPage`, `StudentQuestionnairePage`, `HostQuestionnairePage`) pero no tenían gate en el router — sin sesión, `MessagesPage` por ejemplo mostraba directamente "Todavía no tenés matches" en vez de pedir login, lo cual era engañoso. `/explorar` y `/asesorias` siguen públicas a propósito (navegación sin cuenta).
- [x] **(2026-08-03)** Landing (`components/features/landing/ExploreSpaces.tsx`): reemplazado el array `mockSpaces` hardcodeado por los mismos datos reales que usa `/explorar` (`GET /api/space` vía `spaceService.getSpaces()`), recortados a los primeros 3 para el preview. "Ver Detalles" de cada card y el botón "Ver todos los espacios" ahora abren el `LoginModal` (`document.getElementById('login_modal')`) en vez de mostrar el detalle o navegar a `/explorar` si no hay sesión — mismo criterio ya aplicado en `ExploreSpacesPage.tsx` (`handleOpenDetails`), que también quedó gateado ahí. El listado en sí (grilla/preview) sigue siendo público; lo que pide login es el detalle de un espacio.
- [x] **(2026-08-04)** Nuevo módulo Cuenta ([[modulos/Cuenta]]): botón "Mi perfil" en el dropdown de `Header.tsx` → `ProfilePage.tsx` (`/mi-perfil`, protegida) con edición de nombre/avatar, cambio de contraseña/email, y acceso directo al cuestionario de match. Backend: `AccountController`/`AccountService` nuevos (`/api/account/*`), sin migración (reutiliza columnas de `ApplicationUser`). *Nota:* `GET /api/account/me` no es el mismo `/me` que se venía pidiendo en el pendiente de abajo (interceptor de 401) — vive en el módulo Cuenta, no en Auth, y tampoco resuelve la revocación server-side; solo devuelve los datos vigentes del usuario del token.
- [x] **(2026-08-04)** Bug encontrado al armar el módulo Cuenta: `StudentQuestionnairePage.tsx`/`HostQuestionnairePage.tsx` nunca cargaban el perfil ya guardado al reeditar — el cuestionario se veía en blanco y, al ser el `PUT` un upsert, guardar así pisaba el perfil completo con los defaults vacíos (riesgo real de pérdida de datos). Corregido: `getStudentProfile`/`getHostProfile` + `toStudentQuestionnaireData`/`toHostQuestionnaireData` nuevos en `questionnaireService.ts`, y ambas páginas precargan `formData` desde el perfil existente al montar. Fotos quedan fuera de la precarga a propósito (no se pierden, ver [[modulos/Perfiles]]).
- [x] **(2026-08-04)** Pestaña "Mi perfil de match" de `ProfilePage.tsx` rediseñada: de un link al wizard externo a edición inline con acordeón (`QuestionnaireAccordion`, componente nuevo) — las secciones se ven colapsadas de a una, con chip de completitud, reusando `QuestionnaireField` y el mismo `submitHostQuestionnaire`/`submitStudentQuestionnaire` del wizard. Idea tomada de la pantalla "Editar perfil" de una app de citas (referencia visual del cliente) — ver [[modulos/Cuenta]].
- [x] **(2026-08-05)** `SpaceDetailsModal.tsx` (ver [[modulos/Space]]): la imagen única del header pasó a ser un carrusel. De paso se encontró que `Space.PhotoPaths` ya soportaba varias fotos propias por anuncio (`POST /api/space/{id}/photos` ya funcionaba) pero `SpaceResponseDto` solo exponía la primera — se agregó `PhotoUrls` completo, con fallback a `HostProfile.HomePhotoPaths` cuando el anuncio no tiene fotos propias (caso de los 3 espacios demo hoy).
- [x] **(2026-08-10)** `components/common/PasswordInput.tsx` (nuevo): botón de ojo para mostrar/ocultar contraseña en `LoginForm.tsx`, `RegisterForm.tsx`, `RegisterAdvisorForm.tsx` y `SecurityTab` de `ProfilePage.tsx` — ver [[modulos/Auth]].
- [x] **(2026-08-10)** `StudentQuestionnairePage.tsx`/`HostQuestionnairePage.tsx` precargan nombre y email desde la cuenta recién creada, para no volver a pedirlos justo después del registro — ver [[modulos/Perfiles]].
- [x] **(2026-08-10, bug corregido)** Galería de fotos vacía tras un login nuevo: `/api/auth/login`/`register` no mandaban `Gallery` en `AuthResponseDto`, así que `AuthContext.login()` pisaba el `user` guardado con `gallery: []` aunque las fotos siguieran en el servidor. Corregido en `AuthService`/`AuthResponseDto` (backend) y `authService.ts` (frontend) — ver [[modulos/Auth]] y [[modulos/Cuenta]].

**Verificado 2026-07-27:** confirmado en `frontend/src/pages` que `RegisterPage`, `ProfilePage`, `SpaceDetailPage`, `MySpacesList`, `NewSpaceForm`, `IncomingRequests`/`ApplicationsList` no existen todavía (solo están: `LandingPage`, `DashboardPage`, `DiscoverPage`, `ExploreSpacesPage`, `MessagesPage`, `AdvisoryPage`, `auth/`, `questionnaire/`). `AdvisoryPage.tsx` existe como pantalla placeholder — el backend de Asesorías sigue en estado "No iniciado" ([[modulos/Asesorias]]).

---

## 🎨 Ajustes visuales y de sesión (2026-08-01)

- [x] `Header.tsx`: unificado el color de fondo en todas las páginas internas. Antes solo `/` (con scroll) y `/explorar` tenían la franja `bg-brand-teal`; el resto (Dashboard, Descubrir, Mensajes, Asesorías) caía en `bg-brand-navy`. Ahora todo lo que no sea la landing usa teal; la landing mantiene el comportamiento transparente→teal con scroll.
- [x] `Header.tsx`: achicada la altura de la franja sin tocar el tamaño del logo ni de los íconos — se pisó el `min-height: 4rem` que trae `.navbar` de DaisyUI por defecto (clases `!min-h-0 !py-0`) y se ajustó el padding vertical externo del `<header>` a `py-2.5 md:py-3`.
- [x] `ExploreSpacesPage.tsx`: agregado un toggle "Cuadrícula / Perfil" (arriba a la derecha del título) para mostrarle al cliente dos versiones de la misma pantalla sin tocar código. "Cuadrícula" es la grilla de siempre; "Perfil" es una vista estilo Tinder — un solo `Space` a la vez (mismo estilo de card grande que usa `DiscoverPage` para perfiles de host), sin botón para "pasar" sin decidir. La cola avanza sola al marcar ✕/✓ con `MatchDecisionButtons`, y al agotarse muestra "Ya viste todos los espacios disponibles" con botón para reiniciar la demo.
- [x] `MatchDecisionButtons.tsx`: separación entre los botones ✕/✓ de `gap-3` a `gap-9`. Al ser un componente compartido, aplica en los dos roles (`ExploreSpacesPage` grilla y perfil, `DiscoverPage`, `SpaceDetailsModal`).
- [x] Logo nuevo (diseño recibido del cliente vía `Logo.svg`): es un lockup combinado — ícono + nombre dibujado como letras vectoriales, apaisado vertical (`viewBox` 436×550) — que no encajaba tal cual en los usos actuales (fila horizontal en el header, recorte circular en el footer). Se separó en dos assets nuevos en `public/`:
  - `logo-icon.svg` — solo el ícono, recortado a su bounding box real (`viewBox 0 0 436.81 412.5`). Reemplaza a `logo1.png` en `BrandLogo.tsx` (header).
  - `logo-full.svg` — el SVG completo tal cual lo mandaron, guardado para uso futuro en espacios más grandes (hero, login). Es el que terminó usándose en `Footer.tsx` (`h-[7.5rem]`, sin el recorte circular `.avatar rounded-full` que tenía antes ni el `<span>` de texto HTML al lado, porque el nombre ya viene dibujado adentro).
  - `logo1.png` quedó sin usar en `public/` (no se borró, por las dudas).

---

## 🐞 Bugs / ajustes de UI reportados (QA 2026-07-27, mobile 375px)

- [x] **(2026-07-30)** `FloatingNav.tsx`: la barra circular flotante (desktop/tablet, `fixed left-4`, ~62px de ancho) tapaba el contenido de las páginas que no reservaban espacio para ella — reportado sobre `MessagesPage` (cards de "Match's" cortadas), pero el mismo `<main>` se repite igual en `AdvisoryPage`, `DiscoverPage` y `ExploreSpacesPage` (ambos roles). Fix: agregado `md:pl-24` al `<main className="grow pt-28 md:pt-32 pb-20">` de las 4 páginas para reservar espacio a la izquierda solo en viewports `md+` (donde el nav flotante circular se muestra; en mobile es bottom-nav y no aplica).
- [x] **(2026-08-13, corregido — el reporte original decía "Registrarse")** `Header.tsx`: en viewport mobile el botón que desaparecía era **"Iniciar Sesión"** (`Registrarse` sí se veía) — tenía `hidden sm:flex`, y el dropdown del hamburguesa tampoco tenía forma de abrir el modal de login, solo linkeaba a anclas de la landing. Sin sesión, en mobile no había ninguna forma de loguearse. Fix: se sacó `hidden` del botón (ahora `flex` en todos los breakpoints, igual que en desktop) — había espacio de sobra al lado de "Registrarse", confirmado visualmente antes de aplicar. Ver [[modulos/Auth]].
- [x] **(2026-08-13)** `MessagesPage.tsx`: la sección "Match's" se reubicó — texto ("Match's" + "Aquí podrás ver tus conexiones") suelto a la izquierda (mismo margen que "Mensajes", debajo), y las cards de matches confirmados en un recuadro con borde a la derecha (`md:flex-1`), en fila con scroll horizontal. El match más nuevo queda primero (más a la izquierda) porque el backend ya ordena `GetMatchesAsync` por `CreatedAt` descendente — no requirió tocar el backend. En mobile se sigue apilando (texto arriba, recuadro abajo). Se pasó por dos vueltas de diseño (primera versión envolvía también el texto en el recuadro, rompía la alineación con "Mensajes" — se corrigió antes de aplicar el fix final). Ver [[modulos/Match]].
- [x] **(2026-08-04)** Dropdown de usuario (`Header.tsx`): agregado botón "Mi perfil", debajo del nombre/rol y arriba de "Ir a mi Panel"/"Cerrar Sesión" — ver [[modulos/Cuenta]].
- [x] **(2026-08-13, bug nuevo, no estaba en la lista de QA original)** `LoginModal.tsx`: el `modal-box` tenía `overflow-hidden` a secas, sin `max-height` — en mobile, si el contenido (header + alerta de error + form + footer) superaba la altura visible, no había forma de scrollear para llegar al botón de submit ni al link de registro. Mismo patrón de bug ya resuelto antes en `SpaceDetailsModal.tsx` (ver [[Space]]). Fix: se anidó un wrapper interno con `overflow-y-auto` + `max-h-[90vh]` para el scroll, dejando el `modal-box` de afuera con `overflow-hidden` (así el recorte a las esquinas redondeadas lo sigue haciendo el contenedor exterior, sin tener que adivinar valores de `border-radius` a mano en el header/footer — una primera versión intentó redondear header/footer directamente y dejó artefactos visuales en las 4 esquinas). Ver [[modulos/Auth]].
- [x] **(2026-08-13)** `BrandLogo.tsx` (ícono + "CASA CON SI" en el header): sin `gap` entre el ícono y el texto, quedaban pegados. Se agregó `gap-3` al contenedor flex.

---

## 📋 Fase 2 — Vistas específicas por rol (frontend, pendiente)

### Módulo común
- [x] **(aprobado, verificado 2026-08-18)** `RegisterPage.tsx` / `RegisterForm.tsx` — diseño final del flujo de creación de cuenta, ya construido y aprobado por la clienta. Pantalla partida: panel izquierdo con imagen de fondo + degradé navy y texto de marca ("Comienza tu historia de convivencia", acento naranja), panel derecho con el formulario (selector de rol Ofrecer casa/Buscar casa, nombre, email, contraseña con visibilidad toggle, botón naranja de submit). En mobile el panel izquierdo se oculta y queda el logo + formulario centrado. La nota "verificado 2026-07-27: RegisterPage no existe todavía" (más abajo, sección de próximos pasos) quedó desactualizada — la pantalla se construyó después de esa verificación.
- [x] **(2026-08-04)** `ProfilePage.tsx` — gestión de datos de cuenta (nombre, foto/avatar) y seguridad (contraseña, email). Las "preferencias de convivencia" quedaron afuera a propósito: eso es el cuestionario de match (ver [[modulos/Perfiles]]), al que la pestaña "Mi perfil de match" solo linkea en vez de duplicar el formulario — ver [[modulos/Cuenta]].

### Módulo estudiante (buscador de alojamiento)
- [x] `ExploreSpacesPage.jsx` — buscador con filtros (precio, zona, servicios) + grid. Conectado a `GET /api/space` real (ver [[modulos/Space]]).
- [ ] `SpaceDetailPage.jsx` — ficha de propiedad, galería, perfil de anfitrión, solicitud de reserva. Backend ya soporta `GET /api/space/{id}`, falta la pantalla.
- [ ] `ApplicationsList.jsx` — seguimiento de solicitudes (Pendiente / En Entrevista / Aceptada). ⚠️ Ver nota de inconsistencia en [[modulos/Match]]: no está claro si esto convive con el modelo de like mutuo o queda obsoleto.

### Módulo anfitrión (gestión de propiedades)
- [ ] `MySpacesList.jsx` — administrar habitaciones publicadas. Backend ya soporta `GET /api/space/mine`, falta la pantalla.
- [ ] `NewSpaceForm.jsx` — alta de alojamiento por pasos. Backend ya soporta `POST /api/space` + `POST /api/space/{id}/photos`, falta la pantalla.
- [ ] `IncomingRequests.jsx` — gestión de solicitudes recibidas (aceptar/rechazar). Misma nota de inconsistencia que `ApplicationsList.jsx`.
- [x] **(construida 2026-08-21, pendiente de validar con la clienta)** `InterestedStudentsPage.tsx` (`/interesados`) + `StudentDetailPage.tsx` (`/interesados/:studentUserId`) — cuadrícula de estudiantes que ya le dieron like al host y todavía no decidió, mismo patrón visual que `SpaceDetailPage.tsx`. Backend nuevo: `GET /api/match/interested` + `GET /api/match/interested/{studentUserId}` (`[Authorize(Roles = "Host")]`), sin migración (reusa `ProfileLike`). Ver detalle completo en [[modulos/Match]]. Falta: agregar el link en `Header.tsx`/`FloatingNav.tsx` (hoy solo se accede escribiendo la URL) y probar con datos reales.

---

## 🧱 Backend — módulos pendientes

- [ ] [[modulos/Asesorias]] — en curso. ✅ Rol de asesor (`UserRole.Advisor`) y ✅ alta de cuenta (`RegisterAdvisorPage` en `/register/asesor`, campo `Profession` persistido vía migración `AddProfessionToApplicationUser`) — ver [[decisiones/ADR-0003-rol-asesor]]. Falta: agenda/reserva de sesión, pago asociado, conectar el listado de asesores de la landing (`Advisors.tsx`) a datos reales en vez de `mockAdvisors`, y vista de gestión del lado del asesor. Sigue pendiente el ajuste de `LoginModal.tsx` para el redirect post-login de `advisor`.
- [x] **(2026-08-17)** Chat en tiempo real (SignalR) — ver [[modulos/Chat]] para el detalle completo. `Message` cuelga directo de `Match` (sin entidad `Conversation` separada), `ChatHub` (`/hubs/chat`) + `ChatController` (`/api/chat`) → `ChatService` → `ChatRepository`, migración `AddChat` aplicada a `db_ccs`. Frontend: `MessagesPage.tsx` reemplaza el placeholder de "Mensajes" por lista de conversaciones + panel de chat conectado en tiempo real (`chatService.ts` + `@microsoft/signalr`). **Backend cerrado; frontend queda abierto para mejoras** (ver sección "Mejoras pendientes" en [[modulos/Chat]] — layout del panel, estados de conexión/reconexión visibles al usuario, paginación de historial, indicador de mensaje enviado/leído, etc.).
- [x] Pantalla de descubrimiento/swipe para `GET /api/match/feed` + `POST /api/match/like` → `DiscoverPage.tsx` (`/descubrir`), ver [[modulos/Match]].
- [x] **(2026-08-06)** Backend del módulo Confianza/Verificación de perfiles — sistema de puntaje 0-10 (10 ítems del docx del cliente, gateados por `MembershipTier` Freemium/Premium), `TrustController` (`/api/trust/status`, `/api/trust/items`) → `TrustService` → `TrustRepository`, migración `AddTrustVerification`. Frontend: insignia `TrustBadge.tsx` conectada en `ProfilePage.tsx`. Ver [[modulos/Confianza]] — falta UI para autodeclarar los ítems, insignia pública en Discover/Explorar, y definir el flujo de revisión de staff (depende del Módulo Admin, todavía no iniciado).

---

## 🔐 Módulo Admin (pendiente, no iniciado)

- [ ] Panel/perfil admin en el frontend: hoy solo existe `AdminSeeder` + flag `IsAdmin` en el backend (ver `memory`/[[modulos/Auth]]), no hay pantalla ni rutas de administración. Falta definir alcance (gestión de usuarios, moderación de Spaces, aprobación de perfiles, etc.) antes de construir.

---

## 🚀 Fase 3 — Integración y refinamiento (futuro)

- [ ] Capa de servicios (`src/services/`): reemplazar datos hardcodeados por peticiones HTTP reales.
- [ ] Estados de carga (Skeletons) reales.
- [ ] Sistema de notificaciones (Toasts) para acciones clave.
- [ ] Tipografía de marca: Playfair Display, Cormorant Garamond, Montserrat (hoy cae al stack por defecto de Tailwind).
- [x] Navegación mobile: `FloatingNav.tsx` ahora renderiza también una bottom-nav fija (ícono + label) para viewports `< md`, en vez de desaparecer — la barra circular original sigue igual en `md` y superior. Mismos `navItems` (Inicio según rol, Mensajes, Asesorías) en ambas versiones.
- [ ] Evaluar unificación de FloatingNav con el sidebar del Dashboard.
- [ ] **(anotado 2026-08-06)** Reemplazar la validación manual de identidad (ítem 1 de [[modulos/Confianza]]) por un servicio de KYC/biometría automática (tipo Onfido/Veriff/Truora o validación biométrica RENAPER, como usan las apps bancarias) — pospuesto a propósito: el docx del cliente pedía comparación manual, suma un proveedor pago, y los datos biométricos son "datos sensibles" bajo la Ley 25.326 (requiere revisión legal antes de construirlo). Reevaluar cuando haya volumen real de usuarios.

---

## 💰 Optimización de costos (Azure, pendiente)

- [ ] **(anotado 2026-08-03, pospuesto)** `SpaceRepository.GetActiveAsync()` / `SpaceService.GetActiveSpacesAsync()` traen **todos** los espacios activos sin límite. Tanto el preview del landing (`ExploreSpaces.tsx`, se queda solo con los primeros 3 vía `.slice()`) como potencialmente `ExploreSpacesPage.tsx` a futuro con catálogo grande, están trayendo de más. Ideas evaluadas para cuando se despliegue en Azure:
	- `.Take(3)` (o un parámetro `take`/endpoint de preview) en la query de EF Core, para no traer el catálogo completo solo para mostrar 3 en el landing.
	- `IMemoryCache` con TTL corto (2-5 min) en `SpaceService`, para no pegarle a Postgres en cada visita al landing/`/explorar` sin sesión. Preferido sobre un archivo en disco (efímero en App Service, no sobrevive reinicios/reescalados) y sobre un cache distribuido tipo Redis (agregaría un recurso de Azure pago, no se justifica al tamaño actual).
	- Se descartó volver a mockear el preview del landing: el costo real de esta consulta puntual es insignificante comparado con tener la instancia de Postgres levantada; no vale la pena perder el dato en vivo por eso.
	- Nota de costos: en Azure Database for PostgreSQL Flexible Server se factura por el tier de cómputo/storage contratado (uptime), no por consulta ni por columnas leídas — el ahorro real viene de reducir la cantidad de round-trips y el tamaño de cada uno a medida que crece el catálogo, no de "optimizar el SELECT" en sí.

---

## 🔑 Datos de entorno (no sensibles, solo referencia)

- PostgreSQL en puerto **5433** (no default), DB `db_ccs`.
- Backend en puerto **8000**, frontend Vite en **5173**.
- Secrets (`ConnectionStrings:DefaultConnection`, `Jwt:Key`) viven en `dotnet user-secrets`, nunca en `appsettings.json` ni en `.env` commiteado.
