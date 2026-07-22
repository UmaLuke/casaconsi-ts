tags: [modulo, backend, pendiente]

# Módulo: Space (espacios/propiedades)

**Estado:** 🚧 No iniciado.

## Alcance previsto
- Repositorio y servicio para las habitaciones/propiedades publicadas por anfitriones.
- Relación con `ApplicationUser` (anfitrión propietario).
- Soporta las vistas frontend: `ExploreSpacesPage`, `SpaceDetailPage`, `MySpacesList`, `NewSpaceForm`.

## Preguntas abiertas
- ¿Qué campos mínimos tiene un `Space`? (precio, zona, fotos, comodidades, reglas de convivencia)
- ¿Galería multimedia se guarda como URLs externas (blob storage / Azure) o se gestiona en otra tabla?
- ¿Relación 1:N estricta anfitrión→espacios, o puede haber co-anfitriones?

## Contratos con frontend a verificar
- Antes de exponer el endpoint, chequear que el tipo `Space` en `src/types/` coincida con el DTO que devuelva la API.

## Enlaces relacionados
- [[00-Roadmap]]
- [[convenciones/backend]]
