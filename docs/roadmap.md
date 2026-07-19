# Roadmap de Prospector AI

El roadmap avanza por capacidades. Cada etapa debe conservar control humano, trazabilidad de fuentes y una base de código única. Las integraciones de una etapa posterior no deben adelantarse.

## 1. Base técnica

- Inicializar Next.js con App Router, TypeScript estricto y estructura modular.
- Configurar Tailwind CSS, lint, typecheck, pruebas y build.
- Definir scripts y convenciones del repositorio.
- Establecer layouts, manejo de errores y navegación base.
- Crear contratos iniciales del dominio sin infraestructura externa.

**Criterio de salida:** proyecto reproducible, validaciones automatizadas y build limpio.

## 2. Sistema visual

- Incorporar shadcn/ui y Lucide Icons según necesidades concretas.
- Definir tokens de color, tipografía, espacio, radio, sombra y capas.
- Construir primitivas compartidas de navegación, formularios, estado y feedback.
- Verificar responsive design, teclado, contraste y movimiento reducido.
- Documentar patrones de listas, tablas, tarjetas, filtros y paneles.

**Criterio de salida:** base visual consistente y accesible para construir los módulos.

## 3. Prototipo con datos simulados

- Implementar Inicio, Búsquedas, Prospectos, Propuestas, Bandeja y Configuración.
- Crear fixtures coherentes y repositorios simulados tipados.
- Implementar búsqueda por nicho y ubicación, filtros y detalle.
- Representar presencia digital, contactos con fuente y puntuación explicable.
- Gestionar estados comerciales, notas, propuestas y seguimientos simulados.
- Cubrir carga, vacío, error, éxito y vistas responsive.
- Realizar pruebas de los flujos principales con usuarios o revisión interna.

**Criterio de salida:** flujo completo demostrable sin servicios externos ni datos reales.

## 4. Supabase

- Diseñar esquema PostgreSQL, migraciones y políticas de acceso.
- Reemplazar gradualmente repositorios simulados por adaptadores Supabase.
- Mantener trazabilidad de fuentes e historial de cambios.
- Definir estrategia de almacenamiento y copias de seguridad.
- Evaluar autenticación únicamente cuando el producto la necesite, sin adelantar multitenencia.

**Criterio de salida:** persistencia estable con contratos de dominio conservados.

## 5. Motor de descubrimiento

- Seleccionar fuentes y proveedores permitidos con términos de uso compatibles.
- Implementar búsquedas asíncronas, límites, reintentos y deduplicación.
- Normalizar negocios, ubicaciones y señales de presencia digital.
- Guardar procedencia y fecha de cada dato.
- Excluir explícitamente scraping de Google Maps.

**Criterio de salida:** descubrimiento trazable y revisable de prospectos reales.

## 6. Analizador de páginas

- Definir criterios objetivos de calidad, rendimiento, accesibilidad y conversión.
- Incorporar Trigger.dev para tareas y Playwright para análisis permitido.
- Capturar evidencia, tiempos, errores y fecha de análisis.
- Aplicar límites de concurrencia, timeouts y respeto por los sitios analizados.
- Mostrar resultados como señales explicables, no como verdades absolutas.

**Criterio de salida:** auditorías técnicas reproducibles con evidencia visible.

## 7. Inteligencia artificial

- Integrar OpenAI API detrás de un adaptador propio.
- Diseñar salidas estructuradas y validarlas antes de persistirlas.
- Generar borradores de resúmenes, auditorías y propuestas a partir de evidencia real.
- Impedir que el modelo invente o complete contactos.
- Añadir revisión, edición y aprobación humana.
- Medir calidad, costo, latencia y fallos.

**Criterio de salida:** asistencia de IA útil, trazable y siempre supervisada.

## 8. Gmail y WhatsApp

- Integrar Gmail con permisos mínimos para crear borradores.
- No conceder ni implementar envío automático.
- Vincular borradores y respuestas con el prospecto correspondiente.
- Crear enlaces WhatsApp click-to-chat con mensajes revisables.
- Mantener envío manual y registrar la acción solo con confirmación del usuario.
- Añadir estados de conexión, error y revocación de permisos.

**Criterio de salida:** preparación de contactos eficiente sin perder control humano.

## 9. Pruebas, seguridad y despliegue

- Ampliar pruebas unitarias, de integración y end-to-end de flujos críticos.
- Revisar accesibilidad, rendimiento y compatibilidad responsive.
- Auditar secretos, permisos, validación de entradas y manejo de datos públicos.
- Añadir observabilidad, alertas y recuperación ante fallos.
- Configurar entornos y despliegue en Vercel.
- Documentar operación, incidentes y criterios de lanzamiento.

**Criterio de salida:** versión desplegable, observable y segura para uso real controlado.
