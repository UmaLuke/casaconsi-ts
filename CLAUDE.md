# CASA con SI — Índice del proyecto

Marketplace social de alquileres intergeneracional. Cliente: Lucía Verónica Pozzo (Córdoba).

La documentación completa vive en un vault de Obsidian: **[`docs/vault-casaconsi/`](docs/vault-casaconsi)**. Este archivo es solo el índice — antes de tocar código, leer el doc correspondiente al módulo/decisión en cuestión.

## Dónde está cada cosa

- **Estado general / roadmap:** [`docs/vault-casaconsi/00-Roadmap.md`](docs/vault-casaconsi/00-Roadmap.md) — qué está hecho, qué falta, pendientes de QA. Empezar siempre por acá.
- **Glosario de negocio:** [`docs/vault-casaconsi/glosario.md`](docs/vault-casaconsi/glosario.md) — Anfitrión/Estudiante, Generación, Match asistido, Perfil verificado, modelo freemium.
- **Convenciones backend:** [`docs/vault-casaconsi/convenciones/backend.md`](docs/vault-casaconsi/convenciones/backend.md) — stack, arquitectura Controller→Service→Repository, migraciones, secrets, y una sección de gotchas reales (EF Core, `wwwroot`, NuGet) que vale la pena revisar antes de debuggear algo raro.
- **Convenciones frontend:** [`docs/vault-casaconsi/convenciones/frontend.md`](docs/vault-casaconsi/convenciones/frontend.md) — stack, `VITE_API_URL` centralizado, imports relativos (el alias `@` NO está configurado, ver gotcha), TypeScript estricto (`verbatimModuleSyntax`), estructura de carpetas, trampas de CSS conocidas.
- **Cliente HTTP / interceptor de 401:** [`docs/vault-casaconsi/convenciones/http-client.md`](docs/vault-casaconsi/convenciones/http-client.md) — cómo funciona `services/httpClient.ts` (`apiFetch`), el evento `casaconsi:unauthorized` y mapa completo de qué componente/página usa cada `service`.
- **Decisiones de arquitectura (ADRs):** [`docs/vault-casaconsi/decisiones/`](docs/vault-casaconsi/decisiones)
  - [ADR-0001](docs/vault-casaconsi/decisiones/ADR-0001-arquitectura-single-project.md) — backend single-project, no multi-capa.
  - [ADR-0002](docs/vault-casaconsi/decisiones/ADR-0002-persistencia-jwt.md) — persistencia del JWT en frontend.
  - [ADR-0003](docs/vault-casaconsi/decisiones/ADR-0003-rol-asesor.md) — modelado del rol asesor.
- **Módulos:** [`docs/vault-casaconsi/modulos/`](docs/vault-casaconsi/modulos)
  - [Auth](docs/vault-casaconsi/modulos/Auth.md) — registro/login, Identity + JWT.
  - [Cuenta](docs/vault-casaconsi/modulos/Cuenta.md) — datos de cuenta (nombre, email, password, avatar), `/mi-perfil`.
  - [Perfiles](docs/vault-casaconsi/modulos/Perfiles.md) — cuestionario post-registro (StudentProfile/HostProfile).
  - [Space](docs/vault-casaconsi/modulos/Space.md) — publicaciones de habitaciones/propiedades.
  - [Match](docs/vault-casaconsi/modulos/Match.md) — like mutuo estilo Tinder, habilita el chat.
  - [Asesorias](docs/vault-casaconsi/modulos/Asesorias.md) — sesiones pagas con asesor.
  - [Confianza](docs/vault-casaconsi/modulos/Confianza.md) — sistema de puntaje de confianza (0-10), verificación de perfiles, freemium/premium.

## Stack (resumen — ver convenciones para el detalle)

- **Frontend:** React 19 + Vite + TypeScript + Tailwind CSS 4 + DaisyUI 5, puerto **5173**.
- **Backend:** ASP.NET Core (.NET 10, single-project `CasaConSi.Api`), puerto **8000**.
- **Datos:** EF Core 10 + Npgsql → PostgreSQL 18, puerto **5433**, DB `db_ccs`.
- **Auth:** ASP.NET Identity + JWT.
- **Tiempo real:** SignalR (chat).
- **Deploy:** Azure.

## Reglas de oro

- Nunca hardcodear URLs (`localhost:8000`, etc.) — todo vía `VITE_API_URL` en `src/config.ts`.
- Separación estricta Controller → Service → Repository en el backend; lógica de negocio solo en Services.
- TypeScript estricto, sin `any` sin justificar; tipos de dominio en `src/types/` alineados con los DTOs de la API.
- Nunca commitear secrets, connection strings ni claves JWT.
- Si hay inconsistencia entre frontend y backend (contratos de API, nombres de campos), avisar antes de asumir.

## Cómo mantener esto actualizado

Cuando se cierre un módulo, se tome una decisión de arquitectura, o se descubra un gotcha nuevo, documentarlo en el vault (`docs/vault-casaconsi/`) y no solo en el código — es la fuente de verdad del proyecto entre sesiones.
