tags: [convenciones, frontend, http, auth]

# Cliente HTTP centralizado (`httpClient.ts`) y mapa servicios ↔ componentes

**Creado:** 2026-08-11, junto con el interceptor de 401 — ver [[../modulos/Auth|Auth]] y [[../00-Roadmap|Roadmap]].

Este doc explica **cómo** funciona `services/httpClient.ts` y **quién llama a quién** en la capa de servicios del frontend, para no tener que rearmar el mapa cada vez que se toca un `service`.

---

## 1. Por qué existe

Antes de esto, cada archivo en `src/services/*.ts` llamaba a `fetch(\`${API_URL}/api/...\`)` directo. Funcionaba, pero tenía un agujero: si el backend invalidaba un token *antes* de su vencimiento natural (ban, cambio de rol, etc.), el frontend no se enteraba — `AuthContext` solo sabe reaccionar al vencimiento por tiempo (`expiresAt`, ver [[../decisiones/ADR-0002-persistencia-jwt|ADR-0002]]), no a una revocación server-side. La sesión se seguía viendo "activa" en el cliente hasta que a la persona se le ocurriera recargar la página, mientras cada request autenticado le devolvía 401 en silencio.

La solución necesitaba un solo lugar por el que pasaran **todos** los requests a la API propia, para poder mirar el status code de cada response sin tocar la lógica de cada `service` individualmente.

## 2. Cómo funciona `apiFetch`

`src/services/httpClient.ts`:

```ts
import { API_URL } from '../config';

export const UNAUTHORIZED_EVENT = 'casaconsi:unauthorized';

export const apiFetch = async (path: string, init: RequestInit = {}): Promise<Response> => {
  const response = await fetch(`${API_URL}${path}`, init);

  // Solo dispara logout si el request iba autenticado (llevaba
  // Authorization). Un 401 en /api/auth/login o /register es simplemente
  // "credenciales incorrectas" — no hay sesión que invalidar.
  const hadAuthHeader = new Headers(init.headers).has('Authorization');
  if (response.status === 401 && hadAuthHeader) {
    window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
  }

  return response;
};
```

Puntos clave:

- **`path` es relativo** (`/api/account/me`), no una URL completa — `apiFetch` arma la URL con `API_URL` adentro, así ningún `service` vuelve a hardcodear `${API_URL}` en cada `fetch` (regla de oro del proyecto, ver `CLAUDE.md`).
- **El filtro por header `Authorization` es intencional.** Si disparara el evento en *cualquier* 401, un intento de login con contraseña incorrecta (que también devuelve 401, sin token de por medio) dispararía un `logout()` — que no tiene nada que desloguear, pero igual redirige a `/` cortando el flujo del formulario. Por eso solo cuenta como "sesión invalidada" un 401 en un request que *ya* llevaba el JWT.
- **No importa React ni el Context.** `httpClient.ts` es un módulo plano — lo puede usar cualquier `service` sin acoplarse a `AuthContext`. La comunicación hacia React se hace vía `CustomEvent` en `window`.

## 3. Cómo se entera `AuthContext`

`src/context/AuthContext.tsx` se suscribe al evento en un `useEffect` aparte del que maneja la rehidratación al montar:

```ts
useEffect(() => {
  const handleUnauthorized = () => logout();
  window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
}, []);
```

`logout()` es el mismo método único que ya se usaba para el vencimiento por tiempo y para el botón "Cerrar sesión" del `Header` — limpia `user`/`token`, borra `localStorage` y navega a `/`. No hay una versión "especial" de logout para este caso.

## 4. Flujo completo

```
Componente/página
  → llama a una función de un service (ej. getMatches(token))
    → el service arma headers/body y llama a apiFetch(path, init)
      → apiFetch hace fetch(`${API_URL}${path}`, init)
      → si status === 401 y init.headers tenía Authorization:
          window.dispatchEvent(new CustomEvent('casaconsi:unauthorized'))
      → devuelve la Response igual (el service la sigue manejando normal,
        tira su propio Error de negocio si corresponde — ver punto 6)
  ← mientras tanto, en paralelo:
    AuthContext (montado una sola vez en la raíz de la app)
      escucha 'casaconsi:unauthorized' → logout() → limpia sesión → navigate('/')
```

El componente que originó el request **no** necesita saber nada de esto: su `try/catch` de siempre sigue viendo el error que ya lanzaba el `service` (`AccountError`, `MatchError`, etc.); el logout pasa por otro lado, en paralelo.

## 5. Mapa: qué service usa cada componente/página

| Service | Endpoints backend | Usado por |
|---|---|---|
| `authService.ts` | `POST /api/auth/register`, `POST /api/auth/login` | `LoginModal.tsx`, `pages/auth/RegisterPage.tsx`, `pages/auth/RegisterAdvisorPage.tsx` |
| `accountService.ts` | `GET/PUT /api/account/me`, `POST /api/account/avatar`, `PUT /api/account/password`, `PUT /api/account/email`, `POST/DELETE /api/account/gallery` | `pages/ProfilePage.tsx` (nombre, avatar, password, email), `components/features/profile/PhotoGalleryCard.tsx` (galería) |
| `questionnaireService.ts` | `GET /api/profile/status`, `GET/PUT /api/profile/student`, `GET/PUT /api/profile/host`, `POST /api/profile/{student,host}/photos` | `pages/questionnaire/StudentQuestionnairePage.tsx`, `pages/questionnaire/HostQuestionnairePage.tsx`, `pages/ProfilePage.tsx` (tab "Mi perfil de match", ver [[../modulos/Cuenta|Cuenta]]) |
| `matchService.ts` | `GET /api/match`, `GET /api/match/feed`, `POST /api/match/like` | `pages/MessagesPage.tsx` (`getMatches`), `pages/DiscoverPage.tsx` (`getFeed` + `registerLikeDecision`), `pages/ExploreSpacesPage.tsx` y `components/features/landing/ExploreSpaces.tsx` (`registerLikeDecision`, botones ✕/✓ sobre un `Space`) |
| `spaceService.ts` | `GET /api/space` | `pages/ExploreSpacesPage.tsx`, `components/features/landing/ExploreSpaces.tsx` (preview del landing) |
| `trustService.ts` | `GET /api/trust/status` | `pages/ProfilePage.tsx` (`TrustBadge`, ver [[../modulos/Confianza|Confianza]]) |
| `exchangeService.ts` | *(externo, `dolarapi.com`)* | `hooks/useExchangeRate.ts` — **no pasa por `apiFetch`**, no es la API propia |

Todos menos `exchangeService.ts` están migrados a `apiFetch`. El `service` que agregues de acá en adelante debería nacer usando `apiFetch` directo, no `fetch` a mano.

## 6. Qué NO cambia

- Cada `service` sigue siendo dueño de su propio manejo de errores de negocio (`AccountError`, `AuthError`, `MatchError`, `ProfileError`, `SpaceError`) — `apiFetch` no los reemplaza, solo agrega el side-effect del evento cuando corresponde. Un 401 autenticado sigue además rechazando la promise con el error de negocio normal del `service` (el componente que llamó puede seguir mostrando su propio mensaje si quiere, en paralelo al logout).
- `resolvePhotoUrl` en `spaceService.ts` sigue usando `API_URL` directo (no es un request, es para armar URLs de imágenes `<img src>`) — por eso ese archivo conserva el import de `API_URL` además de `apiFetch`.

## Pendiente relacionado

- Endpoint `/me` para revalidar el token al rehidratar desde `localStorage` (caso silencioso: si no hay ningún request de por medio, este interceptor nunca se dispara). Ver [[../modulos/Auth|Auth]] → sección Pendiente.

## Enlaces relacionados
- [[../modulos/Auth|Auth]]
- [[../decisiones/ADR-0002-persistencia-jwt|ADR-0002]]
- [[frontend]]
- [[../00-Roadmap|Roadmap]]
