# Revisión integral de la Fase 1

Fecha de revisión: 19 de julio de 2026.

## Resultado general

La Fase 1 ofrece un prototipo funcional, responsive y completamente en español sobre una sola aplicación Next.js. Los flujos principales funcionan con datos simulados tipados y sin Supabase, OpenAI, Gmail, WhatsApp ni otras APIs externas. Toda acción de contacto conserva control humano y las acciones denominadas “enviar” solo actualizan estado o registran una simulación local.

La navegación principal contiene exclusivamente: Inicio, Búsquedas, Prospectos, Propuestas, Bandeja y Configuración. No existen rutas ni elementos de navegación separados para Contactados o Respuestas.

## Funciones completadas

### Inicio (`/`)

- Métricas calculadas desde repositorios, oportunidades prioritarias y vista rápida.
- Actividad reciente, acciones rápidas, embudo de prospección y recomendaciones determinísticas.
- Carga estructurada, estado vacío y tablas adaptables mediante desplazamiento contenido.

### Búsquedas (`/busquedas`)

- Formulario validado por Zod y React Hook Form.
- Proceso simulado por etapas, historial actualizado sin recarga, métricas y filtros.
- Sugerencias locales, actividad reciente y representación SVG estilizada de Panamá.
- Ninguna consulta a Google Places, Google Maps ni servicios externos.

### Prospectos (`/prospectos`)

- Métricas, segmentos, distribución por estado, filtros centralizados y parámetros navegables en la URL.
- Tabla responsive, vista rápida, exportación CSV local y alta manual validada.
- Contactos públicos simulados vinculados obligatoriamente a una URL de origen.
- Enlace contextual para crear una propuesta con el prospecto precargado.

### Propuestas (`/propuestas`)

- Métricas monetarias, tabla filtrable, vista previa y flujo de rendimiento.
- Creación validada con cuatro plantillas y precarga mediante `prospectId`.
- Contenido determinístico simulado detrás de lógica de dominio.
- Confirmación explícita: “Enviar propuesta” solo la marca como lista para enviar.

### Bandeja (`/bandeja`)

- Filtros con contadores y vista dividida con scroll independiente.
- Lista de conversaciones, historial, propuesta asociada, intención y siguiente acción.
- Respuesta sugerida editable, borrador local, registro de envío simulado y seguimientos con fecha y hora.
- Cambios manuales a negociación, ganado o descartado sincronizados con el prospecto.
- Clasificación determinística aislada por la interfaz `ConversationIntelligence`.

### Configuración (`/configuracion`)

- Ruta integrada en el shell y navegación accesible.
- Su contenido funcional queda pendiente; no se adelantaron cuentas, secretos, integraciones ni preferencias persistentes.

## Decisiones tomadas

- Mantener un monolito modular con App Router y Server Components por defecto.
- Inferir tipos de dominio desde Zod para evitar definiciones divergentes.
- Obligar a que todo contacto simulado tenga una URL de origen.
- Encapsular los fixtures detrás de repositorios asíncronos reemplazables.
- Centralizar etiquetas de estados y lógica de filtros que se reutiliza entre pantallas.
- Mantener generación y clasificación simuladas como funciones determinísticas aisladas.
- Usar parámetros de URL para filtros de Prospectos y precarga de Propuestas.
- Mantener tablas solo donde facilitan comparación; Bandeja usa paneles y listas compactas.
- Incorporar límites globales de error, página 404 en español, skeletons y estados vacíos reutilizables.
- No añadir dependencias durante la revisión: las instaladas tienen uso en código, estilos, formularios, validación o pruebas.

## Revisión técnica

### Arquitectura y tipos

- TypeScript permanece en modo estricto, sin `any`, `@ts-ignore` ni supresiones equivalentes.
- La interfaz no importa fixtures directamente; las páginas obtienen datos mediante repositorios.
- Las relaciones propuesta–prospecto y conversación–prospecto están cubiertas por pruebas.
- Se corrigieron estados simulados inconsistentes: propuestas aceptadas corresponden a prospectos ganados y propuestas en negociación a prospectos en negociación.

### Sistema visual, responsive y accesibilidad

- El shell, radios, bordes, sombras, espaciado y colores se apoyan en tokens CSS.
- Las pantallas reorganizan tarjetas en móvil/tableta y contienen el scroll horizontal dentro de tablas.
- Bandeja alterna lista y detalle en móvil y mantiene ambos paneles en escritorio.
- Navegación, botones, formularios y paneles conservan nombres accesibles y foco visible.
- Los modales contienen el foco, responden a Escape y restauran el foco al cerrar.
- Los estados no dependen únicamente del color: incluyen texto e iconografía.
- Se respeta `prefers-reduced-motion` globalmente.

### Carga, vacíos y errores

- Inicio, Búsquedas, Prospectos, Propuestas y Bandeja incluyen cargas estructuradas.
- Las listas y tablas principales diferencian ausencia de resultados mediante `EmptyState` o mensajes equivalentes.
- Existe un límite global de error con reintento y una página 404 localizada.
- Las confirmaciones y cambios asíncronos relevantes se anuncian mediante regiones accesibles.

### Rendimiento y dependencias

- No se incorporaron gráficas pesadas, mapas externos ni gestores globales de estado.
- Los cálculos derivados usan funciones puras y memoización solo donde aporta valor.
- Los paneles limitan su altura y usan scroll independiente para evitar páginas excesivamente largas.
- `date-fns`, React Hook Form, Zod, Lucide, Base UI, CVA, `clsx` y `tailwind-merge` tienen usos concretos.
- `shadcn` y `tw-animate-css` participan en la configuración y hojas de estilo del sistema visual.

### Verificación visual por viewport

Se levantó el build local y se generaron 12 capturas temporales con Microsoft Edge headless: cada una de las seis rutas a 1440 × 1000 y 390 × 844. Las capturas no forman parte del repositorio.

- **Inicio:** tarjetas en una columna en móvil y resumen multicolumna en escritorio; acciones y tabla permanecen dentro del contenido.
- **Búsquedas:** formulario lineal legible en móvil y composición con métricas, mapa y actividad en escritorio.
- **Prospectos:** acciones apiladas en móvil; filtros y tabla contenidos; vista rápida paralela en escritorio.
- **Propuestas:** métricas apiladas en móvil; tabla con scroll interno; listado y vista previa paralelos en escritorio.
- **Bandeja:** lista como vista inicial en móvil y panel dividido con scroll independiente en escritorio.
- **Configuración:** shell, navegación y encabezado responden correctamente, aunque su contenido funcional sigue pendiente.

Durante esta revisión se corrigió la contribución del ancho mínimo de tablas al ancho de la página, se limitaron los contenedores al viewport y se mantuvo el desplazamiento horizontal exclusivamente dentro de las tablas y filtros compactos.

## Deuda técnica

- Los repositorios mutables viven únicamente en memoria. Una recarga, reinicio del proceso o cambio de entorno restaura los fixtures.
- El estado mutable cargado en componentes cliente y el estado usado durante render del servidor no constituyen una fuente persistente única.
- Configuración todavía es una pantalla mínima y no permite editar criterios o plantillas.
- La búsqueda global, las notificaciones y el perfil del shell son controles visuales simulados.
- No existe todavía un historial inmutable de transiciones comerciales o cambios de propuestas.
- Las métricas recorren colecciones pequeñas en memoria; necesitarán consultas agregadas o vistas al crecer.
- Las pruebas actuales son unitarias y de integración con jsdom. Falta una suite end-to-end y automatización de accesibilidad con navegador real.
- Los errores de operaciones remotas aún no tienen taxonomía, reintentos ni estados por acción porque no existen servicios remotos.

## Problemas conocidos

- Todos los contactos y dominios `.example` son ficticios por diseño.
- Las fechas de fixtures son fijas para producir resultados reproducibles; el texto relativo pierde relevancia con el paso del tiempo.
- “Marcar como enviada” en Bandeja agrega un mensaje simulado al historial, pero no comprueba un proveedor externo.
- El flujo de plantillas permite iniciar una propuesta, pero no existe todavía administración persistente de plantillas.
- No hay autenticación, autorización, auditoría multiusuario ni aislamiento entre usuarios.

## Preparación necesaria para Supabase

1. Diseñar tablas para prospectos, fuentes de contacto, búsquedas, propuestas, conversaciones, mensajes, seguimientos, actividades y transiciones de estado.
2. Separar contactos y sus fuentes en registros normalizados con restricciones que impidan contactos sin procedencia.
3. Crear claves foráneas, índices de filtros, restricciones de unicidad y timestamps gestionados por base de datos.
4. Definir migraciones versionadas, datos semilla de desarrollo y estrategia de respaldo.
5. Implementar adaptadores Supabase que satisfagan los contratos actuales de repositorio.
6. Sustituir mutaciones separadas por transacciones para sincronizar conversación, seguimiento y estado comercial.
7. Definir políticas RLS antes de introducir autenticación y evitar asumir multitenencia prematuramente.
8. Añadir paginación, consultas agregadas y manejo tipado de errores de persistencia.

## Preparación necesaria para APIs externas

1. Mantener cada proveedor detrás de una interfaz propia, del mismo modo que `ConversationIntelligence`.
2. Ejecutar integraciones y secretos exclusivamente del lado servidor.
3. Validar respuestas externas con Zod y conservar procedencia, timestamp y evidencia.
4. Incorporar límites, timeouts, cancelación, reintentos con backoff y observabilidad.
5. Evitar que OpenAI genere o complete datos de contacto; solo debe trabajar con evidencia proporcionada.
6. Usar salidas estructuradas para análisis, resúmenes y propuestas, siempre editables y revisables.
7. Restringir Gmail a creación de borradores y WhatsApp a enlaces click-to-chat con acción manual.
8. Añadir estados de conexión, permisos, revocación y errores recuperables antes de habilitar proveedores.
9. Evaluar Trigger.dev y Playwright únicamente durante las fases previstas, con políticas de uso y concurrencia.

## Siguiente paso recomendado

Cerrar formalmente la Fase 1 con una revisión manual de producto y pruebas end-to-end de los cuatro flujos críticos: búsqueda simulada, alta y filtrado de prospectos, creación de propuesta y seguimiento en Bandeja. Después, diseñar el esquema relacional y los contratos transaccionales de Supabase antes de escribir migraciones. Esta revisión no inicia la Fase 2.
