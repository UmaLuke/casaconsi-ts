tags: [glosario]

# Glosario — CASA con SI

- **Anfitrión:** persona que ofrece una habitación/espacio disponible en su hogar.
- **Estudiante / locatario:** persona que busca alojamiento.
- **Generación:** campo calculado automáticamente a partir de la fecha de nacimiento (ej. Baby Boomer, Gen X, Millennial, Gen Z), usado para el criterio intergeneracional del match.
- **Match asistido:** servicio pago donde CASA CON SI ayuda activamente en el proceso de emparejamiento anfitrión↔estudiante.
- **Perfil verificado:** nivel pago que incluye validación de identidad (DNI + biométrico). Implementado como parte del sistema de puntaje de confianza (0-10) — ver [[modulos/Confianza]].
- **Asesoría profesional:** sesión paga con un asesor sobre el proceso de convivencia.
- **Modelo freemium:** registro, perfil, búsqueda y match básico son gratis; verificación, match asistido y asesoría son pagos. En el modelo de datos es `MembershipTier.Freemium` vs. `Premium` en `ApplicationUser` — ver [[modulos/Confianza]].
- **Puntaje/Índice de confianza:** 0 a 10, uno por ítem de verificación cumplido (identidad, contacto, redes, crediticia, constancia, declaración jurada, referencias, entrevista, antecedentes, historial de convivencia). 1-6 = Perfil básico, 7-10 = Perfil de alta confianza. Ver [[modulos/Confianza]].

## Roles técnicos (no confundir con roles de negocio)
- `Role` (enum en `ApplicationUser`): `host` / `student` — mapea a Anfitrión / Estudiante.

## Enlaces relacionados
- [[00-Roadmap]]
- [[modulos/Match]]
