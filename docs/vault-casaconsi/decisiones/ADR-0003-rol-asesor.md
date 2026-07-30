tags: [adr, backend, asesorias]

# ADR-0003: Modelado del rol de asesor

- **Fecha:** 2026-07-28
- **Estado:** Aceptada (parcial — resuelve solo el modelado del usuario, no pagos ni alcance de MVP)

## Contexto
El módulo de Asesorías ([[modulos/Asesorias]]) tenía dos preguntas abiertas sobre cómo representar a un asesor en el sistema. Se resolvió la primera: si el asesor es un `ApplicationUser` con rol especial, o una entidad aparte gestionada desde un panel admin.

## Opciones consideradas
1. **`ApplicationUser` con rol especial (`UserRole.Advisor`)**
   - Ventaja: reutiliza todo lo ya construido en Auth/JWT/Identity — login igual que host/student, sin nueva infraestructura.
   - Desventaja: por ahora no hay forma de crear la cuenta salvo manualmente (el selector de rol en `RegisterForm.tsx` solo expone host/student).
2. **Entidad aparte, gestionada por Admin**
   - Ventaja: control centralizado, no requiere que el asesor se auto-registre.
   - Desventaja: bloqueado por el panel Admin, que todavía no existe (ver Roadmap, sección Módulo Admin).

## Decisión
**`ApplicationUser` con rol especial.** Se agrega `UserRole.Advisor` al enum (serializa como `"advisor"`, mismo patrón que `"host"`/`"student"`), y `'advisor'` a `UserRole` en `frontend/src/types/auth.ts`.

No requiere migración de EF Core: `UserRole` se persiste como `int` sin `HasConversion` explícito en `ApplicationDbContext`, así que un valor nuevo al final del enum no rompe los datos existentes.

`RegisterRequestDto`, `AuthResponseDto`, `ApplicationUser`, `AuthService` y `AdminSeeder` ya son genéricos sobre `UserRole` — no necesitaron cambios.

## Consecuencias / pendiente
- **Alta de cuentas advisor: ✅ resuelto (2026-07-29).** No se agregó un tercer botón a `RegisterForm.tsx` — se hizo un formulario y página propios: `RegisterAdvisorForm.tsx` + `RegisterAdvisorPage.tsx`, ruta pública `/register/asesor`. `RegisterFormData.role` se amplió de `'host' | 'student'` a `UserRole` (tipo compartido) para que `registerRequest` sirva para los dos flujos. El CTA "Postularme como asesor" de `Advisors.tsx` apunta a esa ruta.
- **Campo `Profession`:** se agregó real (no solo visual) porque el cliente ya definió la primera profesión (Trabajo Social) aunque el alcance completo del módulo siga sin cerrar. Se sumó `Profession` (string, nullable) a `ApplicationUser`, `RegisterRequestDto` y `AuthResponseDto`, más el mapeo correspondiente en `AuthService.cs` y en `frontend/src/types/auth.ts` / `authService.ts`. Requirió migración de EF Core (a diferencia del rol, que no la necesitó): `AddProfessionToApplicationUser`.
- Formulario marcado explícitamente como temporal en la propia UI ("el listado de campos puede cambiar cuando definan el alcance final") — evita que se lea como el modelo definitivo de datos de un asesor.
- **`LoginModal.tsx` línea 26:** el redirect post-login (`user.role === 'host' ? '/descubrir' : '/explorar'`) sigue siendo binario. Ahora que pueden existir cuentas advisor reales, esto ya es un bug latente (no solo teórico): un asesor que loguee hoy cae mal en `/explorar`. Sigue pendiente.
- Siguen abiertas las otras dos preguntas del módulo: flujo de pago de la sesión (propio vs. módulo de pagos general) y alcance del MVP (agenda, listado de asesores conectado a datos reales, vista de gestión del asesor).

## Enlaces relacionados
- [[modulos/Asesorias]]
- [[modulos/Auth]]
- [[00-Roadmap]]
