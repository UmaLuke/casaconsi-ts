tags: [modulo, backend, frontend, confianza, verificacion, freemium]

# Módulo: Sistema de confianza / Verificación de perfiles

**Estado:** 🚧 MVP backend implementado end-to-end. Frontend: insignia en `ProfilePage.tsx` (pestaña "Datos de cuenta") con **los dos estados probados visualmente y funcionando** — Básico (naranja) confirmado con Juan/Mía/Carlos, y Alta confianza/Premium (turquesa) confirmado con Rosa Martínez (`10/10`) después de subirla a `MembershipTier.Premium` y resembrar. Decisiones tomadas: validación de identidad **manual** (no biometría automática, ver más abajo) y diseño final de las **dos insignias** (`TrustBadge` + `PremiumBadge`, ver sección Frontend — pasó por varias iteraciones de diseño con el cliente antes de cerrar). Falta: UI para que el usuario autodeclare los ítems, insignia pública en Discover/Explorar, flujo de pago Premium real, y el panel Admin para que el staff revise/apruebe (en vez de autodeclaración).

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
  - `PUT /api/trust/items` — auto-declarativo: el usuario marca los ítems que completó. `TrustService.UpdateItemsAsync` gatea los ítems 7-10: si `MembershipTier != Premium`, un intento de marcarlos en `true` se ignora silenciosamente (no tira error, para no romper un PUT parcial por un solo campo no habilitado).
  - `TrustService.BuildResponse` calcula `score` (cuenta de ítems en `true`) y `level` según los umbrales del docx.
- **DI:** registrado en `Program.cs` junto a los demás `AddScoped` (`ITrustRepository`/`TrustRepository`, `ITrustService`/`TrustService`).

### ⚠️ Pendiente de decidir (no asumido, marcado como TODO en el código)
El `PUT /api/trust/items` de hoy es 100% autodeclarativo (el usuario tilda lo que subió). En la vida real, varios ítems (crediticia, antecedentes, referencias, entrevista, y probablemente identidad/constancia) los tendría que confirmar el staff de CASA CON SI después de revisar la documentación — no alcanza con que el usuario diga "ya lo hice". No se implementó ese flujo de revisión porque el Módulo Admin todavía no existe (ver [[../00-Roadmap|00-Roadmap]], sección "Módulo Admin — pendiente, no iniciado"). Cuando se arme el panel Admin, este es un buen candidato para pasar de self-toggle a un estado `Pendiente/Aprobado/Rechazado` por ítem, revisado por Lic. Pozzo o su equipo.

### Decisión (2026-08-06): validación de identidad manual, no biometría automática
Se evaluó usar un servicio de reconocimiento facial/biometría tipo KYC bancario (Onfido, Veriff, Truora, validación biométrica de RENAPER) para el ítem 1 (DNI + selfie). Se decidió dejarlo **manual** (revisión del staff) por ahora, por tres motivos:

1. El propio docx del cliente describe el ítem como "DNI frente y dorso + selfie con DNI en mano" — es una comparación visual, no biometría automática. La revisión manual cumple la especificación tal cual está.
2. Sumar un proveedor de KYC agrega una dependencia externa paga (cobran por verificación) y no tiene sentido antes de que exista el panel Admin que tendría que consumir esos resultados.
3. Los datos biométricos son **datos sensibles** bajo la Ley de Protección de Datos Personales (25.326) en Argentina — requisitos más estrictos que un dato personal común (consentimiento explícito específico, medidas de seguridad reforzadas, potencial registro ante la AAIP). Ya se cifra el DNI en texto (`IDataProtector`, ver [[Perfiles]]); sumar reconocimiento facial real es un salto de responsabilidad legal que conviene validar con un abogado antes de construir, no es una decisión puramente técnica.

Queda anotado como candidato de Fase 3 (ver Roadmap) para reevaluar cuando haya volumen de usuarios que lo justifique.

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
| `PUT /api/trust/items` | `UpdateItemsAsync` (gatea ítems 7-10 por `MembershipTier`) |

**Frontend:** `services/trustService.ts` (`getTrustStatus`) — vía `apiFetch`, ver [[../convenciones/http-client|convenciones/http-client]]. `PUT /api/trust/items` todavía no tiene consumidor en el frontend (ver "Todavía no implementado" arriba).

| Componente/página | Función usada | Contexto |
|---|---|---|
| `pages/ProfilePage.tsx` (`AccountTab`) | `getTrustStatus` | Renderiza `TrustBadge` + `PremiumBadge` junto al avatar |

```
ProfilePage.tsx (AccountTab, useEffect al montar)
  → getTrustStatus(token)                        [trustService.ts]
    → apiFetch('/api/trust/status', ...)           [httpClient.ts]
      → TrustController.GetStatus → TrustService.GetStatusAsync → TrustRepository
    ← TrustStatusResponseDto { score, level, membershipTier, items[] }
  → <TrustBadge score={...} level={...} /> + <PremiumBadge achieved={...} />
```

## Datos de prueba
`DemoProfileSeeder` siembra `ProfileVerification` para las 6 cuentas demo (además de `MembershipTier`/`IsDemoUser` en el `ApplicationUser`), vía el helper `ApplyTrustScore` — completa los ítems 1..N en el orden fijo del docx, **cappeado a 6 si el tier es Freemium** (los ítems 7-10 son exclusivos de Premium, ver más arriba).

Estado actual (2026-08-06) de `Students`/`Hosts` en `DemoProfileSeeder.cs`:

| Cuenta | Rol | `MembershipTier` | `TrustScore` seteado | Puntaje real (post-cap) | Nivel resultante |
|---|---|---|---|---|---|
| mia.estudiante@demo.com | Estudiante | Freemium | 4 | 4/10 | Básico |
| juan.estudiante@demo.com | Estudiante | Freemium | 6 | 6/10 | Básico (tope freemium) |
| sofia.estudiante@demo.com | Estudiante | Freemium | 9 | **6/10** (cappeado) | Básico |
| rosa.anfitriona@demo.com | Anfitrión | **Premium** | 10 | **10/10** | **Alta confianza** ✅ probado |
| carlos.anfitrion@demo.com | Anfitrión | Freemium | 2 | 2/10 | Básico (recién arrancando) |
| elena.anfitriona@demo.com | Anfitrión | Freemium | 8 | **6/10** (cappeado) | Básico |

**Actualizado (2026-08-06):** Rosa Martínez se subió a `MembershipTier.Premium` (mantiene su `TrustScore = 10` original del seed) específicamente para poder probar y afinar el diseño del estado "Alta confianza"/`PremiumBadge` con el cliente — quedó confirmado funcionando end-to-end (anillo turquesa 10/10 + `PremiumBadge`). Sofía y Elena quedan igual que antes (Freemium, cappeadas en 6) — si se necesita un segundo caso de prueba en Premium, son las candidatas naturales por tener `TrustScore` > 6 ya cargado en el seed. Carlos se dejó a propósito en Freemium/bajo como ejemplo de "recién empezando".

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

`StudentProfile`/`HostProfile`/`ProfileVerification`/`Space` sí tienen `Cascade` sobre `UserId`, así que esos se limpian solos con el `DELETE` de `AspNetUsers`. Después hace falta reiniciar `dotnet run` (el seeder corre al arrancar en Development, ver `Program.cs`) para que `DemoProfileSeeder`/`DemoSpaceSeeder` recreen todo desde cero.

## Gotchas encontrados armando esto
- **`verbatimModuleSyntax: true`** (`tsconfig.app.json`): cualquier import que sea solo un tipo (`interface`/`type`, ej. `TrustStatus`) tiene que ir como `import type { ... }`, si no tira `TS1484`. Ver [[../convenciones/frontend|convenciones/frontend]].
- **El alias `@` → `src/` que documentaban las convenciones no está configurado de verdad** (ni en `vite.config.ts` ni en `tsconfig.app.json`) — el resto de `services/*.ts` ya usaba imports relativos (`../config`), no el alias. Corregido en [[../convenciones/frontend|convenciones/frontend]] para que no se repita el error.
- **Bug propio, no de Vite:** durante las pruebas con Rosa, el anillo mostraba `6/10` con el color/nivel ya en turquesa ("Alta confianza") — parecía un problema de caché de Vite (color y label sí se habían actualizado), pero en realidad `ProfilePage.tsx` le seguía pasando `score={Math.min(trustStatus.score, 6)}` a `TrustBadge` — un cap que había quedado de una iteración de diseño anterior y no se sacó al revertir. Como `level`/`levelLabel` sí venían de `trustStatus` sin tocar, esos se veían bien y el número quedaba desincronizado, lo que hacía parecer un problema de render en vez de un prop viejo. Moraleja: si un dato se ve "parcialmente actualizado" (unas props sí, otras no) en vez de directamente viejo, sospechar primero del código antes que de la caché del navegador.

## Preguntas abiertas
- ¿Quién marca los ítems 7-10 (y en rigor, varios de los 1-6): autodeclaración o revisión de staff? **Decidido:** revisión manual del staff (ver "Decisión: validación de identidad manual" más arriba) — falta construir el flujo en sí, depende del Módulo Admin (no iniciado). Hasta entonces sigue siendo autodeclarativo por `PUT /api/trust/items`.
- ¿Cómo se dispara el pase de `Freemium` a `Premium`? Hoy es un campo manual, falta el módulo de pagos/membresías.
- Diseño de la insignia pública (Discover/Explorar): ¿mismo `TrustBadge` compacto, o una versión mini solo con el nivel (sin el detalle de los 10 ítems)?

## Enlaces relacionados
- [[../00-Roadmap|00-Roadmap]]
- [[Perfiles]]
- [[Cuenta]]
- [[../convenciones/backend|convenciones/backend]]
- [[../convenciones/frontend|convenciones/frontend]]
- [[../glosario|glosario]]
