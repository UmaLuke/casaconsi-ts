tags: [adr, backend, arquitectura]

# ADR-0001: Arquitectura single-project para el backend

- **Fecha:** (completar con la fecha real de la decisión)
- **Estado:** Aceptada

## Contexto
Se evaluó una estructura de solución en cuatro capas (Domain / Application / Infrastructure / Api) como proyectos `.csproj` separados. Sr Maxi llegó al proyecto sin experiencia previa en C#/.NET, construyendo el backend desde cero junto a un frontend ya desarrollado.

## Opciones consideradas
1. **Multi-proyecto en capas** (Domain/Application/Infrastructure/Api) — más "correcto" académicamente, pero agrega fricción de referencias entre proyectos, mayor curva de entrada sin experiencia previa en .NET.
2. **Single-project** (`CasaConSi.Api` con carpetas internas) — mismo orden lógico (Controllers → Services → Repositories) pero sin la sobrecarga de múltiples `.csproj`.

## Decisión
Se adoptó **single-project** (`CasaConSi.Api`) con separación por carpetas internas, manteniendo igualmente la disciplina de capas: Controllers → Services → Repositories, sin lógica de negocio en los controllers.

## Consecuencias
- Menor fricción para seguir aprendiendo .NET mientras se construye.
- Si el proyecto crece mucho, migrar a multi-proyecto más adelante es posible pero requiere reorganización.
- La disciplina de capas depende de convención (carpetas), no de límites de compilación entre proyectos — hay que ser consistente a mano. Ver [[convenciones/backend]].

## Enlaces relacionados
- [[convenciones/backend]]
- [[00-Roadmap]]
