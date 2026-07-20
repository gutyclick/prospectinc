# Cumplimiento de Google Places

## Alcance

Prospector AI usa exclusivamente Text Search (New) mediante una solicitud POST desde el servidor. No realiza scraping de Google Maps, no llama Place Details y no solicita fotografías, reseñas, teléfonos, coordenadas, ratings ni resúmenes editoriales.

## Datos permanentes

El identificador `google_place_id` es la clave estable de deduplicación. El nombre visible se conserva como dato mínimo para que el usuario pueda identificar el prospecto dentro de la aplicación; nicho, ciudad y país proceden de la búsqueda introducida por el usuario. El sitio devuelto por Places se marca como `google_places_cache`, provisional y sin fecha de verificación.

Direcciones, tipo principal, enlace atribuible y demás contenido del resultado no pasan automáticamente a campos permanentes del prospecto. Una auditoría posterior puede verificar el sitio como fuente independiente y cambiar su procedencia a `official_website`.

## Caché temporal

`place_discovery_cache` conserva el snapshot normalizado necesario para revisar el resultado durante un máximo de 24 horas. Cada fila incluye propietario, búsqueda, `google_place_id`, proveedor, creación y caducidad. RLS impide el acceso entre propietarios.

La tarea elimina entradas vencidas antes de guardar resultados nuevos. `delete_expired_place_discovery_cache()` permite al propietario limpiar sus propias entradas caducadas. La caché nunca se presenta como información propia ni como evidencia verificada.

## Atribución

Cuando la interfaz muestra métricas o contenido originado en Places, indica “Datos temporales proporcionados por Google Places” y enlaza a Google Maps. Los enlaces atribuibles individuales permanecen en el snapshot temporal. La presentación deberá revisarse si Google modifica sus requisitos de marca o atribución.

## Sitio oficial y contactos

El website URI de Places solo sirve como candidato provisional. El analizador valida DNS, navegación y URL final antes de marcarlo como `official_website`. Correos, teléfonos, WhatsApp, formularios y redes extraídos del sitio conservan:

- `source_type = official_website`;
- la URL exacta de la página de origen;
- `last_verified_at`;
- el valor original y el normalizado.

No se infieren contactos y un teléfono no se clasifica como WhatsApp sin un enlace observable de WhatsApp.

## Coste y observabilidad

- Máximo configurable mediante `GOOGLE_PLACES_MAX_RESULTS`, nunca superior a 20.
- Timeout y reintentos solo para 429 y 5xx.
- Una búsqueda idéntica reciente exige confirmación.
- Los logs incluyen cantidad de solicitudes y resultados, nunca claves ni respuestas completas.
- No se usa un FieldMask comodín.
