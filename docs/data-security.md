# Seguridad y tratamiento de datos

## Alcance

Estas reglas gobiernan la persistencia, autenticación y futura incorporación de descubrimiento, IA y mensajería. Supabase Auth y el esquema versionado ya están incorporados; los módulos funcionales continúan usando repositorios simulados.

## Clasificación de configuración

Variables que pueden estar disponibles en el navegador:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Variables exclusivamente de servidor:

- `SUPABASE_SERVICE_ROLE_KEY`
- `APP_OWNER_EMAIL`
- `GOOGLE_PLACES_API_KEY`
- `TRIGGER_SECRET_KEY`
- `TRIGGER_PROJECT_REF`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_OAUTH_REDIRECT_URI`
- `TOKEN_ENCRYPTION_KEY`

Ningún secreto puede llevar el prefijo `NEXT_PUBLIC_`. `.env.example` contiene nombres vacíos; los valores reales no se almacenan en Git.

## Frontera de servidor

- Todo módulo que use la clave de servicio de Supabase o credenciales de proveedores debe importar `server-only`.
- Los componentes cliente nunca importan SDK, configuración ni adaptadores privilegiados.
- La clave de servicio no se usa en flujos normales si una sesión con RLS puede realizar la operación.
- Server Actions, callbacks y trabajos vuelven a validar entrada, sesión, propiedad y estado del recurso.
- Los errores presentados al cliente no exponen trazas, consultas, identificadores internos del proveedor ni configuración.

## Contactos y procedencia

- Solo se almacenan contactos empresariales publicados públicamente.
- No se inventan, completan ni infieren correos, teléfonos, WhatsApp o nombres.
- Cada valor de contacto conserva la URL exacta de origen, el tipo de fuente y, cuando haya persistencia, la fecha de obtención.
- Una validación rechaza cualquier contacto sin procedencia; las importaciones mantienen esta misma regla.
- La IA no es fuente de contactos y nunca puede sobrescribir evidencia obtenida de una fuente pública.
- Se debe poder corregir, descartar o eliminar un contacto sin destruir el historial comercial no sensible que legalmente corresponda conservar.

## Autenticación y autorización

- Todas las tablas de datos de usuario habilitan RLS antes de recibir datos reales.
- Cada registro pertenece a un usuario; el correo de propietario configurado no sustituye las políticas de base de datos.
- OAuth usa `state`, PKCE, redirecciones permitidas exactas y permisos mínimos.
- Los tokens de acceso y renovación se guardan cifrados con una clave administrada fuera de la base de datos.
- La revocación elimina o invalida tokens y deja una actividad de auditoría sin incluir el token.
- Trabajos y webhooks validan firmas y aplican autorización por proyecto o entorno.

## Registro y observabilidad

No se registran:

- claves, secretos, cookies o encabezados de autorización;
- tokens OAuth o enlaces que los contengan;
- cuerpos completos de correos, respuestas sugeridas o mensajes;
- teléfonos, correos o WhatsApp completos;
- cargas completas enviadas a proveedores de IA.

Los logs pueden incluir identificadores internos no adivinables, proveedor, operación, duración, código de resultado, número de elementos y una categoría de error saneada. Debe existir redacción central y pruebas para impedir filtraciones.

## Comunicaciones

- Gmail se limita a crear borradores después de una acción humana explícita.
- La aplicación no envía correos automáticamente.
- WhatsApp se limita a enlaces click-to-chat; no se automatiza WhatsApp Web.
- Marcar algo como enviado solo puede reflejar una confirmación del usuario o evidencia de una integración aprobada, nunca fingir un envío.

## Idempotencia e integridad

- Cada trabajo recibe una clave de idempotencia derivada de la operación y el recurso, no de datos sensibles.
- Los eventos externos conservan el identificador del proveedor y se procesan una sola vez.
- Las escrituras relacionadas usan transacciones o restricciones únicas cuando corresponda.
- Los reintentos no duplican prospectos, contactos, actividades, propuestas, mensajes ni borradores.
- Los estados terminales y las transiciones sensibles se validan en servidor.

## Retención, respaldo y entornos

- Producción, vista previa y desarrollo usan proyectos, claves y callbacks separados.
- Los datos reales no se copian a fixtures ni a pruebas locales.
- Los respaldos y exportaciones mantienen cifrado y control de acceso.
- Antes de producción se definirán periodos de retención, proceso de eliminación y respuesta ante incidentes.
- La rotación de `TOKEN_ENCRYPTION_KEY` requiere versionado de cifrado y una migración segura; nunca se sustituye sin plan de recifrado.

## Ejecución segura en Trigger.dev

- Los secretos se configuran directamente por entorno en Trigger.dev y nunca forman parte del payload.
- `SUPABASE_SERVICE_ROLE_KEY` solo se importa desde módulos `server-only` ejecutados en tareas autorizadas.
- Cada tarea vuelve a verificar el propietario contra `APP_OWNER_EMAIL` antes de leer o escribir datos.
- El navegador recibe únicamente un token público limitado a observar una ejecución concreta.
- Los logs estructurados contienen identificadores internos, etapas y contadores; excluyen claves, contactos y respuestas completas de proveedores.

## Navegación web y SSRF

- El analizador acepta únicamente HTTP y HTTPS, elimina credenciales y fragmentos y limita redirecciones.
- Antes de cada navegación se resuelve DNS y se bloquean localhost, metadatos de infraestructura y rangos privados, reservados, loopback, link-local y multicast.
- Chromium intercepta todas las solicitudes, bloquea protocolos no web, descargas, fuentes y medios, y ejecuta sin extensiones.
- Fetch limita HTML a 2 MB; la tarea limita el tiempo total y siempre cierra página, contexto y navegador.
- La exploración se limita al sitio inicial, enlaces internos muestreados y páginas de contacto relevantes.
- Las capturas se guardan en el bucket privado `website-audits`, separado por propietario.

## Riesgos prioritarios

1. Exponer una credencial privilegiada por una importación cliente accidental.
2. Romper el aislamiento de propietario al migrar consultas sin RLS.
3. Perder procedencia al normalizar o deduplicar contactos.
4. Duplicar datos o borradores durante reintentos de trabajos.
5. Registrar contenido sensible en errores de proveedores.
6. Confundir una simulación de envío con una comunicación real.
7. Conservar tokens OAuth sin cifrado o pedir permisos más amplios de lo necesario.

Estas amenazas deben tener pruebas y controles antes de habilitar datos reales.
