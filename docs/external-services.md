# Servicios externos

## Principio de integración

Toda integración se implementa como un adaptador reemplazable detrás de una interfaz controlada por la aplicación. Los tipos del SDK no atraviesan esa frontera y los componentes no conocen proveedores. Supabase Auth, la infraestructura SSR y los repositorios persistentes ya están conectados; los demás proveedores siguen pendientes.

## Catálogo previsto

| Servicio           | Uso permitido                                                        | Interfaz propuesta                       | Ejecución                                                          | Variables                                                                                       |
| ------------------ | -------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| Supabase           | PostgreSQL, autenticación y RLS                                      | Contratos de repositorio y `AuthService` | Servidor; cliente publicable solo para sesión cuando sea necesario | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| Google Places      | Descubrir negocios mediante API oficial                              | `BusinessDiscoveryService`               | Trabajo en servidor                                                | `GOOGLE_PLACES_API_KEY`                                                                         |
| Trigger.dev        | Orquestar trabajos duraderos y reintentos                            | `JobDispatcher`                          | Servidor/trabajador                                                | `TRIGGER_SECRET_KEY`, `TRIGGER_PROJECT_REF`                                                     |
| OpenAI             | Analizar evidencia y redactar borradores revisables                  | `ProspectIntelligenceProvider`           | Servidor; Responses API con salida estructurada                    | `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_DAILY_ANALYSIS_LIMIT`                                 |
| Google OAuth/Gmail | Conectar una cuenta y crear borradores; nunca enviar automáticamente | `MailDraftService` y `GoogleTokenStore`  | Servidor                                                           | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_OAUTH_REDIRECT_URI`, `TOKEN_ENCRYPTION_KEY` |
| WhatsApp           | Abrir enlaces click-to-chat para envío manual                        | `WhatsAppLinkBuilder` local              | Navegador, sin token ni automatización                             | Ninguna                                                                                         |

`NEXT_PUBLIC_APP_URL` define el origen canónico de la aplicación y `APP_OWNER_EMAIL` puede limitar el acceso inicial, pero no reemplaza una comprobación de sesión ni RLS.

## Contratos esperados

### `BusinessDiscoveryService`

Recibe nicho, ubicación, límite y cursor; devuelve negocios normalizados, identificador estable del proveedor y URL de origen. No obtiene contactos por inferencia ni realiza scraping de Google Maps.

### `ProspectAnalysisService`

Recibe evidencia ya recolectada y devuelve una salida estructurada validada con Zod: resumen, oportunidades, señales y versión del criterio. No modifica contactos ni publica resultados sin persistir su procedencia.

### `ProposalContentService`

Produce un borrador editable basado en un prospecto y una plantilla. Conserva la entrada mínima necesaria y nunca inicia una comunicación.

### `MailDraftService`

Crea o actualiza un borrador de Gmail tras una confirmación humana. Acepta una clave de idempotencia y devuelve solo metadatos necesarios. La interfaz no incluye una operación de envío automático.

### `JobDispatcher`

Encola una operación tipada con identificador de propietario, recurso e idempotencia. No recibe secretos en el payload y permite consultar un estado saneado.

## Política común de adaptadores

- Validar configuración al arrancar el código de servidor, nunca durante el render cliente.
- Aplicar timeouts, cancelación y reintentos solo a errores recuperables.
- Respetar cuotas y `Retry-After`; limitar concurrencia por proveedor.
- Convertir errores del SDK a errores propios sin datos sensibles.
- Validar con Zod toda respuesta externa antes de entrar al dominio.
- Registrar métricas operativas saneadas y un identificador de correlación.
- Usar claves de idempotencia y restricciones únicas para operaciones con efectos.
- Proporcionar adaptadores falsos o simulados para pruebas; no llamar servicios reales desde tests unitarios.
- Mantener una acción humana explícita antes de crear borradores o abrir una comunicación.

## Estrategia de fallos

- Un fallo de proveedor no elimina ni invalida los datos ya verificados.
- La UI muestra estado pendiente, error recuperable y acción de reintento en español.
- Los resultados parciales se distinguen de los completos.
- Tras agotar reintentos, el trabajo queda visible para revisión manual; no avanza silenciosamente el estado comercial.
- La indisponibilidad de IA permite continuar con edición manual.
- La indisponibilidad de Gmail mantiene la propuesta y respuesta local sin fingir que existe un borrador remoto.

## Orden de incorporación

1. Supabase, autenticación, RLS y adaptadores de repositorio (completado).
2. Trigger.dev y Google Places para descubrimiento controlado (completado).
3. Analizador de páginas y OpenAI para resultados revisables.
4. Google OAuth y Gmail para crear borradores.
5. Enlaces manuales de WhatsApp con contactos previamente verificados.

Cada paso conserva el adaptador simulado hasta superar pruebas de contrato, integración y regresión visual.

## Estado de Trigger.dev

Trigger.dev ejecuta el descubrimiento y prepara los análisis en segundo plano. Usa claves idempotentes, colas con concurrencia limitada, reintentos selectivos y progreso persistido. Playwright, OpenAI, Gmail y WhatsApp permanecen sin integrar.

## Exclusiones permanentes o actuales

- No scraping de Google Maps.
- No envío automático de correo.
- No automatización de WhatsApp Web.
- No generación o inferencia de datos de contacto.
- No exposición de SDK privilegiados o secretos al navegador.

Supabase y Google Places API (New) son las integraciones activas. Las pantallas internas leen y modifican PostgreSQL; los datos simulados quedan reservados para pruebas.

## Estado de Google Places

Google Places API (New) está activa exclusivamente mediante Text Search. Utiliza clave de servidor, FieldMask limitado, timeout y reintentos acotados para 429 y 5xx. No se usa scraping, Place Details, fotografías ni reseñas completas. Trigger.dev y Playwright están activos; OpenAI, Gmail y WhatsApp permanecen sin integrar.

### Caché, atribución y retención de Places

- `place_discovery_cache` conserva temporalmente la respuesta normalizada durante 24 horas y nunca actúa como archivo histórico del proveedor.
- Cada entrada mantiene `google_place_id`, búsqueda, propietario, fuente y caducidad explícita.
- Las tareas eliminan entradas vencidas antes de escribir y existe una función RLS para limpieza manual por propietario.
- Solo pasan a `prospects` los campos del modelo permitidos por el flujo de descubrimiento; los contactos mantienen su fuente atribuible.
- La interfaz debe conservar los enlaces atribuibles de Google cuando muestre información procedente de Places y respetar en todo momento las condiciones vigentes del proveedor.
