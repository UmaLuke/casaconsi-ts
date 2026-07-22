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

- [ ] **Decisión pendiente:** estrategia de persistencia del JWT — `localStorage` vs. estado en memoria (React) vs. cookie `httpOnly`. Definir antes de conectar `AuthContext`, `LoginModal.tsx` y `RegisterPage.tsx` a los endpoints reales.
- [x] Conectar frontend (`AuthContext`, `LoginModal.tsx`, `RegisterPage.tsx`) a los endpoints reales usando `src/config.ts` / `VITE_API_URL`.
- [ ] Backend del cuestionario post-registro (estudiante: 9 secciones, anfitrión: 8 secciones). Frontend del cuestionario ya está construido.

---

## 📋 Fase 2 — Vistas específicas por rol (frontend, pendiente)

### Módulo común
- [ ] `RegisterPage.jsx` / `RegisterModal.jsx` — diseño final del flujo de creación de cuenta.
- [ ] `ProfilePage.jsx` — gestión de datos personales, foto y preferencias de convivencia.

### Módulo estudiante (buscador de alojamiento)
- [ ] `ExploreSpacesPage.jsx` — buscador con filtros (precio, zona, servicios) + grid.
- [ ] `SpaceDetailPage.jsx` — ficha de propiedad, galería, perfil de anfitrión, solicitud de reserva.
- [ ] `ApplicationsList.jsx` — seguimiento de solicitudes (Pendiente / En Entrevista / Aceptada).

### Módulo anfitrión (gestión de propiedades)
- [ ] `MySpacesList.jsx` — administrar habitaciones publicadas.
- [ ] `NewSpaceForm.jsx` — alta de alojamiento por pasos.
- [ ] `IncomingRequests.jsx` — gestión de solicitudes recibidas (aceptar/rechazar).

---

## 🧱 Backend — módulos pendientes

- [ ] [[modulos/Space]] — repositorio y lógica de espacios/propiedades.
- [ ] [[modulos/Match]] — lógica de matching estudiante↔anfitrión.
- [ ] [[modulos/Asesorias]] — asesorías profesionales (pago por sesión).

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
