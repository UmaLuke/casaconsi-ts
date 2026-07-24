tags: [roadmap, casaconsi]

# 🗺️ Roadmap — CASA con SI

Estado general del proyecto. Última actualización manual: revisar fecha al editar.

Ver también: [[glosario]] · [[convenciones/backend]] · [[convenciones/frontend]]

---

## ✅ Backend — Completado

### Módulo Auth ([[modulos/Auth]])
- `ApplicationUser` (extiende `IdentityUser`) con `Name`, `Role`, `Avatar`, `Title`, `Generation`.
- `AuthService`, `TokenService`, `AuthController` con `POST /api/auth/register` y `POST /api/auth/login`.
- Identity + JWT Bearer configurado en `Program.cs`.
- Migración de Identity aplicada a `db_ccs` (20 columnas).
- Verificado end-to-end con Postman.

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
- Frontend: `GET /api/match` conectado en `MessagesPage.tsx` (sección "Match's"). `GET /api/match/feed` + `POST /api/match/like` sin pantalla todavía.

### Módulo Space ([[modulos/Space]])
- `Space`: habitación/propiedad publicada por un anfitrión (N:1 con `ApplicationUser`, no confundir con `HostProfile.HousingData`, que es el cuestionario).
- `SpaceController` → `SpaceService` → `SpaceRepository`. Endpoints: `GET /api/space` (público), `GET /api/space/{id}` (público), `GET /api/space/mine`, `POST /api/space`, `POST /api/space/{id}/photos` (los últimos tres, solo Host).
- Migraciones `AddSpace` + `FixSpaceHostRelationship` aplicadas a `db_ccs` (la segunda corrige una FK sombra duplicada — ver [[convenciones/backend]], sección Gotchas).
- `DemoSpaceSeeder` (solo Development): 3 espacios de prueba, uno por cada anfitrión demo — ver [[datos-demo]].
- Frontend: `ExploreSpacesPage.tsx` conectado a `GET /api/space` vía `spaceService.ts`, reemplazando el array `mockSpaces` hardcodeado. Filtros siguen siendo client-side sobre los datos ya traídos.

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
- [ ] Pendiente: interceptor de 401 → `logout()` automático (no hay endpoint `/me` para validar el token al rehidratar).

---

## 📋 Fase 2 — Vistas específicas por rol (frontend, pendiente)

### Módulo común
- [ ] `RegisterPage.jsx` / `RegisterModal.jsx` — diseño final del flujo de creación de cuenta.
- [ ] `ProfilePage.jsx` — gestión de datos personales, foto y preferencias de convivencia.

### Módulo estudiante (buscador de alojamiento)
- [x] `ExploreSpacesPage.jsx` — buscador con filtros (precio, zona, servicios) + grid. Conectado a `GET /api/space` real (ver [[modulos/Space]]).
- [ ] `SpaceDetailPage.jsx` — ficha de propiedad, galería, perfil de anfitrión, solicitud de reserva. Backend ya soporta `GET /api/space/{id}`, falta la pantalla.
- [ ] `ApplicationsList.jsx` — seguimiento de solicitudes (Pendiente / En Entrevista / Aceptada). ⚠️ Ver nota de inconsistencia en [[modulos/Match]]: no está claro si esto convive con el modelo de like mutuo o queda obsoleto.

### Módulo anfitrión (gestión de propiedades)
- [ ] `MySpacesList.jsx` — administrar habitaciones publicadas. Backend ya soporta `GET /api/space/mine`, falta la pantalla.
- [ ] `NewSpaceForm.jsx` — alta de alojamiento por pasos. Backend ya soporta `POST /api/space` + `POST /api/space/{id}/photos`, falta la pantalla.
- [ ] `IncomingRequests.jsx` — gestión de solicitudes recibidas (aceptar/rechazar). Misma nota de inconsistencia que `ApplicationsList.jsx`.

---

## 🧱 Backend — módulos pendientes

- [ ] [[modulos/Asesorias]] — asesorías profesionales (pago por sesión).
- [ ] Chat en tiempo real (SignalR): `Conversation`/`Message`, habilitado por `Match` (ver [[modulos/Match]]).
- [ ] Pantalla de descubrimiento/swipe (nueva, sin diseñar todavía) para conectar `GET /api/match/feed` + `POST /api/match/like`.

---

## 🚀 Fase 3 — Integración y refinamiento (futuro)

- [ ] Capa de servicios (`src/services/`): reemplazar datos hardcodeados por peticiones HTTP reales.
- [ ] Estados de carga (Skeletons) reales.
- [ ] Sistema de notificaciones (Toasts) para acciones clave.
- [ ] Tipografía de marca: Playfair Display, Cormorant Garamond, Montserrat (hoy cae al stack por defecto de Tailwind).
- [ ] Navegación mobile: bottom-nav para viewports `< md` (FloatingNav hoy oculto en mobile).
- [ ] Evaluar unificación de FloatingNav con el sidebar del Dashboard.

---

## 🔑 Datos de entorno (no sensibles, solo referencia)

- PostgreSQL en puerto **5433** (no default), DB `db_ccs`.
- Backend en puerto **8000**, frontend Vite en **5173**.
- Secrets (`ConnectionStrings:DefaultConnection`, `Jwt:Key`) viven en `dotnet user-secrets`, nunca en `appsettings.json` ni en `.env` commiteado.
