tags: [modulo, backend, pendiente]

# Módulo: Asesorías

**Estado:** 🚧 En curso — rol de asesor y alta de cuenta ya funcionan end-to-end ([[decisiones/ADR-0003-rol-asesor]]); falta agenda/pago/listado real.

## Alcance previsto
- Servicio de asesoría profesional paga (uno de los niveles del modelo freemium, junto con perfil verificado y match asistido).
- Requiere: agenda/reserva de sesión, pago asociado, rol de "asesor" (✅ decidido), alta de cuenta (✅ decidido) — ver abajo.

## Decidido
- **Rol de asesor:** `ApplicationUser` con rol especial, `UserRole.Advisor` (serializa `"advisor"`) — ver [[decisiones/ADR-0003-rol-asesor]]. Sin migración de EF Core (enum se persiste como `int`).
- **Alta de cuentas advisor:** formulario y página propios — `RegisterAdvisorForm.tsx` + `RegisterAdvisorPage.tsx`, ruta pública `/register/asesor`. Reutiliza `registerRequest`/`RegisterFormData` (se amplió `role` a `UserRole` para que sirva para los dos flujos). CTA "Postularme como asesor" en la sección `Advisors.tsx` de la landing apunta ahí.
- **Campo `Profession`:** real y persistido (`ApplicationUser.Profession`, nullable), no solo texto informativo — el cliente ya adelantó la primera profesión (Trabajo Social). Migración `AddProfessionToApplicationUser` aplicada. El formulario deja explícito en la UI que es temporal, para no fijar de más antes de tiempo.

## Preguntas abiertas
- ¿Integra con el módulo de pagos general del proyecto, o tiene su propio flujo?
- Alcance del MVP: ¿agenda/reserva de sesión, pago asociado, listado de asesores conectado a datos reales (reemplazar el `mockAdvisors` de `Advisors.tsx` y el placeholder de `AdvisoryPage.tsx`), vista de gestión del lado del asesor — todo junto o por etapas?
- ¿El campo `Profession` debería eventualmente ser una lista cerrada (enum/tabla) en vez de texto libre, si se suman más profesiones además de Trabajo Social?

## Interacciones (lo que existe hoy)

No hay `AdvisoryController`/`AdvisoryService` propios todavía — lo único real es el alta de cuenta, que reutiliza el módulo Auth:

```
RegisterAdvisorForm.tsx (RegisterAdvisorPage.tsx, /register/asesor)
  → registerRequest(data)                        [authService.ts, ver [[Auth]]]
    → apiFetch('/api/auth/register', ...)          [httpClient.ts]
      → AuthController.Register → AuthService.RegisterAsync (UserRole.Advisor, Profession persistido)
    ← AuthResponseDto
```

El resto del frontend relacionado con asesorías **no llama a ningún service todavía**:
- `components/features/landing/Advisors.tsx` renderiza un array `mockAdvisors` hardcodeado — no hay `advisoryService.ts` ni endpoint que lo alimente.
- `pages/AdvisoryPage.tsx` es un placeholder estático.

Cuando exista el backend real (agenda/pago/listado), este módulo va a necesitar su propio `AdvisoryController → AdvisoryService → AdvisoryRepository` (siguiendo el mismo patrón que [[Match]]/[[Space]]/[[Perfiles]]) y un `services/advisoryService.ts` en el frontend — documentar acá cuando se arme, siguiendo el formato de interacciones de los demás módulos (ver [[../convenciones/http-client|convenciones/http-client]]).

## Pendiente de ajustar
- `LoginModal.tsx` línea 26: redirect post-login binario (`host` → `/descubrir`, cualquier otro rol → `/explorar`) no contempla `advisor` todavía — y ahora que pueden existir cuentas reales, es un bug latente, no solo teórico.

## Enlaces relacionados
- [[00-Roadmap]]
- [[convenciones/backend]]
- [[decisiones/ADR-0003-rol-asesor]]
