tags: [modulo, backend, frontend, confianza, verificacion, freemium]

# Módulo: Sistema de confianza / Verificación de perfiles

**Estado:** 🚧 Backend MVP + flujo de revisión de staff implementados end-to-end. Frontend: insignia en `ProfilePage.tsx` con los dos estados probados (Básico naranja, Alta confianza/Premium turquesa). **(2026-08-27)** Nuevo: panel Admin real para revisar y aprobar/rechazar los ítems 7-10 ("Alta Confianza") — cola + detalle, demostrado a la clienta — y las 2 primeras evidencias autocontenidas (antecedentes penales, referencias personales) visibles del lado admin. Decisiones tomadas: validación de identidad **manual** (no biometría automática, ver más abajo), diseño final de las **dos insignias** (`TrustBadge` + `PremiumBadge`), y que los ítems 7-10 **ya no se autodeclaran** — solo pasan a `true` cuando el staff aprueba desde el panel Admin. Falta: UI para que el usuario autodeclare los ítems 1-6, insignia pública en Discover/Explorar, flujo de pago Premium real, formulario del usuario para cargar la evidencia de Alta Confianza (backend ya listo), y los otros 2 ítems de evidencia (entrevista virtual, historial de convivencia — dependen de subsistemas que no existen todavía).

**Fuentes:** docx cliente "Verificación de Perfil" (los 10 ítems + umbrales de puntaje) + PDF "CASA CON SI — Propuesta de estructura web" (sección "SERVICIOS COMUNIDAD CON SI | FREEMIUM/PREMIUM", $7.000 ARS el "Perfil Verificado").

## Modelo de negocio (docx + PDF)
Cada usuario/a tiene un índice de confianza de 0 a 10, uno por ítem cumplido:

| # | Ítem | Freemium | Premium |
|---|------|----------|---------|
| 1 | Identidad (DNI frente/dorso + selfie con DNI) | ✔ | ✔ |
| 2 | Datos de contacto (email + celular) | ✔ | ✔ |
| 3 | Revisión de identidad (redes sociales) | ✔ | ✔ |
| 4 | Situación crediticia (deudas/créditos + BCRA) | ✔ | ✔ |
| 5 | Constancia según rol (domicilio/inmueble para quien ofrece; estudios/actividad para quien busca) | ✔ | ✔ |
| 6 | Declaración jurada | ✔ | ✔ |
| 7 | Referencias personales (2, de convivencia) | ✗ | ✔ |
| 8 | Entrevista virtual (10 min) | ✗ | ✔ |
| 9 | Antecedentes penales (RNR, $1.000-$8.500 a cargo del usuario) | ✗ | ✔ |
| 10 | Historial de convivencia registrado en la plataforma | ✗ | ✔ |

Niveles (umbral del docx): **0/10** = sin verificar · **1/10 a 6/10** = Perfil básico · **7/10 a 10/10** = Perfil de alta confianza. Los ítems 7-10 requieren el "Perfil Verificado" pago ($7.000 ARS, único pago) del PDF — por eso están gateados por `MembershipTier`, no por decisión del usuario.

**Nota:** todavía no existe un módulo de Membresía/pagos real. `MembershipTier` hoy es un campo manual en `ApplicationUser` (default `Freemium`) — falta el flujo de cobro que lo pase a `Premium`.

## Backend (implementado)
- **Enums** (`Models/Enum/`, mismo patrón que `UserRole` — `JsonConverter` a snake_case/lowercase):
  - `MembershipTier { Freemium, Premium }`
  - `VerificationLevel { SinVerificar, Basico, AltaConfianza }` (solo de salida, no se persiste — se calcula en `TrustService`).
- **`ApplicationUser`**: se agregaron `MembershipTier MembershipTier` (default `Freemium`) e `IsDemoUser` (bool, default `false`).
  - `IsDemoUser` distingue las cuentas de `DemoProfileSeeder` (Development) de un usuario freemium real, para que el front pueda mostrar "cuenta demo" en vez de un puntaje real inventado. **Pendiente:** el seeder hoy solo marca el flag — no carga un `ProfileVerification` de ejemplo, así que las cuentas demo se ven en 0/10 hasta que se decida si conviene sembrar puntaje de prueba.
- **`ProfileVerification`** (`Models/ProfileVerification.cs`): 1:1 con `ApplicationUser`, mismo patrón que `StudentProfile`/`HostProfile` (FK única en `UserId`, `OnDelete Cascade`). 10 columnas bool (una por ítem) + `UpdatedAtUtc`.
- **Migración:** `AddTrustVerification` (`20260806015015_AddTrustVerification`), aplicada a `db_ccs`.
- **Capas:** `TrustController` (`/api/trust`, `[Authorize]`) → `TrustService` → `TrustRepository`, respetando la separación de siempre. Igual que `ProfileController`, opera siempre sobre el usuario del token.
  - `GET /api/trust/status` — devuelve `TrustStatusResponseDto`: `score`, `maxScore` (10), `level`, `membershipTier`, `isDemoUser`, y el detalle `items[]` (cada uno con `key`, `label`, `completed`, `requiresPremium`, `locked`).
  - `PUT /api/trust/items` — auto-declarativo, pero **solo para los ítems 1-6** (Básica). **(2026-08-27)** Los ítems 7-10 (Alta Confianza) se sacaron de este endpoint — antes un usuario Premium los podía marcar en `true` directamente sin ningún control; ahora `UpdateTrustItemsRequestDto` ni siquiera tiene esos 4 campos, y las únicas dos formas de que pasen a `true` son que el staff los apruebe desde el panel Admin (ver más abajo) o que el usuario los vuelva a solicitar tras un rechazo. El viejo comportamiento (gateo silencioso por `MembershipTier` dentro de `UpdateItemsAsync`) queda documentado acá porque fue la razón original para no dejar que cualquier Premium se autodeclare Alta Confianza sin evidencia real.
  - `TrustService.BuildResponse` calcula `score` (cuenta de ítems en `true`) y `level` según los umbrales del docx.
- **DI:** registrado en `Program.cs` junto a los demás `AddScoped` (`ITrustRepository`/`TrustRepository`, `ITrustService`/`TrustService`).

### ✅ Resuelto (2026-08-27) — ver "Panel Admin" más abajo
Esto estaba anotado como pendiente de decidir: en la vida real, los ítems 7-10 los tiene que confirmar el staff después de revisar documentación, no alcanza con que el usuario diga "ya lo hice". Se resolvió con un estado `Pendiente/Aprobado/Rechazado` a nivel de solicitud completa (no ítem por ítem — los 4 se aprueban/rechazan juntos), revisado desde el panel Admin. **Los ítems 1-6 (Básica) siguen siendo autodeclarativos** — no se tocaron, se consideró que tienen menor riesgo (identidad y contacto ya se verifican con documentos claros al momento de cargar; situación crediticia/constancia son de más bajo impacto que antecedentes penales o referencias de convivencia).

### Decisión (2026-08-06): validación de identidad manual, no biometría automática
Se evaluó usar un servicio de reconocimiento facial/biometría tipo KYC bancario (Onfido, Veriff, Truora, validación biométrica de RENAPER) para el ítem 1 (DNI + selfie). Se decidió dejarlo **manual** (revisión del staff) por ahora, por tres motivos:

1. El propio docx del cliente describe el ítem como "DNI frente y dorso + selfie con DNI en mano" — es una comparación visual, no biometría automática. La revisión manual cumple la especificación tal cual está.
2. Sumar un proveedor de KYC agrega una dependencia externa paga (cobran por verificación) y no tiene sentido antes de que exista el panel Admin que tendría que consumir esos resultados.
3. Los datos biométricos son **datos sensibles** bajo la Ley de Protección de Datos Personales (25.326) en Argentina — requisitos más estrictos que un dato personal común (consentimiento explícito específico, medidas de seguridad reforzadas, potencial registro ante la AAIP). Ya se cifra el DNI en texto (`IDataProtector`, ver [[Perfiles]]); sumar reconocimiento facial real es un salto de responsabilidad legal que conviene validar con un abogado antes de construir, no es una decisión puramente técnica.

Queda anotado como candidato de Fase 3 (ver Roadmap) para reevaluar cuando haya volumen de usuarios que lo justifique.

## Panel Admin — cola de revisión de Alta Confianza (implementado, 2026-08-27)

Primer endpoint real de `/api/admin/*` del proyecto — dependía de que el JWT llevara el claim "Admin" (bloqueante resuelto el mismo día, ver [[Auth]] → sección Admin).

### Backend
- **Enum nuevo** `Models/Enum/VerificationReviewStatus.cs`: `NoSolicitado`/`Pendiente`/`Aprobado`/`Rechazado`, mismo patrón de `JsonConverter` a snake_case que `MembershipTier`/`VerificationLevel`.
- **`ProfileVerification`** — 5 columnas nuevas: `AltaConfianzaStatus` (default `NoSolicitado`), `AltaConfianzaRequestedAtUtc`, `AltaConfianzaReviewedAtUtc`, `AltaConfianzaReviewedByUserId`, `AltaConfianzaRejectionReason`. Migración `AddAltaConfianzaReviewToProfileVerification`, aplicada a `db_ccs`. Índice agregado sobre `AltaConfianzaStatus` (`ApplicationDbContext`) — la cola del admin filtra por este campo.
- **`TrustController`** — nuevo endpoint `POST /api/trust/solicitar-alta-confianza` (`RequestAltaConfianzaAsync`): el usuario Premium dispara la solicitud (pasa de `NoSolicitado` a `Pendiente`, guarda `RequestedAtUtc`). No hace nada por sí solo — es lo que hace aparecer al usuario en la cola del admin.
- **`ITrustRepository`/`TrustRepository`** — método nuevo `GetPendingAltaConfianzaAsync()`: trae todas las `ProfileVerification` con `AltaConfianzaStatus == Pendiente`, incluyendo el `User` relacionado (para nombre/rol/tier sin N+1 queries en la cola).
- **Capas nuevas, mismo patrón Controller → Service → Repository de siempre:**
  - `DTOs/Admin/AdminVerificationDtos.cs`: `AdminVerificationQueueItemDto` (fila de la cola), `AdminVerificationItemDto` (un ítem con `key`/`label`/`completed`), `AdminVerificationDetailDto` (detalle completo), `AdminVerificationRejectRequestDto` (`{ reason: string }`).
  - `IAdminVerificationService`/`AdminVerificationService` (nuevo, **reusa `ITrustRepository`** — no tiene repository propio, mismo criterio que `AuthService`/`AccountService` reusan `UserManager` en vez de tener su capa de datos):
    - `GetQueueAsync()` → lista para la cola.
    - `GetDetailAsync(userId)` → detalle completo (básico + Alta Confianza + evidencia, ver abajo).
    - `ApproveAsync(userId, adminUserId)` → pone en `true` los 4 booleanos de Alta Confianza (`PersonalReferencesVerified`, `VirtualInterviewCompleted`, `CriminalRecordVerified`, `CohabitationHistoryVerified`) de una sola vez, `AltaConfianzaStatus = Aprobado`, guarda quién y cuándo. **Es la única forma de que esos 4 booleanos pasen a `true`** desde que se sacaron de `PUT /api/trust/items` (ver arriba).
    - `RejectAsync(userId, adminUserId, reason)` → `AltaConfianzaStatus = Rechazado`, guarda el motivo. **No toca los booleanos** — no hay nada que "descontar", porque nunca se pusieron en `true` hasta la aprobación. El usuario ve el motivo y puede volver a solicitar.
  - `AdminVerificationsController` (`/api/admin/verificaciones`, `[Authorize(Roles = "Admin")]`): `GET /` (cola), `GET /{userId}` (detalle), `POST /{userId}/aprobar`, `POST /{userId}/rechazar` (body `AdminVerificationRejectRequestDto`).
- **DI:** `IAdminVerificationService`/`AdminVerificationService` registrado en `Program.cs` junto a los demás `AddScoped`.

### Frontend
- `types/admin.ts` (nuevo): `AdminVerificationStatus`, `AdminVerificationQueueItem`, `AdminVerificationItem`, `AdminVerificationDetail` — alineados con los DTOs de arriba.
- `services/adminService.ts` (nuevo): `getVerificationQueue`, `getVerificationDetail`, `approveVerification`, `rejectVerification` — vía `apiFetch`.
- `pages/admin/VerificationsQueuePage.tsx` (nueva, ruta `/dashboard/verificaciones`): tabla de la cola, con el mismo shell de sidebar que `DashboardPage.tsx`.
- `pages/admin/VerificationDetailPage.tsx` (nueva, ruta `/dashboard/verificaciones/:userId`): score consolidado (básico confirmado + Alta Confianza pendiente/aprobado), lista de los 6 ítems básicos (sin acción, solo lectura), lista de los 4 ítems de Alta Confianza con su estado, tarjeta de evidencia (ver sección siguiente), botones **Aprobar**/**Rechazar** (rechazar abre un modal que pide motivo, obligatorio).
- `App.tsx`: las dos rutas nuevas agregadas bajo `<ProtectedRoute requireAdmin>`.
- `DashboardPage.tsx`: el botón "Verificaciones" del sidebar (antes un `<button disabled>` decorativo) pasó a ser un `<Link to="/dashboard/verificaciones">`; la tarjeta "Verificaciones pendientes" ahora carga `getVerificationQueue(token)` en un `useEffect` y muestra el conteo real (antes decía "Pendiente de conectar", ver [[../00-Roadmap|00-Roadmap]]) — la tarjeta entera es un link a la misma ruta.
- **Bug encontrado y corregido de paso:** `FloatingNav.tsx` reaparecía en las páginas admin nuevas — su lista `HIDDEN_ROUTES` comparaba con `===` exacto contra `/dashboard`, así que no matcheaba `/dashboard/verificaciones` ni `/dashboard/verificaciones/:userId`. Se agregó un chequeo `location.pathname.startsWith('/dashboard')` en vez de (o además de) la comparación exacta.

### Datos de prueba para esto
`DemoProfileSeeder.cs` ganó dos flags nuevos en `StudentSeed`/`HostSeed`: `RequestAltaConfianza` (bool, default `false`) y `AltaConfianzaRequestedDaysAgo` (int, default `1`) — si `RequestAltaConfianza` es `true`, después de `ApplyTrustScore` el seeder deja la cuenta en `AltaConfianzaStatus = Pendiente` con `RequestedAtUtc` retrocedido esos días, para que aparezca directo en la cola del admin sin tener que simular el `POST /api/trust/solicitar-alta-confianza` a mano. **Sofía Gómez** (`sofia.estudiante@demo.com`) se reconfiguró como el caso de prueba: pasó de `Freemium, TrustScore = 9` a `Premium, TrustScore = 6, RequestAltaConfianza = true` — queda en `6/10` básico confirmado + Alta Confianza pendiente de revisión, el escenario que necesita el admin para probar aprobar/rechazar. Ver tabla actualizada en [[../datos-demo|datos-demo]].

**Gotcha — resetear a Sofía para una demo en vivo no alcanza con borrarla de la base.** `DemoProfileSeeder` es idempotente por email — si la cuenta ya existe, la saltea sin tocarla, así que borrarla y no reiniciar el backend la deja simplemente ausente (no la recrea). Para un reset rápido sin reiniciar `dotnet run` (útil si ya se aprobó/rechazó por error justo antes de mostrarle algo a la clienta), alcanza con un `UPDATE` directo sobre su fila en `ProfileVerifications` — el backend lee de la base en cada request, no cachea nada de esto:

```sql
UPDATE "ProfileVerifications"
SET "AltaConfianzaStatus" = 1, -- Pendiente
    "PersonalReferencesVerified" = false,
    "VirtualInterviewCompleted" = false,
    "CriminalRecordVerified" = false,
    "CohabitationHistoryVerified" = false,
    "AltaConfianzaReviewedAtUtc" = NULL,
    "AltaConfianzaReviewedByUserId" = NULL,
    "AltaConfianzaRejectionReason" = NULL,
    "AltaConfianzaRequestedAtUtc" = NOW() - INTERVAL '1 day'
WHERE "UserId" = (SELECT "Id" FROM "AspNetUsers" WHERE "Email" = 'sofia.estudiante@demo.com');
```

Reiniciar el backend sigue siendo necesario solo si lo que cambió fue el *código* del seeder (por ejemplo, un `TrustScore` o flag nuevo en `DemoProfileSeeder.cs`) — para volver un dato ya sembrado a su estado inicial, el `UPDATE` de arriba alcanza.

## Evidencia de Alta Confianza — antecedentes penales y referencias personales (implementado, 2026-08-27)

### Alcance: 2 de 4 ítems, a propósito
Los 4 ítems de Alta Confianza (7-10) necesitan evidencia real para que el admin los pueda revisar, no solo un booleano. Antes de construir, se investigó qué existía ya en el código para reusar (pedido explícito de la clienta: "empecemos con los autónomos y después creamos los demás") y se encontró que **2 de los 4 dependen de subsistemas que directamente no existen todavía:**

| # | Ítem | ¿Autocontenido? | Estado |
|---|---|---|---|
| 7 | Referencias personales | ✅ sí (form simple) | **Construido** |
| 9 | Antecedentes penales | ✅ sí (upload de archivo) | **Construido** |
| 8 | Entrevista virtual (Meet) | ❌ no — necesita agenda/reserva de turnos | Pendiente, depende de [[Asesorias]] |
| 10 | Historial de convivencia | ❌ no — necesita valoración de la otra parte del match | Pendiente, no existe ningún sistema de rating en el proyecto |

`AdvisoryPage.tsx` (que la clienta propuso reusar para la entrevista virtual: "utilizariamos el mismo funcionamiento de dar asesorías") se confirmó por lectura directa del código que es **una pantalla estática vacía, sin backend** (ver [[Asesorias]]) — no hay agenda ni integración con Meet que reusar todavía, hay que construirla desde cero primero. Tampoco existe ningún concepto de valoración/reseña entre cuentas que hicieron match, necesario para el ítem 10. Por eso quedan pospuestos para una conversación de alcance aparte, en vez de intentar meterlos apurados sobre algo que no existe.

### Decisión de storage: todo local (2026-08-27)
Para el documento de antecedentes penales se evaluó Azure Blob Storage vs. reusar el mecanismo local ya existente. El cliente todavía no tiene una cuenta de Azure Storage contratada ("todavía no tengo contratado azure, todo local"), así que se reusó `IFileStorageService`/`FileStorageService` — el mismo mecanismo que ya usan las fotos de perfil (`wwwroot/uploads/{subfolder}/{guid}.{ext}`, tope 10MB, servido vía `app.UseStaticFiles()`). No se introdujo ningún mecanismo de storage nuevo.

⚠️ **Nota de hardening pendiente, no bloqueante:** esto expone el documento vía una URL pública (aunque con nombre de archivo GUID, no adivinable) — mismo criterio de riesgo aceptado que ya existe para el resto de `wwwroot/uploads` (ver el TODO de Data Protection keys para Azure en [[../convenciones/backend|convenciones/backend]]). Un certificado de antecedentes penales es más sensible que una foto de perfil; cuando se migre a Azure Blob Storage, considerar SAS tokens con expiración en vez de una URL pública fija.

### Backend
- **`ProfileVerification`** — 8 columnas nuevas: `Reference1Name`/`Reference1Phone`/`Reference1Relationship`, `Reference2Name`/`Reference2Phone`/`Reference2Relationship` (campos planos, no una tabla separada — la cantidad de referencias es fija en 2, no justifica una entidad EF Core nueva), `CriminalRecordDocumentPath`, `CriminalRecordDocumentUploadedAtUtc`.
- **`DTOs/Trust/TrustDtos.cs`**: `SavePersonalReferencesRequestDto` (los 6 campos de arriba), `AltaConfianzaEvidenceDto` (para que el usuario vea lo que ya cargó).
- **`ITrustService`/`TrustService`** — 3 métodos nuevos, con `IFileStorageService` sumado como dependencia del constructor:
  - `GetEvidenceAsync(userId)` → `AltaConfianzaEvidenceDto` con lo ya cargado.
  - `SavePersonalReferencesAsync(userId, dto)` → guarda las 2 referencias (no marca `PersonalReferencesVerified`, eso lo sigue haciendo solo el admin al aprobar).
  - `UploadCriminalRecordDocumentAsync(userId, file)` → valida extensión (`AllowedDocumentExtensions`, ej. pdf/jpg/png) y reusa `IFileStorageService.SaveAsync(file, "antecedentes")`.
- **`TrustController`** — 3 endpoints nuevos: `GET /api/trust/alta-confianza/evidencia`, `PUT /api/trust/alta-confianza/referencias`, `POST /api/trust/alta-confianza/antecedentes-documento` (multipart).
- **`DTOs/Admin/AdminVerificationDtos.cs`**: `AdminVerificationReferenceDto` (`Name`/`Phone`/`Relationship`) + 4 campos nuevos en `AdminVerificationDetailDto` (`Reference1`, `Reference2`, `CriminalRecordDocumentUrl`, `CriminalRecordDocumentUploadedAtUtc`).
- **`AdminVerificationService.BuildDetail`**: arma `Reference1`/`Reference2` como `null` si la referencia no tiene nombre cargado (evita mostrar objetos vacíos), y `CriminalRecordDocumentUrl` como `/uploads/{CriminalRecordDocumentPath}` (mismo formato relativo que el resto de las URLs de archivo del proyecto).

### Frontend (solo lado admin, por ahora)
- `types/admin.ts`: `AdminVerificationReference` (`{ name, phone, relationship }`) + los 4 campos nuevos en `AdminVerificationDetail`. El campo `relationship` existe porque el requisito del cliente para las referencias es "nombre + número de celular + vínculo de la persona" — le da contexto al admin sobre cómo esa persona conoce al solicitante (ex-conviviente, familiar, amigo), no afecta ningún cálculo de puntaje.
- `VerificationDetailPage.tsx`: nueva tarjeta "Evidencia cargada por el usuario" — grid de las 2 referencias (o un placeholder punteado "sin cargar" si falta alguna) + link al documento de antecedentes (`resolveUploadedFileUrl`, mismo helper que ya arma la URL del avatar en `utils/avatar.ts`) con fecha de subida. Si no hay nada cargado todavía muestra "Todavía no cargó ninguna evidencia" — esperable mientras no exista el formulario del usuario.

### Pendiente — el paso inmediato siguiente
**El formulario del lado del usuario no está construido todavía.** Los 3 endpoints del backend ya existen y funcionan, pero nada en el frontend los llama todavía — falta `services/trustService.ts` (`getAltaConfianzaEvidence`, `savePersonalReferences`, `uploadCriminalRecordDocument`) y la pantalla/sección donde el usuario carga sus 2 referencias y sube el documento (candidato natural: `ProfilePage.tsx`, sin confirmar todavía). Hasta que esto exista, la única forma de generar datos de prueba en la cola es sembrarlos directo en la base (ver Gotcha de reseteo de Sofía más arriba) o cargarlos a mano vía Postman.

## Frontend (implementado, parcial)
- `types/trust.ts`: `MembershipTier`, `VerificationLevel`, `TrustItem`, `TrustStatus` — alineados con los DTOs de arriba.
- `services/trustService.ts`: `getTrustStatus(token)` → `GET /api/trust/status`.
### Dos insignias separadas (pedido del cliente, 2026-08-06) — diseño final
Lucía pidió que hubiera **dos** insignias distintas — una para Básico y otra para Premium — en vez de una sola. El diseño pasó por varias vueltas (anillo cappeado a 6, layout en columna con texto debajo, ícono premium metido en un círculo relleno) hasta llegar a esto, que es lo que quedó aprobado:

- `components/common/TrustBadge.tsx`: **el anillo, único componente para los dos niveles.** Sigue siendo de **0 a 10** (el cap a 6 que se probó en el medio se descartó — Lucía prefirió mantener la escala completa siempre visible). Color del anillo por nivel, con los colores de marca reales del proyecto (`index.css`: `--color-brand-orange: #FF7A00`, `--color-brand-teal: #00B4C4` — no los genéricos `warning`/`success` de DaisyUI):
  - `sin_verificar` (0/10): gris (`text-base-content/30`).
  - `basico` (1-6/10): naranja (`text-brand-orange`), con un check chico superpuesto arriba a la derecha del anillo — círculo relleno naranja + ícono `Check` de lucide en blanco.
  - `alta_confianza` (7-10/10): turquesa (`text-brand-teal`), con el ícono `BadgeCheck` de lucide (set "Social" del catálogo, el que Lucía señaló como referencia) superpuesto en el mismo lugar — **sin círculo de fondo**, a diferencia del check de Básico: `BadgeCheck` ya trae su propio contorno de sello dibujado adentro del ícono, ponerlo dentro de otro círculo relleno lo aplastaba visualmente. Va con `fill-base-100` (relleno blanco/color de fondo del theme) para que se recorte bien contra el turquesa del anillo de atrás.
  - El texto ("Puntos de confianza" + el nombre del nivel) queda al costado del anillo, no debajo — se probó en columna y no gustó.
- `components/common/PremiumBadge.tsx`: quedó reducido a **una sola línea de texto**, sin ícono (el ícono ya está en el anillo, uno repetido quedaba redundante) — `"Perfil Verificado Premium"` en turquesa (`text-brand-teal`). `achieved` en `false` → `return null`, no se renderiza nada (ni siquiera apagado/gris).
- `pages/ProfilePage.tsx`, pestaña "Datos de cuenta" (`AccountTab`): renderiza los dos apilados (`flex-col items-end gap-2`) a la derecha del avatar — `<TrustBadge>` arriba, `<PremiumBadge>` debajo (sin ocupar espacio si `achieved` es `false`).
- **Todavía no implementado:** UI para que el usuario marque los ítems (el `PUT /api/trust/items` existe en el backend pero ningún form lo llama todavía), insignia pública en `DiscoverPage.tsx`/`ExploreSpacesPage.tsx`/`SpaceDetailsModal.tsx` para que la otra parte vea el nivel de confianza del perfil que está mirando.

## Interacciones

**Backend:** `TrustController` (`/api/trust`, `[Authorize]`) → `TrustService` → `TrustRepository`. `TrustService` también usa `UserManager<ApplicationUser>` (lee `MembershipTier`/`IsDemoUser`).

| Endpoint | Service / método |
|---|---|
| `GET /api/trust/status` | `GetStatusAsync` → `BuildResponse` (calcula `score`/`level`) |
| `PUT /api/trust/items` | `UpdateItemsAsync` (ítems 1-6, autodeclarativo) |
| `POST /api/trust/solicitar-alta-confianza` | `RequestAltaConfianzaAsync` |
| `GET /api/trust/alta-confianza/evidencia` | `GetEvidenceAsync` |
| `PUT /api/trust/alta-confianza/referencias` | `SavePersonalReferencesAsync` |
| `POST /api/trust/alta-confianza/antecedentes-documento` | `UploadCriminalRecordDocumentAsync` |

**Admin:** `AdminVerificationsController` (`/api/admin/verificaciones`, `[Authorize(Roles = "Admin")]`) → `AdminVerificationService` (reusa `ITrustRepository`, sin repository propio).

| Endpoint | Service / método |
|---|---|
| `GET /api/admin/verificaciones` | `GetQueueAsync` |
| `GET /api/admin/verificaciones/{userId}` | `GetDetailAsync` |
| `POST /api/admin/verificaciones/{userId}/aprobar` | `ApproveAsync` |
| `POST /api/admin/verificaciones/{userId}/rechazar` | `RejectAsync` |

**Frontend:** `services/trustService.ts` (`getTrustStatus`) y `services/adminService.ts` (`getVerificationQueue`, `getVerificationDetail`, `approveVerification`, `rejectVerification`) — vía `apiFetch`, ver [[../convenciones/http-client|convenciones/http-client]]. Los endpoints de evidencia (`/alta-confianza/*`) todavía no tienen consumidor en el frontend, ver "Pendiente" arriba.

| Componente/página | Función usada | Contexto |
|---|---|---|
| `pages/ProfilePage.tsx` (`AccountTab`) | `getTrustStatus` | Renderiza `TrustBadge` + `PremiumBadge` junto al avatar |
| `pages/admin/VerificationsQueuePage.tsx` | `getVerificationQueue` | Cola de solicitudes pendientes |
| `pages/admin/VerificationDetailPage.tsx` | `getVerificationDetail`, `approveVerification`, `rejectVerification` | Detalle + acciones de aprobar/rechazar |

```
ProfilePage.tsx (AccountTab, useEffect al montar)
  → getTrustStatus(token)                        [trustService.ts]
    → apiFetch('/api/trust/status', ...)           [httpClient.ts]
      → TrustController.GetStatus → TrustService.GetStatusAsync → TrustRepository
    ← TrustStatusResponseDto { score, level, membershipTier, items[] }
  → <TrustBadge score={...} level={...} /> + <PremiumBadge achieved={...} />

VerificationDetailPage.tsx (al montar / al aprobar-rechazar)
  → getVerificationDetail(token, userId)          [adminService.ts]
    → apiFetch('/api/admin/verificaciones/{userId}')  [httpClient.ts]
      → AdminVerificationsController.GetDetail → AdminVerificationService.GetDetailAsync
    ← AdminVerificationDetailDto { ...items, reference1, reference2, criminalRecordDocumentUrl }
  → approveVerification / rejectVerification(token, userId, reason)
    → AdminVerificationsController.Approve/Reject → AdminVerificationService → TrustRepository.SaveChangesAsync
```

## Datos de prueba
`DemoProfileSeeder` siembra `ProfileVerification` para las 6 cuentas demo (además de `MembershipTier`/`IsDemoUser` en el `ApplicationUser`), vía el helper `ApplyTrustScore` — completa los ítems 1..N en el orden fijo del docx, **cappeado a 6 si el tier es Freemium** (los ítems 7-10 son exclusivos de Premium, ver más arriba).

Estado actual (2026-08-27) de `Students`/`Hosts` en `DemoProfileSeeder.cs`:

| Cuenta | Rol | `MembershipTier` | `TrustScore` seteado | Puntaje real (post-cap) | Nivel resultante |
|---|---|---|---|---|---|
| mia.estudiante@demo.com | Estudiante | Freemium | 4 | 4/10 | Básico |
| juan.estudiante@demo.com | Estudiante | Freemium | 6 | 6/10 | Básico (tope freemium) |
| sofia.estudiante@demo.com | Estudiante | **Premium** | 6 | 6/10 | Básico + **Alta Confianza pendiente de revisión** |
| rosa.anfitriona@demo.com | Anfitrión | **Premium** | 10 | **10/10** | **Alta confianza** ✅ probado (aprobada) |
| carlos.anfitrion@demo.com | Anfitrión | Freemium | 2 | 2/10 | Básico (recién arrancando) |
| elena.anfitriona@demo.com | Anfitrión | Freemium | 8 | **6/10** (cappeado) | Básico |

**Actualizado (2026-08-06):** Rosa Martínez se subió a `MembershipTier.Premium` (mantiene su `TrustScore = 10` original del seed) específicamente para poder probar y afinar el diseño del estado "Alta confianza"/`PremiumBadge` con el cliente — quedó confirmado funcionando end-to-end (anillo turquesa 10/10 + `PremiumBadge`).

**Actualizado (2026-08-27):** Sofía Gómez pasó de `Freemium, TrustScore = 9` a `Premium, TrustScore = 6` con `RequestAltaConfianza = true` en el seeder — dejó de ser el caso "cappeada en 6 sin sentido" y pasó a ser el caso de prueba de la cola de revisión del panel Admin (ver sección "Panel Admin" más arriba). Rosa queda como el caso de Alta Confianza ya aprobada/histórica; Sofía es el caso "pendiente, esperando al staff", que es el que hace falta para demostrar aprobar/rechazar. Carlos se dejó a propósito en Freemium/bajo como ejemplo de "recién empezando".

### Gotcha: resetear las 6 cuentas demo no es un solo `DELETE`
`DemoProfileSeeder` es idempotente por email — si la cuenta ya existe, la saltea sin tocarla. Para forzar que se recree (por ejemplo, después de agregarle `ProfileVerification` al seeder, o al cambiar un `TrustScore`/`MembershipTier`), hay que borrarla de la base primero. Un `DELETE FROM "AspNetUsers" WHERE "Email" LIKE '%@demo.com';` solo no alcanza: **`ProfileLikes` y `Matches` tienen la FK a `HostUserId` en `Restrict`, no `Cascade`** (decisión de diseño, ver [[../convenciones/backend|convenciones/backend]] → Gotchas → "Multiple cascade paths"), así que si algún anfitrión demo ya tiene un like/match registrado, Postgres rechaza el `DELETE` de `AspNetUsers` con un error de FK. Hay que limpiar esas dos tablas primero:

```sql
DELETE FROM "Matches"
WHERE "HostUserId" IN (SELECT "Id" FROM "AspNetUsers" WHERE "Email" LIKE '%@demo.com')
   OR "StudentUserId" IN (SELECT "Id" FROM "AspNetUsers" WHERE "Email" LIKE '%@demo.com');

DELETE FROM "ProfileLikes"
WHERE "HostUserId" IN (SELECT "Id" FROM "AspNetUsers" WHERE "Email" LIKE '%@demo.com')
   OR "StudentUserId" IN (SELECT "Id" FROM "AspNetUsers" WHERE "Email" LIKE '%@demo.com');

DELETE FROM "AspNetUsers" WHERE "Email" LIKE '%@demo.com';
```

`StudentProfile`/`HostProfile`/`ProfileVerification`/`Space` sí tienen `Cascade` sobre `UserId`, así que esos se limpian solos con el `DELETE` de `AspNetUsers`. Después hace falta reiniciar `dotnet run` (el seeder corre al arrancar en Development, ver `Program.cs`) para que `DemoProfileSeeder`/`DemoSpaceSeeder` recreen todo desde cero. **Para un reset puntual de un solo campo (ej. Sofía después de una demo)** alcanza con un `UPDATE` directo, sin reiniciar nada — ver el gotcha específico en la sección "Panel Admin" más arriba.

## Gotchas encontrados armando esto
- **`verbatimModuleSyntax: true`** (`tsconfig.app.json`): cualquier import que sea solo un tipo (`interface`/`type`, ej. `TrustStatus`) tiene que ir como `import type { ... }`, si no tira `TS1484`. Ver [[../convenciones/frontend|convenciones/frontend]].
- **El alias `@` → `src/` que documentaban las convenciones no está configurado de verdad** (ni en `vite.config.ts` ni en `tsconfig.app.json`) — el resto de `services/*.ts` ya usaba imports relativos (`../config`), no el alias. Corregido en [[../convenciones/frontend|convenciones/frontend]] para que no se repita el error.
- **Bug propio, no de Vite:** durante las pruebas con Rosa, el anillo mostraba `6/10` con el color/nivel ya en turquesa ("Alta confianza") — parecía un problema de caché de Vite (color y label sí se habían actualizado), pero en realidad `ProfilePage.tsx` le seguía pasando `score={Math.min(trustStatus.score, 6)}` a `TrustBadge` — un cap que había quedado de una iteración de diseño anterior y no se sacó al revertir. Como `level`/`levelLabel` sí venían de `trustStatus` sin tocar, esos se veían bien y el número quedaba desincronizado, lo que hacía parecer un problema de render en vez de un prop viejo. Moraleja: si un dato se ve "parcialmente actualizado" (unas props sí, otras no) en vez de directamente viejo, sospechar primero del código antes que de la caché del navegador.
- **(2026-08-27) Reemplazos parciales de archivo borraron código existente, dos veces seguidas.** Al armar `TrustRepository.cs` y después `TrustService.cs`, instrucciones de "agregá este método nuevo" terminaron, en la práctica, borrando métodos preexistentes (`GetByUserIdAsync`/`GetOrCreateAsync` en el repository; el cuerpo de `RequestAltaConfianzaAsync` quedó duplicado como código huérfano en el service) — ambos casos se detectaron por errores de compilación (`CS0535` de interfaz no implementada, y errores de sintaxis) y se corrigieron pasando el archivo completo en vez de un fragmento. Desde entonces, para archivos que ya tienen contenido, conviene pedir/pegar el bloque entero del archivo (no solo el fragmento nuevo) para no repetir el error.
- **Publicar el mockup de diseño (`.dc.html`) en Claude Design pisó una URL vieja sin querer resolverse con `force`** — no es un gotcha de código de CASA con SI, es de la herramienta de diseño usada para prototipar la pantalla antes de construirla; se resolvió publicando como artefacto nuevo. No afecta nada del repo real.

## Preguntas abiertas
- ¿Quién marca los ítems 7-10 (y en rigor, varios de los 1-6): autodeclaración o revisión de staff? **Resuelto y construido (2026-08-27):** revisión manual del staff vía el panel Admin (ver "Panel Admin — cola de revisión de Alta Confianza" más arriba). Los ítems 1-6 siguen siendo autodeclarativos por `PUT /api/trust/items`.
- ¿Cómo se dispara el pase de `Freemium` a `Premium`? Hoy es un campo manual, falta el módulo de pagos/membresías.
- Diseño de la insignia pública (Discover/Explorar): ¿mismo `TrustBadge` compacto, o una versión mini solo con el nivel (sin el detalle de los 10 ítems)?
- ¿Cómo se resuelve la entrevista virtual (ítem 8)? Depende de que exista una agenda/reserva de turnos real en [[Asesorias]] — hoy `AdvisoryPage.tsx` es un placeholder sin backend. Sin alcance definido todavía (queda para una conversación de scoping aparte).
- ¿Cómo se resuelve el historial de convivencia (ítem 10)? Depende de que exista un sistema de valoración/reseña entre cuentas que hicieron match — no existe ningún concepto de rating en el proyecto hoy. Sin alcance definido todavía.
- ¿Vale la pena mover el documento de antecedentes penales a un storage con URLs que expiren (SAS tokens) en vez de la URL pública fija de `wwwroot/uploads` cuando se migre a Azure Blob Storage? Ver nota de hardening en la sección de evidencia más arriba.

## Enlaces relacionados
- [[../00-Roadmap|00-Roadmap]]
- [[Perfiles]]
- [[Cuenta]]
- [[Auth]] — rol Admin, claim JWT, primer consumidor real del gate `[Authorize(Roles = "Admin")]`.
- [[Asesorias]] — dependencia futura del ítem "entrevista virtual".
- [[../datos-demo|datos-demo]]
- [[../convenciones/backend|convenciones/backend]]
- [[../convenciones/frontend|convenciones/frontend]]
- [[../glosario|glosario]]
