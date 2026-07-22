tags: [convenciones, frontend]

# Convenciones — Frontend

## Stack
- React 19 + Vite + TypeScript.
- Tailwind CSS 4 + DaisyUI 5.
- Puerto local: **5173**.

## URLs y configuración
- **Nunca** hardcodear URLs (`localhost:8000`, etc.).
- Todo apunta a `VITE_API_URL`, centralizado en `src/config.ts` (`import.meta.env.VITE_API_URL`).
- SignalR también debe usar la URL centralizada, no hardcodeada.

## Imports
- Alias `@` → `src/` (configurado en `vite.config.ts`).

## TypeScript
- Estricto: sin `any` sin justificar.
- Tipar props, estados y respuestas de API.
- Tipos de dominio centralizados en `src/types/` (`User`, `Space`, etc.) — deben quedar alineados con los DTOs de la API .NET. Si hay un endpoint nuevo, **verificar el tipo antes de usarlo**.

## Estructura de carpetas
```
components/{common,layout,features}
pages/
hooks/
context/
types/
services/
```
- Hooks personalizados van en `src/hooks/` — nunca junto a un Context con JSX.

## Trampas conocidas (CSS)
- Herencia de color en inputs: si un input está dentro de un ancestro `text-white`, hereda texto blanco vía `input { color: inherit }` de Tailwind preflight → fix con `text-base-content` explícito.
- Flexbox overflow: `justify-center` en un contenedor scrolleable recorta contenido que desborda → usar wrapper interno `min-h-full` para centrado-con-overflow.

## Enlaces relacionados
- [[modulos/Auth]]
- [[00-Roadmap]]
