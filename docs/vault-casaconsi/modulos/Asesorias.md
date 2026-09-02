tags: [modulo, backend, frontend]

# Módulo: Asesorías

**Estado:** 🚧 Agenda/reserva/listado real ya funcionan end-to-end (backend +
frontend). Reservas **centralizadas** desde el 2/9 (decisión de Lucía, ver
abajo): el cliente no elige asesora, solo tipo de sesión + día + horario.
Falta integrar pago real (ver "Pendiente" abajo) — nace en estado `Pending` y
se coordina fuera de la plataforma por ahora.

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
- Todo turno se asigna internamente a la asesora marcada
  `ApplicationUser.IsPrimaryAdvisor = true` (hoy Lic. Pozzo, vía
  `AdvisoryRepository.GetPrimaryAdvisorAsync`) — el cliente nunca ve ese
  dato, `AdvisorySessionDto` ya no trae `AdvisorUserId` ni `AdvisorName`. En
  "Mis sesiones" y en el mensaje de confirmación se muestra genéricamente
  "Equipo de Trabajo Social".
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
  tiene `IsPrimaryAdvisor = true`, las otras tres `false`.
- **Precio único** para toda asesoría: $50.000 ARS (constante en
  `AdvisoryService`, no configurable por asesor) — es el valor real del doc
  "Servicios y precios" de la clienta.
- **Tipo de sesión** (`AdvisorySessionType`: inicial / convivencia / final) —
  las tres mediaciones del doc de servicios ("Mediación inicial",
  "Mediaciones de convivencia", "Mediación final"). Se elige al reservar,
  directo en `BookingForm.tsx` (ya no hay modal ni paso previo de elegir
  asesora).
- **Agenda con calendario mensual** (`MonthCalendar.tsx`, componente propio
  reutilizable, sin cambios en esta vuelta) — navegación mes a mes en vez de
  una tira de 7 días fija, así se puede reservar para otra semana sin
  esperar a que llegue. Lunes a viernes únicamente, tope de 2 meses hacia
  adelante, días pasados deshabilitados.
- **Disponibilidad real por horario** (`GET
  /api/advisory/availability?date=YYYY-MM-DD`, público): grilla fija de
  horarios (09:00 a 16:30 — todavía no hay agenda individual por asesora),
  descontando lo ya reservado ese día contra `AdvisorySessions` de la
  asesora primaria.
- **Reserva** (`POST /api/advisory/sessions`, requiere auth, sin
  `advisorUserId` en el body): valida día hábil, horario válido y libre, y
  que no sea en el pasado. Asigna internamente la asesora primaria y crea un
  `AdvisorySession` en estado `Pending` — no hay pasarela de pago en el
  proyecto todavía, así que no se puede marcar `Confirmed` de verdad; el
  texto del frontend dice explícitamente que el pago se coordina aparte.
- **Mis sesiones** (`GET /api/advisory/sessions/mine`): tab junto a
  "Reservar turno", mismo empty state para cuando no hay sesiones. Cada fila
  muestra tipo + fecha/hora + "Equipo de Trabajo Social" (sin nombre
  puntual, ver decisión arriba).
- **Ruta `/asesorias` protegida** (sin cambios en esta vuelta).
- **Redirect post-login del asesor** a `/asesorias` (sin cambios en esta
  vuelta).

## Pendiente

- **Endpoint de "aceptar turno"**: cuando haya más de una asesora activa,
  falta un `POST /api/advisory/sessions/{id}/accept` (protegido a rol
  `Advisor`) que reasigne `AdvisorUserId` a quien confirma y pase el estado
  a `Confirmed`. No hace falta cambio de esquema — la columna ya existe.
  Hoy no hay UI ni cuenta de asesora con login activo salvo la demo.
- **Pago real**: no hay pasarela integrada en el proyecto (ver Roadmap,
  "Pendiente real"). Hoy toda sesión nace `Pending` y se coordina por fuera.
  Cuando exista el módulo de pagos general, definir si `AdvisorySession` se
  engancha ahí o tiene su flujo propio (pregunta abierta desde el inicio del
  módulo).
- **Agenda individual por asesora**: hoy la grilla de horarios (09:00–16:30)
  es la misma para todo el staff — no hay forma de que cada una defina su
  propia disponibilidad. Tiene más sentido resolverlo junto con el punto de
  "aceptar turno".
- **Reprogramar / cancelar sesión** desde "Mis sesiones": no implementado.
- **Vista de gestión del lado de la asesora** (ver sus propias sesiones
  reservadas): no implementado — hoy `GetMySessionsAsync` solo devuelve las
  sesiones donde el usuario es `ClientUserId`, nunca `AdvisorUserId`. Se
  necesita para el endpoint de "aceptar turno" de arriba.

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
asesoría de forma estática, sin datos de asesoras individuales.

## Enlaces relacionados

- [[00-Roadmap]]
- [[convenciones/backend]]
- [[decisiones/ADR-0003-rol-asesor]]
