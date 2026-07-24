tags: [demo, testing, no-produccion]

# Datos de prueba — perfiles y espacios demo

⚠️ **Solo para Development.** Estos usuarios los crea `Data/DemoProfileSeeder.cs` (y los espacios `Data/DemoSpaceSeeder.cs`, que corre después y depende de que los anfitriones demo ya existan) automáticamente al levantar el backend en modo Development (no corre en producción). No son secrets reales, pero **no deberían existir en la DB de producción** — si alguna vez aparecen ahí, algo está mal configurado con `ASPNETCORE_ENVIRONMENT`.

**Password para todos:** `Demo1234!`

## Estudiantes

| Nombre | Email | Zona preferida | Generación de anfitrión preferida |
|---|---|---|---|
| Mía Fernández | mia.estudiante@demo.com | Nueva Córdoba, Alberdi | Adulto mayor |
| Juan Pérez | juan.estudiante@demo.com | Cerro de las Rosas | Indiferente |
| Sofía Gómez | sofia.estudiante@demo.com | Güemes, Nueva Córdoba | Adulto mayor |

## Anfitriones

| Nombre | Email | Zona | Tipo vivienda | Habitaciones disponibles | Generación de estudiante preferida |
|---|---|---|---|---|---|
| Rosa Martínez | rosa.anfitriona@demo.com | Nueva Córdoba | Departamento | 1 | Indiferente |
| Carlos Díaz | carlos.anfitrion@demo.com | Alberdi | Casa | 2 | Indiferente |
| Elena Ruiz | elena.anfitriona@demo.com | Cerro de las Rosas | Casa | 1 | Joven adulto |

## Espacios (Space)

Uno por cada anfitrión demo, con fotos vía `ExternalImageUrl` (URLs de Unsplash, no archivos subidos de verdad — ver [[modulos/Space]]). Los 3 quedan `Verified = true`.

| Título | Anfitrión | Barrio | Precio | Propósito | Duración |
|---|---|---|---|---|---|
| Habitación Luminosa con Baño Privado | Rosa Martínez | Nueva Córdoba | $90.000 | Estudiar | Anual |
| Anexo Independiente en Casa Familiar | Carlos Díaz | Alberdi | $80.000 | Compartir gastos | Semestral/cuatrimestral |
| Cuarto con Vista al Jardín | Elena Ruiz | Cerro de las Rosas | $105.000 | Estudiar | Semestral/cuatrimestral |

## Enlaces relacionados
- [[modulos/Perfiles]]
- [[modulos/Space]]
- [[00-Roadmap]]
