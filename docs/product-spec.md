# Especificación de producto: Prospector AI

## Problema

Encontrar negocios que podrían beneficiarse de una mejor presencia digital exige buscar en varias fuentes, evaluar manualmente sus sitios y redes sociales, comprobar datos de contacto y mantener un seguimiento disperso. Este trabajo consume tiempo, dificulta priorizar oportunidades y puede perder la trazabilidad del origen de la información.

Prospector AI centraliza ese proceso sin sustituir el criterio humano: ayuda a descubrir negocios, registrar evidencia pública, evaluar oportunidades, preparar propuestas y organizar conversaciones comerciales.

## Usuario inicial

El usuario inicial es una sola persona que ofrece servicios de diseño y desarrollo web a pequeños y medianos negocios. Trabaja de forma directa, necesita investigar prospectos con rapidez y quiere mantener control manual sobre cada contacto y envío.

No se contemplan todavía equipos, roles, permisos, organizaciones ni múltiples espacios de trabajo.

## Flujo principal

1. El usuario define un nicho y una ubicación.
2. Revisa resultados simulados de negocios y la evidencia disponible sobre su presencia digital.
3. Abre un prospecto, valida su sitio, redes y datos empresariales públicos con sus URL de origen.
4. El sistema presenta una puntuación explicable de oportunidad y señales que requieren revisión humana.
5. El usuario cambia el estado comercial y prioriza el prospecto.
6. Prepara una auditoría y una propuesta personalizada a partir de datos verificados.
7. Revisa y aprueba manualmente el contenido antes de cualquier contacto.
8. Registra respuestas, tareas de seguimiento y evolución de la oportunidad en una bandeja unificada.

## Módulos

### Inicio

Resumen operativo con métricas, prospectos prioritarios, actividad reciente y próximos seguimientos. Debe facilitar retomar el trabajo sin convertirse en un panel analítico complejo.

### Búsquedas

Creación y consulta de búsquedas por nicho y ubicación. Durante el prototipo usará resultados simulados y filtros locales; no realizará scraping de Google Maps ni descubrimiento externo real.

### Prospectos

Listado y ficha detallada de negocios. Reúne presencia digital, datos públicos de contacto, fuentes, puntuación, señales de oportunidad, notas, estado comercial e historial. Ningún contacto puede mostrarse como verificado si no conserva una URL de origen.

### Propuestas

Espacio para preparar auditorías y propuestas personalizadas. En el MVP simulado se utilizarán plantillas y contenido predefinido editable, sin generación mediante IA ni envío automático.

### Bandeja

Vista unificada de contactos, respuestas simuladas, seguimientos y tareas pendientes. En el prototipo no se conectará a Gmail ni WhatsApp.

### Configuración

Preferencias locales del prototipo, criterios de puntuación visibles y plantillas simuladas. No incluirá cuentas, facturación, permisos ni secretos de integraciones.

## Estados comerciales

Los prospectos avanzan manualmente entre estos estados:

1. **Nuevo:** descubierto o agregado, todavía sin revisión.
2. **Analizando:** evidencia y presencia digital en revisión.
3. **Calificado:** cumple los criterios mínimos de oportunidad.
4. **Alta prioridad:** oportunidad relevante que merece atención inmediata.
5. **Propuesta lista:** auditoría y propuesta preparadas para revisión.
6. **Contactado:** se realizó un primer contacto manual.
7. **Respondió:** existe una respuesta registrada.
8. **Seguimiento:** requiere una acción posterior programada.
9. **Negociación:** hay conversación activa sobre alcance o condiciones.
10. **Ganado:** la oportunidad se convirtió en cliente.
11. **Descartado:** no se continuará, conservando el motivo y el historial.

El prototipo no impondrá una secuencia rígida, pero deberá registrar de forma visible el estado actual y permitir una evolución comprensible.

## Alcance del MVP

- Interfaz responsive completamente en español.
- Navegación entre los seis módulos.
- Datos simulados coherentes y tipados.
- Búsquedas simuladas por nicho y ubicación.
- Listado, filtrado, ordenamiento y detalle de prospectos.
- Clasificación de presencia digital: con sitio, sitio deficiente, solo redes sociales o sin presencia identificada.
- Registro visible de contactos empresariales simulados junto con su URL de origen.
- Puntuación de oportunidad explicable mediante señales y criterios visibles.
- Gestión manual de estados, prioridad, notas y próximos seguimientos.
- Creación y edición simulada de auditorías y propuestas.
- Bandeja unificada con conversaciones y tareas simuladas.
- Estados de carga, vacío, error y confirmación representativos.
- Persistencia local opcional solo si resulta útil para demostrar el flujo, sin base de datos remota.

## Fuera del MVP

- Datos reales obtenidos mediante scraping o proveedores externos.
- Scraping de Google Maps.
- Supabase, PostgreSQL y persistencia multiusuario.
- OpenAI API y generación automática de análisis o propuestas.
- Trigger.dev, Playwright y automatizaciones de navegación.
- Integración real con Gmail.
- Envío automático de correo o WhatsApp.
- Autenticación, equipos, roles, pagos y multitenencia.
- Extensión de navegador.
- Aplicaciones móviles nativas.
- Importación masiva, enriquecimiento de datos y CRM externo.
- Analítica avanzada, experimentos de campañas o automatización comercial autónoma.
