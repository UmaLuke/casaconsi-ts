tags: [modulo, backend, pendiente]

# Módulo: Match

**Estado:** 🚧 No iniciado.

## Alcance previsto
- Lógica de "match asistido" entre estudiante y anfitrión (servicio pago, según el modelo freemium del proyecto).
- Estados de una solicitud: Pendiente / En Entrevista / Aceptada (ver `ApplicationsList.jsx` en frontend).
- Notificación al anfitrión de solicitudes entrantes (`IncomingRequests.jsx`).

## Preguntas abiertas
- ¿El match es un proceso manual asistido por un humano de CASA CON SI, o completamente algorítmico?
- ¿Cómo se relaciona con el chat en tiempo real (SignalR)? ¿El match habilita el chat, o el chat es independiente?

## Enlaces relacionados
- [[00-Roadmap]]
- [[modulos/Space]]
- [[convenciones/backend]]
