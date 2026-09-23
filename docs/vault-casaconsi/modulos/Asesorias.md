tags: [modulo, backend, frontend]

# Módulo: Asesorías

**Estado:** 🚧 Agenda/reserva/listado real ya funcionan end-to-end (backend +
frontend). Reservas **centralizadas** desde el 2/9 (decisión de Lucía, ver
abajo): el cliente no elige asesora, solo tipo de sesión + día + horario.
Falta integrar pago real (ver "Pendiente" abajo) — nace en estado `Pending` y
se coordina fuera de la plataforma por ahora. **(2026-09-16)** También existe
un formulario público de autopostulación como asesor (`/register/asesor`,
ver abajo) que no estaba documentado en esta ficha.

## Decisión: reservas centralizadas (2/9)

La primera versión mostraba un catálogo de asesoras (`GET
/api/advisory/advisors`) y el cliente elegía una tarjeta puntual para
reservar — self-service. Lucía pidió cambiarlo: **no mostrar los
profesionales, solo los horarios**. Coincide con el doc de contenidos
("Citas de asesoría derivadas por Lic. Pozzo. Centralizado. Distribución por
sesión: 70% profesional / 30% plataforma").

Cómo quedó resuelto:

- Se sacó el catálogo público de asesoras del front — ni en `/asesorias` (ya
  no hay tab "Explorar asesores" con tarjetas por asesora) ni en la landing
  (la sección `Advisors.tsx` ahora presenta al equipo como conjunto y a los
  tres tipos de asesoría, sin nombres ni fotos individuales).
- El backend ya no expone `GET /api/advisory/advisors` ni
  `GET /api/advisory/advisors/{id}/availability`. Quedó un único endpoint de
  disponibilidad, `GET /api/advisory/availability?date=`, sin id de asesora.
  Confirmado en `AdvisoryController.cs`: los únicos endpoints hoy son
  `GET /api/advisory/availability`, `POST /api/advisory/sessions` y
  `GET /api/advisory/sessions/mine`.
- Todo turno se asigna internamente a la asesora marcada
  `ApplicationUser.IsPrimaryAdvisor = true` (hoy Lic. Pozzo, vía
  `AdvisoryRepository.GetPrimaryAdvisorAsync`) — el cliente nunca ve ese
  dato, `AdvisorySessionDto` ya no trae `AdvisorUserId` ni `AdvisorName`
  (confirmado en `DTOs/Advisory/AdvisoryDtos.cs`: el DTO solo tiene `Id`,
  `SessionType`, `ScheduledAt`, `Status`, `Price`). En "Mis sesiones" y en el
  mensaje de confirmación se muestra genéricamente "Equipo de Trabajo
  Social".
- A futuro, con más asesoras activas, la idea (confirmada con Lucía) es que
  el turno nazca sin asignar y cualquiera del staff lo tome al confirmarlo —
  reasignando `AdvisorUserId` en un endpoint de "aceptar turno" que todavía
  no existe. No hace falta cambio de esquema para eso (la columna
  `AdvisorUserId` ya existe); es trabajo pendiente, ver abajo.

## Alcance implementado

- **Sin catálogo de asesoras en el front** (ver decisión arriba). El
  staff real (Lic. Pozzo, Argañaraz, Britos, Carrara — Trabajo Social) sigue
  existiendo como `ApplicationUser` con `Role == Advisor` (ver
  [[decisiones/ADR-0003-rol-asesor]]), con `Bio`/`Profession`, pero esos
  datos ya no se sirven por API pública. Se siembran con
  `Data/DemoAdvisorSeeder.cs` (Development, idempotente/upsert) — Lic. Pozzo
  tiene `IsPrimaryAdvisor = true`, las otras tres `false`. El MP duplicado
  (8888) entre Britos y Carrara está así en el seeder a propósito, según el
  doc fuente de la clienta, no es un error de tipeo.
- **Precio único** para toda asesoría: $50.000 ARS (constante
  `SessionPrice` en `AdvisoryService`, no configurable por asesor) — es el
  valor real del doc "Servicios y precios" de la clienta. **(2026-09-16)**
  El front (`BookingForm.tsx`) repite ese mismo número como constante local
  (`SESSION_PRICE = 50000`) para poder mostrar el resumen de precio *antes*
  de confirmar — no hay un endpoint de "cotización". Si el precio cambia en
  el backend, hay que actualizar esta constante a mano en el front también;
  hoy no hay una única fuente de verdad para el precio del lado cliente.
- **Tipo de sesión** (`AdvisorySessionType`: `inicial` / `convivencia` /
  `final`) — las tres mediaciones del doc de servicios ("Mediación inicial",
  "Mediaciones de convivencia", "Mediación final"). Se elige al reservar,
  directo en `BookingForm.tsx` (ya no hay modal ni paso previo de elegir
  asesora). **(2026-09-16)** Ojo: el nombre visible de cada tipo no es
  consistente en todo el sitio. En la landing (`Advisors.tsx`) se llaman
  "Mediación inicial / de convivencia / final"; en el formulario de reserva
  (`SESSION_TYPE_LABELS`, `types/advisor.ts`) aparecen como "Asesoría de
  Inicio y Acuerdos / de Revisión y Convivencia / de Cierre". Es el mismo
  enum (`inicial`/`convivencia`/`final`) con dos textos de marketing
  distintos según la pantalla — no es un bug de datos, pero puede confundir
  a quien compare ambas pantallas.
- **Agenda con calendario mensual** (`MonthCalendar.tsx`, componente propio
  reutilizable, sin cambios en esta vuelta) — navegación mes a mes en vez de
  una tira de 7 días fija, así se puede reservar para otra semana sin
  esperar a que llegue. Lunes a viernes únicamente (fines de semana
  deshabilitados en el calendario y rechazados también en el backend), tope
  de `monthsAheadCap = 2` meses hacia adelante, días pasados deshabilitados.
- **Disponibilidad real por horario** (`GET
  /api/advisory/availability?date=YYYY-MM-DD`, público): la grilla **no es
  un rango continuo de 9 a 16:30** sino una lista fija de 6 horarios
  puntuales definida en `AdvisoryService.DailySlots`: **09:00, 10:30, 12:00,
  14:00, 15:30, 16:30**. El endpoint descuenta lo ya reservado ese día
  contra `AdvisorySessions` de la asesora primaria (se ignoran las
  sesiones `Cancelled` al calcular ocupación). **(2026-09-16)** Corregido:
  la versión anterior de este doc decía "grilla fija de 09:00 a 16:30" dando
  a entender un rango, cuando en realidad son esos 6 horarios exactos.
  También: `GetAvailabilityAsync` solo compara la fecha completa contra hoy
  (no la hora), así que para el día de hoy puede listar como "disponible"
  un horario que ya pasó en el reloj — el rechazo real por horario pasado lo
  hace `CreateSessionAsync` al confirmar (`scheduledAt <= DateTime.UtcNow`).
- **Reserva** (`POST /api/advisory/sessions`, requiere auth, sin
  `advisorUserId` en el body): valida día hábil, horario válido y libre, y
  que no sea en el pasado. Asigna internamente la asesora primaria y crea un
  `AdvisorySession` en estado `Pending` — no hay pasarela de pago en el
  proyecto todavía, así que no se puede marcar `Confirmed` de verdad; el
  texto del frontend dice explícitamente que el pago se coordina aparte
  (aunque el botón de confirmar todavía dice "Confirmar y pagar").
- **Mis sesiones** (`GET /api/advisory/sessions/mine`): tab junto a
  "Reservar turno", mismo empty state para cuando no hay sesiones. Cada fila
  muestra tipo + fecha/hora + "Equipo de Trabajo Social" (sin nombre
  puntual, ver decisión arriba). `GetMySessionsAsync` filtra únicamente por
  `ClientUserId` — nunca devuelve sesiones donde el usuario logueado es
  `AdvisorUserId` (ver "Pendiente" abajo).
- **Ruta `/asesorias` protegida** (sin cambios en esta vuelta).
- **Redirect post-login del asesor** a `/asesorias` (sin cambios en esta
  vuelta).
- **(2026-09-16) Alta de asesores por autopostulación** — no estaba en este
  doc. Existe una ruta pública `/register/asesor`
  (`RegisterAdvisorPage.tsx`) con un formulario propio
  (`RegisterAdvisorForm.tsx`, CTA "Postularme como asesor" enlazado desde la
  sección `Advisors.tsx` de la landing). Pide nombre, profesión (texto libre,
  precargado en "Trabajo Social"), email y contraseña; fija `role: 'advisor'`
  y llama al mismo `registerRequest` / `POST /api/auth/register` que usa el
  registro de clientes (`authService.ts`) — no se verificó en este alcance
  si `AuthController` (fuera de este módulo) aplica algún paso adicional de
  aprobación para ese rol. Al registrarse, loguea directo y redirige a
  `/asesorias`, sin cuestionario posterior. El propio código lo marca como
  temporal: *"Formulario temporal: el listado de campos puede cambiar
  cuando definamos el alcance final del módulo de Asesorías."*

## Pendiente

- **Endpoint de "aceptar turno"**: cuando haya más de una asesora activa,
  falta un `POST /api/advisory/sessions/{id}/accept` (protegido a rol
  `Advisor`) que reasigne `AdvisorUserId` a quien confirma y pase el estado
  a `Confirmed`. No hace falta cambio de esquema — la columna ya existe.
  Hoy no hay UI ni cuenta de asesora con login activo con vista propia,
  salvo la demo.
- **Pago real**: no hay pasarela integrada en el proyecto (ver Roadmap,
  "Pendiente real"). Hoy toda sesión nace `Pending` y se coordina por fuera.
  Cuando exista el módulo de pagos general, definir si `AdvisorySession` se
  engancha ahí o tiene su flujo propio (pregunta abierta desde el inicio del
  módulo).
- **Agenda individual por asesora**: hoy la grilla de horarios (los 6
  horarios fijos listados arriba) es la misma para todo el staff — no hay
  forma de que cada una defina su propia disponibilidad. Tiene más sentido
  resolverlo junto con el punto de "aceptar turno".
- **Reprogramar / cancelar sesión** desde "Mis sesiones": no implementado
  (no hay endpoints `PUT`/`DELETE` sobre `sessions` en el controller).
- **Vista de gestión del lado de la asesora** (ver sus propias sesiones
  reservadas): no implementado — hoy `GetMySessionsAsync` solo devuelve las
  sesiones donde el usuario es `ClientUserId`, nunca `AdvisorUserId`. Se
  necesita para el endpoint de "aceptar turno" de arriba.
- **(2026-09-16) Revisión/aprobación de altas de asesor**: el formulario
  `/register/asesor` deja al usuario con `Role.Advisor` activo de inmediato
  al enviar el form (mismo flujo que un registro de cliente común), sin un
  paso intermedio de validación de matrícula/identidad. Si se espera algún
  filtro antes de habilitar a alguien como asesor real, todavía no existe
  en el código.
- **(2026-09-16) Precio hardcodeado en dos lugares**: `SessionPrice` en
  `AdvisoryService` (backend) y `SESSION_PRICE` en `BookingForm.tsx`
  (frontend) son dos constantes independientes con el mismo valor. Si
  cambia el precio, hay que tocar los dos archivos; no hay un endpoint que
  el front pueda consultar para mostrar el precio antes de reservar.

## Interacciones

```
AdvisoryPage.tsx (/asesorias, protegida)
  ├─ tab "Reservar turno"
  │    → BookingForm.tsx (tipo de sesión + MonthCalendar + horarios, sin
  │      elegir asesora)
  │         → getAvailability(date)              [al elegir día]
  │           → GET /api/advisory/availability?date=   [público]
  │             → AdvisoryService.GetAvailabilityAsync
  │               → AdvisoryRepository.GetPrimaryAdvisorAsync
  │         → createAdvisorySession(...)         [al confirmar]
  │           → POST /api/advisory/sessions       (auth, sin advisorUserId)
  │             → AdvisoryService.CreateSessionAsync (asigna asesora
  │               primaria, valida, Pending)
  └─ tab "Mis sesiones"
       → getMySessions(token)                    [advisoryService.ts]
         → GET /api/advisory/sessions/mine        (auth)
       → SessionCard × N (sin nombre de asesora — "Equipo de Trabajo Social")
```

`Advisors.tsx` (landing) ya no llama a la API — presenta los tres tipos de
asesoría de forma estática, sin datos de asesoras individuales. Desde ahí
sale además el CTA "Postularme como asesor":

```
Advisors.tsx (landing, CTA "Postularme como asesor")
  → /register/asesor → RegisterAdvisorPage.tsx
       → RegisterAdvisorForm.tsx (nombre, profesión libre, email, password)
         → registerRequest(...)                  [authService.ts]
           → POST /api/auth/register (role: 'advisor')
       → login() + redirect a /asesorias (sin cuestionario posterior)
```

## Enlaces relacionados

- [[00-Roadmap]]
- [[convenciones/backend]]
- [[decisiones/ADR-0003-rol-asesor]]
- [[Auth]]
