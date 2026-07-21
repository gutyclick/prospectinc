# Fórmula determinística de auditoría web

La auditoría usa solamente hechos observables; no usa OpenAI. La precedencia es:

1. `no_website`: no existe URL oficial.
2. `unreachable`: la URL no responde de forma válida o devuelve un fallo del servidor.
3. `strong`: HTTPS, viewport móvil, meta descripción, contacto, contenido de servicios, reservas y cero enlaces rotos en la muestra.
4. `functional`: HTTPS, viewport móvil, meta descripción, contacto y contenido de servicios.
5. `outdated`: falta HTTPS o viewport móvil, o el copyright visible tiene más de dos años.
6. `basic`: el sitio es accesible, pero no alcanza los criterios anteriores.

Los enlaces rotos se comprueban sobre una muestra limitada. Las advertencias y el estado se guardan con la auditoría para que el resultado sea explicable y reproducible.
