# Arquitectura de Prospector AI

## Principios

- Monolito modular en una sola aplicación Next.js.
- Límites claros entre interfaz, lógica de dominio y acceso a datos.
- Server Components por defecto y Client Components solo para interacción.
- Datos simulados detrás de contratos tipados que puedan reemplazarse gradualmente.
- Validación en las fronteras cuando se incorporen entradas o servicios externos.
- Control humano como requisito de arquitectura para cualquier acción de contacto.

## Arquitectura objetivo inicial

La primera fase será una aplicación Next.js con App Router y TypeScript estricto. No tendrá backend externo, autenticación ni base de datos. Los repositorios simulados expondrán datos y operaciones con interfaces estables para evitar que las pantallas dependan directamente de archivos de fixtures.

Flujo conceptual:

```text
Rutas y layouts
      ↓
Componentes de módulo y UI compartida
      ↓
Casos de uso / lógica de dominio
      ↓
Contratos de repositorio
      ↓
Adaptadores simulados (Fase 1)
```

En fases posteriores, los adaptadores simulados podrán reemplazarse por Supabase y servicios externos sin reescribir la lógica visual ni el dominio.

## Organización prevista

```text
src/
  app/                Rutas, layouts y composición de páginas
  components/
    layout/           Estructura global y navegación
    ui/               Componentes base de shadcn/ui
    dashboard/        Inicio
    searches/         Búsquedas
    prospects/        Prospectos
    proposals/        Propuestas
    inbox/            Bandeja
  lib/
    domain/           Reglas y modelos de dominio
    mock-data/        Fixtures explícitamente ficticios
    repositories/     Contratos y adaptadores de datos
    validation/       Esquemas de validación
    utils/            Utilidades compartidas
  hooks/              Hooks reutilizables
  types/              Tipos transversales
docs/                 Decisiones y documentación del producto
```

Esta estructura es una guía para la fase de implementación, no una obligación de crear carpetas vacías. Los tipos, componentes y lógica específicos deben permanecer cerca de su módulo.

## Herramientas de desarrollo

- pnpm administra dependencias y ejecuta los scripts del proyecto.
- ESLint aplica las reglas recomendadas de Next.js y TypeScript.
- Prettier mantiene un formato uniforme, incluido el orden de utilidades de Tailwind CSS.
- Vitest y React Testing Library cubren lógica y componentes desde la perspectiva del usuario.
- La configuración de pruebas usa jsdom y el alias `@/*`, igual que la aplicación.

## Modelo de dominio inicial

Entidades principales previstas:

- `Prospecto`: negocio, ubicación, nicho, presencia digital, puntuación, estado y seguimiento.
- `Fuente`: URL, tipo, fecha de consulta y contexto de la evidencia.
- `ContactoEmpresarial`: correo, teléfono o WhatsApp vinculado obligatoriamente a una fuente.
- `Busqueda`: nicho, ubicación, filtros y resultados.
- `Auditoria`: hallazgos, oportunidades y recomendaciones editables.
- `Propuesta`: contenido, estado de preparación y relación con un prospecto.
- `Interaccion`: canal, dirección, fecha, resumen y resultado.
- `TareaSeguimiento`: vencimiento, prioridad, estado y prospecto relacionado.

Los estados comerciales se definirán como una unión literal o enum tipado basado en la especificación de producto.

El modelo implementado usa los nombres técnicos `Prospect`, `Search`, `Proposal`, `Conversation` y `Activity`. Sus tipos se infieren desde esquemas Zod para mantener una sola definición entre validación y TypeScript. Las fechas cruzan la capa de datos como cadenas ISO serializables y las relaciones usan identificadores estables como `prospectId`.

Los estados de sitio web, proceso comercial, búsqueda, propuesta y conversación son uniones literales cerradas. El esquema de `Prospect` exige una URL de origen cuando existe cualquier contacto público y limita el puntaje de oportunidad al intervalo de 0 a 100.

## Datos simulados

- Deben ser explícitamente ficticios y coherentes entre módulos.
- Los contactos simulados conservarán siempre una URL de fuente simulada.
- Los fixtures no se importarán directamente desde componentes de presentación; se accederá mediante funciones o repositorios simulados.
- No se representará una integración externa como si estuviera activa.
- Los cambios del usuario podrán mantenerse en memoria o almacenamiento local si el prototipo lo requiere, con una capa que permita reemplazar esa persistencia.

La capa actual expone `prospectRepository`, `searchRepository`, `proposalRepository`, `conversationRepository` y `activityRepository` mediante contratos asíncronos. Las métricas del dashboard se calculan componiendo esos repositorios, sin leer fixtures desde las páginas ni duplicar datos relacionados.

## Estado y obtención de datos

- Preferir parámetros de ruta y búsqueda para estado navegable.
- Usar estado local para interacciones acotadas.
- Usar React Context solo para estado compartido estable y realmente transversal.
- No usar Redux.
- Mantener el estado del servidor separado del estado puramente visual cuando se incorporen servicios remotos.

## Integraciones futuras

- **Supabase/PostgreSQL:** persistencia, consultas y eventualmente autenticación, únicamente en su fase.
- **Motor de descubrimiento:** proveedores permitidos y trazables; queda prohibido el scraping de Google Maps.
- **Analizador de páginas:** navegación controlada con Playwright y tareas con Trigger.dev cuando corresponda.
- **OpenAI API:** asistencia para análisis y redacción con salidas revisables, nunca como fuente de contactos.
- **Gmail API:** creación de borradores; el envío seguirá bajo control humano.
- **WhatsApp:** enlaces click-to-chat; el usuario enviará manualmente.

Cada integración se implementará como adaptador detrás de una interfaz propia, con configuración y errores aislados del dominio.

## Seguridad y privacidad

- Solo almacenar contactos empresariales publicados públicamente y su URL de origen.
- No inventar, inferir ni completar datos de contacto sin evidencia.
- No registrar secretos en el repositorio ni exponerlos al cliente.
- Aplicar mínimo privilegio a futuras integraciones.
- Mantener trazabilidad de análisis, cambios de estado y acciones de contacto.
- Exigir una acción humana inequívoca antes de crear o abrir cualquier comunicación externa.

## Rendimiento y accesibilidad

- Minimizar JavaScript enviado al cliente.
- Usar carga progresiva y límites claros para listas grandes.
- Evitar solicitudes duplicadas y optimizaciones prematuras.
- Considerar accesibilidad como requisito funcional: semántica, teclado, foco, contraste, anuncios de cambios y reducción de movimiento.

## Evolución de arquitectura

Las decisiones estructurales relevantes se documentarán aquí o mediante registros de decisión si crece su complejidad. Cualquier cambio en límites de módulos, persistencia, integraciones o estrategia de estado exige actualizar esta documentación en el mismo cambio.
