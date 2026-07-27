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

Los 3 estudiantes también tienen foto de perfil real (una por género: Mía y Sofía femenino, Juan masculino). Los assets fuente viven versionados en `Data/DemoAssets/*.jpg` (no en `wwwroot/uploads/`, que está gitignoreado) y `DemoProfileSeeder.CopyDemoProfilePhoto` los copia a `wwwroot/uploads/profiles/{userId}/` al sembrar — mismo destino y misma convención de ruta relativa que un upload real vía `POST /api/profile/student/photos` (`FileStorageService.SaveAsync` con subfolder `profiles/{userId}`), solo que sin pasar por un `IFormFile`/request HTTP real. Se ven como foto de perfil en el feed de `DiscoverPage.tsx` (antes mostraban el ícono genérico de usuario) y en el cuestionario ya completado. Los anfitriones demo todavía no tienen foto de perfil.

De paso quedó corregido un bug real: `StudentExchangesOffered.Offerings` tenía valores que no existían en `frontend/src/data/studentQuestionnaireSchema.ts` (`"acompañamiento"`, `"tareas-hogar"` en vez de `"compania-actividades"`, `"tareas-domesticas"`), y `HostTenantPreferences.PreferredGeneration` de Elena Ruiz tenía `"joven-adulto"`, que tampoco es un valor válido de `GENERATION_PREFERENCE_OPTIONS` (quedó en `"adulto-joven"`, la opción real más cercana). Si alguna vez un `<select>` del cuestionario aparece "vacío" para un perfil demo a pesar de tener dato guardado, es señal de este mismo tipo de desalineación valor-guardado vs. opción-del-schema.

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
