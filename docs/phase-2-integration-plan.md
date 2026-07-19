# Plan de integración de la Fase 2

## Propósito

Reemplazar progresivamente los adaptadores simulados de Prospector AI por persistencia y servicios reales sin cambiar los contratos de dominio ni acoplar la interfaz a proveedores. Este documento es una auditoría y un plan: en este cambio no se instala ni se invoca ningún servicio externo.

## Línea base

- Next.js App Router entrega las lecturas iniciales desde Server Components.
- Los componentes reciben datos serializables mediante props.
- Los repositorios tienen contratos asíncronos, pero sus adaptadores actuales conservan arreglos mutables en memoria.
- Los fixtures viven exclusivamente en `src/lib/mock-data` y no son importados por componentes de producción.
- Zod define las fronteras de validación y TypeScript infiere los tipos de dominio.
- No existen todavía autenticación, base de datos, colas ni clientes de APIs externas.

## Mapa de repositorios y dependencias

| Contrato actual          | Fuente simulada                       | Lecturas principales                                        | Mutaciones actuales                                | Reemplazo previsto                                                                        |
| ------------------------ | ------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `ProspectRepository`     | `mockProspects`                       | Inicio, Prospectos, Propuestas y enriquecimiento de Bandeja | Alta manual y cambio de estado comercial           | `SupabaseProspectRepository`                                                              |
| `SearchRepository`       | `mockSearches`                        | Búsquedas y métricas de Inicio                              | Crear y completar búsqueda                         | `SupabaseSearchRepository` más trabajo de descubrimiento                                  |
| `ProposalRepository`     | `mockProposals`                       | Propuestas, Bandeja y métricas de Inicio                    | Crear borrador y cambiar estado                    | `SupabaseProposalRepository`                                                              |
| `ConversationRepository` | `mockConversations`                   | Bandeja y métricas de Inicio                                | Borrador, respuesta simulada, seguimiento y estado | `SupabaseConversationRepository` más adaptador Gmail limitado a borradores/sincronización |
| `ActivityRepository`     | `mockActivities`                      | Inicio y Búsquedas                                          | Ninguna                                            | `SupabaseActivityRepository` append-only                                                  |
| Funciones de dashboard   | Composición de los cinco repositorios | Inicio                                                      | Ninguna                                            | Consultas agregadas o vistas SQL sin cambiar el modelo presentado a la UI                 |

Dependencias internas actuales:

```text
Rutas App Router
  ├─ componentes de interfaz
  └─ repositorios
       ├─ tipos y reglas de dominio
       ├─ esquemas Zod
       └─ fixtures simulados
```

La dependencia futura debe conservar la dirección `UI → casos de uso/acciones → contratos → adaptadores`. Los SDK de Supabase, Google, OpenAI y Trigger.dev no deben importarse desde componentes.

## Acceso actual desde componentes

Las páginas `app/page.tsx`, `busquedas/page.tsx`, `prospectos/page.tsx`, `propuestas/page.tsx` y `bandeja/page.tsx` consultan repositorios en el servidor y pasan el resultado como props. `configuracion/page.tsx` no usa datos.

Existen cuatro accesos directos desde componentes cliente que deben migrarse a casos de uso o Server Actions antes de conectar persistencia real:

- `SearchesView`: crea y completa búsquedas.
- `ProspectsView`: crea prospectos manuales.
- `ProposalsView`: crea propuestas y cambia su estado.
- `InboxView`: guarda respuestas, registra envíos simulados, programa seguimientos y cambia estados de conversaciones y prospectos.

Estos accesos son aceptables para el prototipo en memoria, pero no deben recibir credenciales ni SDK de servidor.

## Operaciones candidatas a Server Actions

- Crear una búsqueda y solicitar su procesamiento.
- Crear o editar un prospecto con validación de procedencia del contacto.
- Crear, editar y cambiar el estado de una propuesta.
- Guardar una respuesta sugerida o borrador local.
- Crear un borrador de Gmail solamente después de una confirmación humana.
- Programar o cancelar un seguimiento.
- Cambiar estados comerciales y registrar la actividad asociada en una transacción.
- Conectar o revocar una cuenta de Google mediante un flujo OAuth protegido.

Cada acción debe validar entrada con Zod, resolver al usuario en el servidor, autorizar el recurso, usar un caso de uso y devolver errores serializables en español. La UI no debe confiar en identificadores o estados enviados por el cliente.

## Operaciones en segundo plano

- Consultar Google Places por lotes, respetando paginación, cuotas y procedencia.
- Analizar sitios web con límites de tiempo, reintentos acotados y aislamiento por dominio.
- Calcular puntuaciones y generar auditorías o contenido asistido por IA.
- Procesar lotes de prospectos sin bloquear una solicitud web.
- Sincronizar metadatos de Gmail o procesar notificaciones autenticadas cuando esa fase sea aprobada.
- Recalcular agregados derivados si las consultas directas dejan de ser suficientes.

Cada trabajo usará una clave de idempotencia estable, registrará solo metadatos no sensibles, expondrá estado y error recuperable, y podrá reintentarse sin duplicar prospectos, actividades, propuestas ni borradores.

No se delegan a segundo plano la exportación CSV local, los filtros visuales, la edición de texto ni la apertura manual de enlaces click-to-chat.

## Autenticación y autorización necesarias

Cuando se active persistencia real, las rutas `/`, `/busquedas`, `/prospectos`, `/propuestas`, `/bandeja` y `/configuracion` deben exigir una sesión. Aunque el usuario inicial sea único, las consultas deben quedar limitadas por propietario y preparadas para RLS.

Las futuras rutas de inicio de sesión y callback OAuth serán públicas solo en el punto necesario; el callback debe validar `state` y PKCE. Los endpoints de Trigger.dev o webhooks deben verificar firma y no depender de una sesión de navegador. Las páginas de error, not-found y recursos estáticos no requieren autenticación.

## Métricas que dependen de arreglos locales

- Inicio: totales, oportunidades prioritarias, propuestas listas, respuestas, búsquedas completadas, promedio de puntaje, embudo y recomendaciones del día.
- Búsquedas: totales, resultados, oportunidades, filtros e historial reciente.
- Prospectos: total, alta prioridad, contactables, sin contactar, segmentos y distribución por estado.
- Propuestas: creadas, listas, aceptadas, valor estimado y flujo por estado.
- Bandeja: contadores por filtro, acciones pendientes y estado de conversaciones.

Las vistas calculan parte de estas cifras desde props y las funciones de dashboard recorren colecciones completas. Con Supabase deben trasladarse a consultas agregadas, manteniendo las mismas definiciones y pruebas de contrato para evitar diferencias numéricas.

## Separación evaluada

- **Tipos de dominio:** clara en `src/lib/domain` y respaldada por esquemas en `src/lib/validation`.
- **Repositorios:** clara por contrato, aunque contrato y adaptador simulado comparten hoy cada archivo. Antes de Supabase se separarán en interfaces y adaptadores nombrados.
- **Servicios externos:** todavía no existen. Se crearán bajo `src/lib/services` con interfaces propias y módulos `server-only` cuando corresponda.
- **Interfaz:** separada en rutas, componentes de módulo y componentes reutilizables. Las cuatro mutaciones cliente se migrarán antes de usar adaptadores reales.

La separación es suficiente para iniciar la migración, pero no está completa hasta introducir composición de dependencias y casos de uso en servidor.

## Secuencia recomendada

1. Definir interfaces independientes, errores de aplicación y una factoría de repositorios; conservar el adaptador simulado.
2. Incorporar autenticación y esquema Supabase con RLS, migraciones y pruebas de políticas.
3. Implementar adaptadores Supabase y migrar primero lecturas, luego mutaciones mediante Server Actions.
4. Añadir Trigger.dev y el proveedor de descubrimiento con idempotencia y trazabilidad.
5. Incorporar analizador web y OpenAI detrás de interfaces, con revisión humana.
6. Integrar Google OAuth y creación de borradores de Gmail; mantener el envío fuera de la aplicación.
7. Añadir observabilidad segura, pruebas de integración y E2E antes del despliegue.

## Archivos y áreas que cambiarán

- `src/lib/repositories/*`: separar contratos y adaptadores; añadir implementaciones Supabase.
- `src/lib/domain/*` y `src/lib/validation/*`: extender procedencia, auditoría e identificadores de idempotencia.
- `src/app/*/page.tsx`: resolver sesión y dependencias reales.
- `src/app/actions/*` o acciones colocadas por módulo: mutaciones autorizadas.
- `src/components/searches/searches-view.tsx`, `prospects/prospects-view.tsx`, `proposals/proposals-view.tsx` e `inbox/inbox-view.tsx`: sustituir llamadas directas por acciones.
- `src/lib/services/*`: contratos y adaptadores externos nuevos.
- `src/trigger/*`: trabajos en segundo plano e idempotencia.
- `middleware` o equivalente recomendado por la versión de Next.js: protección de rutas.
- `supabase/migrations/*`: esquema, índices, RLS y funciones de base de datos.
- `src/app/configuracion/*`: conexión y revocación de integraciones.
- Pruebas de repositorios, acciones, políticas, trabajos y flujos E2E.

## Estado tras la incorporación de Supabase

Supabase Auth, el esquema PostgreSQL, RLS, migraciones y utilidades SSR están implementados. Los repositorios simulados permanecen activos y todavía no se conectan Google Places, Trigger.dev, OpenAI, Gmail ni WhatsApp.
