tags: [demo, testing, no-produccion]

# Datos de prueba — perfiles y espacios demo

⚠️ **Solo para Development.** Estos usuarios los crea `Data/DemoProfileSeeder.cs` (y los espacios `Data/DemoSpaceSeeder.cs`, que corre después y depende de que los anfitriones demo ya existan) automáticamente al levantar el backend en modo Development (no corre en producción). No son secrets reales, pero **no deberían existir en la DB de producción** — si alguna vez aparecen ahí, algo está mal configurado con `ASPNETCORE_ENVIRONMENT`.

**Password para todos:** `Demo1234!`

## Estudiantes

| Nombre        | Email                     | Zona preferida         | Generación de anfitrión preferida |
| ------------- | ------------------------- | ---------------------- | --------------------------------- |
| Mía Fernández | mia.estudiante@demo.com   | Nueva Córdoba, Alberdi | Adulto mayor                      |
| Juan Pérez    | juan.estudiante@demo.com  | Cerro de las Rosas     | Indiferente                       |
| Sofía Gómez   | sofia.estudiante@demo.com | Güemes, Nueva Córdoba  | Adulto mayor                      |

## Anfitriones

| Nombre        | Email                     | Zona               | Tipo vivienda | Habitaciones disponibles | Generación de estudiante preferida |
| ------------- | ------------------------- | ------------------ | ------------- | ------------------------ | ---------------------------------- |
| Rosa Martínez | rosa.anfitriona@demo.com  | Nueva Córdoba      | Departamento  | 1                        | Indiferente                        |
| Carlos Díaz   | carlos.anfitrion@demo.com | Alberdi            | Casa          | 2                        | Indiferente                        |
| Elena Ruiz    | elena.anfitriona@demo.com | Cerro de las Rosas | Casa          | 1                        | Joven adulto                       |

## Cuestionario completo

Las 9 secciones del estudiante y las 8 del anfitrión están completas para los 6 perfiles (antes `Habits` y `Health` quedaban con los defaults del modelo, sin datos — ver [[modulos/Perfiles]]). Cada persona tiene hábitos, salud, preferencias de convivencia y "sobre mí" distintos, pensado para que se vea variado al navegar `ExploreSpacesPage`/`DiscoverPage` y al abrir el cuestionario ya completado en el frontend.

Los 3 estudiantes también tienen foto de perfil real (una por género: Mía y Sofía femenino, Juan masculino). Los assets fuente viven versionados en `Data/DemoAssets/*.jpg` (no en `wwwroot/uploads/`, que está gitignoreado) y `DemoProfileSeeder.CopyDemoProfilePhoto` los copia a `wwwroot/uploads/profiles/{userId}/` al sembrar — mismo destino y misma convención de ruta relativa que un upload real vía `POST /api/profile/student/photos` (`FileStorageService.SaveAsync` con subfolder `profiles/{userId}`), solo que sin pasar por un `IFormFile`/request HTTP real. Se ven como foto de perfil en el feed de `DiscoverPage.tsx` (antes mostraban el ícono genérico de usuario) y en el cuestionario ya completado.

**Corrección (2026-08-04):** esta nota decía que los anfitriones demo no tenían foto — quedó desactualizada. El `HostSeed` de los 3 anfitriones (Rosa, Carlos, Elena) ya tiene `ProfilePhotoFileName` + `HomePhotoFileNames` (4 fotos de placeholder de casa, compartidas entre los 3 — `casa-living.jpg`, `casa-cocina.jpg`, `casa-bano.jpg`, `casa-habitacion.jpg`) y `SeedHostAsync` los copia con el mismo mecanismo que los estudiantes (`rosa-martinez.jpg`, `carlos-diaz.jpg`, `elena-ruiz.jpg`, ya versionados en `Data/DemoAssets/`). **Importante:** el seeder es idempotente y se salta a cualquier usuario cuyo email ya exista (`if (existing is not null) return;`) — si tu base local ya tenía a Rosa/Carlos/Elena creados de *antes* de que se agregara esto, sus filas reales en Postgres van a seguir sin fotos hasta que se los borre y se reseedeen (o se les suba una foto a mano vía `POST /api/profile/host/photos` / la pestaña "Mi perfil de match" ya logueado como esa cuenta).

De paso quedó corregido un bug real: `StudentExchangesOffered.Offerings` tenía valores que no existían en `frontend/src/data/studentQuestionnaireSchema.ts` (`"acompañamiento"`, `"tareas-hogar"` en vez de `"compania-actividades"`, `"tareas-domesticas"`), y `HostTenantPreferences.PreferredGeneration` de Elena Ruiz tenía `"joven-adulto"`, que tampoco es un valor válido de `GENERATION_PREFERENCE_OPTIONS` (quedó en `"adulto-joven"`, la opción real más cercana). Si alguna vez un `<select>` del cuestionario aparece "vacío" para un perfil demo a pesar de tener dato guardado, es señal de este mismo tipo de desalineación valor-guardado vs. opción-del-schema.

## Espacios (Space)

Uno por cada anfitrión demo, con fotos vía `ExternalImageUrl` (URLs de Unsplash, no archivos subidos de verdad — ver [[modulos/Space]]). Los 3 quedan `Verified = true`.

| Título | Anfitrión | Barrio | Precio | Propósito | Duración |
|---|---|---|---|---|---|
| Habitación Luminosa con Baño Privado | Rosa Martínez | Nueva Córdoba | $90.000 | Estudiar | Anual |
| Anexo Independiente en Casa Familiar | Carlos Díaz | Alberdi | $80.000 | Compartir gastos | Semestral/cuatrimestral |
| Cuarto con Vista al Jardín | Elena Ruiz | Cerro de las Rosas | $105.000 | Estudiar | Semestral/cuatrimestral |

## Nivel de confianza (módulo Confianza)

Desde el 2026-08-06, `DemoProfileSeeder` también siembra `ProfileVerification` para los 6 perfiles, vía el helper `ApplyTrustScore` (completa los ítems 1..N en el orden fijo del docx "Verificación de Perfil", cappeado a 6 si el tier es Freemium — ver [[modulos/Confianza]] para el detalle completo del sistema). Estado actual, **en pruebas**:

| Nombre        | Email                     | `MembershipTier` | `TrustScore` seteado | Puntaje real (post-cap) | Nivel  | Insignia visible   |
| ------------- | ------------------------- | ---------------- | -------------------- | ----------------------- | ------ | ------------------ |
| Mía Fernández | mia.estudiante@demo.com   | Freemium         | 4                    | 4/10                    | Básico | `TrustBadge` (4/6) |
| Juan Pérez    | juan.estudiante@demo.com  | Freemium         | 6                    | 6/10                    | Básico | `TrustBadge` (6/6) |
| Sofía Gómez   | sofia.estudiante@demo.com | Freemium         | 9                    | **6/10** (cappeado)     | Básico | `TrustBadge` (6/6) |
| Rosa Martínez | rosa.anfitriona@demo.com  | Freemium         | 10                   | **6/10** (cappeado)     | Básico | `TrustBadge` (6/6) |
| Carlos Díaz   | carlos.anfitrion@demo.com | Freemium         | 2                    | 2/10                    | Básico | `TrustBadge` (2/6) |
| Elena Ruiz    | elena.anfitriona@demo.com | Freemium         | 8                    | **6/10** (cappeado)     | Básico | `TrustBadge` (6/6) |

Las 6 cuentas quedaron en `MembershipTier.Freemium`, así que hoy **ninguna muestra el `PremiumBadge`** (el ícono `BadgeCheck` de lucide que pidió el cliente) — ese estado todavía no se probó visualmente. Para probarlo: cambiar `MembershipTier.Freemium` → `MembershipTier.Premium` en al menos una de las entradas con `TrustScore` > 6 (Sofía, Rosa o Elena, las candidatas naturales porque ya tienen el puntaje) en `DemoProfileSeeder.cs`, borrar esa cuenta de la base (ver el gotcha de `ProfileLikes`/`Matches` con `Restrict` en [[modulos/Confianza]] — no alcanza con un `DELETE` directo si ya tiene matches/likes) y reiniciar `dotnet run` para que el seeder la recree. Carlos se dejó a propósito en Freemium/bajo como ejemplo de "recién empezando".

## Fotos demo (Data/DemoAssets)

Los `.jpg` de `backend/CasaConSi.Api/Data/DemoAssets/` son la fuente que `DemoProfileSeeder` copia a `wwwroot/uploads/` en cada usuario demo (ver `CopyDemoProfilePhoto`). No es un servicio de subida — no genera nombres únicos tipo GUID como sí hace `FileStorageService.SaveAsync` (usado en subidas reales de avatar/perfil/space, que arma `{Guid.NewGuid()}{extensión}` para evitar colisiones). Acá el nombre de archivo es fijo y versionado a mano, así que si dos hosts usan el mismo nombre fuente, terminan mostrando literalmente la misma imagen (no es "conflicto de nombres" en disco — cada host tiene su propia carpeta `profiles/{userId}/` — es reuso intencional o accidental de la misma foto).

Estado 2026-08-08:

| Cuenta        | Foto de perfil     | Fotos de casa                             | Origen                    |
| ------------- | ------------------- | ------------------------------------------ | ------------------------- |
| Elena Ruiz    | `elena-ruiz.jpg`     | `elena-casa.jpg` (frente), `elena-living.jpg`, `elena-cocina.jpg`, `elena-habitacion.jpg` | Fotos reales, propias de Elena (set completo) |
| Rosa Martínez | `rosa-martinez.jpg`  | `casa-living.jpg`, `casa-cocina.jpg`, `casa-bano.jpg`, `casa-habitacion.jpg` | Placeholders genéricos compartidos |
| Carlos Díaz   | `carlos-diaz.jpg`    | mismos 4 `casa-*.jpg` de arriba            | Placeholders genéricos compartidos |

Regla al sumar fotos reales a otra cuenta: darle nombre de archivo propio (`{nombre}-{algo}.jpg`), no pisar `casa-*.jpg` a menos que la intención sea cambiar el placeholder para los tres a la vez.

## Enlaces relacionados
- [[modulos/Perfiles]]
- [[modulos/Space]]
- [[modulos/Confianza]]
- [[00-Roadmap]]
