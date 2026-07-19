# Supabase: desarrollo y despliegue

## Requisitos

- Node.js 20 o posterior.
- pnpm mediante Corepack.
- Docker Desktop o un runtime compatible activo.
- Supabase CLI, instalado como dependencia de desarrollo y fijado en `package.json`.

La pila local no es apta para producción y no debe exponerse a Internet.

## Inicio local

```bash
pnpm install
pnpm supabase:start
pnpm supabase:reset
pnpm supabase:types
```

`supabase start` muestra la URL y las claves locales. Copia solamente la URL y clave publicable a `.env.local`, junto con `NEXT_PUBLIC_APP_URL=http://localhost:3000`. Configura `APP_OWNER_EMAIL` con el correo exacto del propietario y `DATA_PROVIDER=supabase`.

El seed crea datos ficticios y un usuario Auth sin contraseña. No contiene secretos ni permite iniciar sesión. Para probar Auth, abre Studio en `http://127.0.0.1:54323`, crea o actualiza el usuario propietario con una contraseña y usa el mismo correo en `APP_OWNER_EMAIL`.

Mailpit captura localmente los correos de recuperación en `http://127.0.0.1:54324`; no los envía a Internet.

## Flujo de cambios

1. Crea una migración con `pnpm supabase migration new nombre_del_cambio`.
2. Edita y revisa el SQL versionado.
3. Ejecuta `pnpm supabase:reset` para reproducir toda la base desde cero.
4. Ejecuta `pnpm supabase:test` y `pnpm supabase:lint`.
5. Regenera tipos con `pnpm supabase:types` y revisa el diff.
6. Ejecuta `pnpm validate` y `pnpm build`.

## Importar datos demo

La importación nunca se ejecuta durante migraciones ni despliegues. Puede iniciarse explícitamente desde Configuración o mediante:

```bash
pnpm demo:import
```

El comando solicita las credenciales del propietario sin almacenarlas y llama la RPC con su sesión autenticada. La operación es idempotente por `google_place_id`.

No edites `src/types/database.types.ts` como sustituto permanente de la regeneración. El archivo versionado debe coincidir con el resultado de la CLI.

## Proyecto remoto

Para un proyecto nuevo y vacío:

```bash
pnpm supabase login
pnpm supabase link --project-ref <project-ref>
pnpm supabase db push --dry-run
pnpm supabase db push
pnpm supabase gen types typescript --linked > src/types/database.types.ts
```

Si el proyecto remoto ya tiene cambios, ejecuta primero `pnpm supabase db pull` y revisa la migración obtenida. Nunca ejecutes `db reset --linked` contra producción ni uses `--include-seed` en producción.

En el panel remoto:

- deshabilita el registro público;
- crea manualmente el usuario cuyo correo coincide con `APP_OWNER_EMAIL`;
- configura las URL exactas de la aplicación y `/auth/confirm`;
- configura SMTP antes de depender de recuperación de contraseña en producción;
- verifica RLS y aplica migraciones antes de introducir datos reales.

## Seguridad

- La clave publicable puede estar en el navegador; la service role no.
- `SUPABASE_SERVICE_ROLE_KEY` solo puede usarse desde módulos `server-only` y no se utiliza todavía.
- El Proxy renueva sesión, pero cada ruta interna vuelve a verificar el usuario en servidor.
- RLS restringe los registros mediante `owner_id = auth.uid()`.
- Triggers sobrescriben `owner_id` con la identidad autenticada y las claves foráneas compuestas impiden relaciones entre propietarios.
- Los tokens cifrados de integraciones no tienen permisos de lectura para `authenticated`.

## Verificación de base de datos

`supabase/tests/database/schema.test.sql` comprueba aislamiento RLS, relaciones entre propietarios, restricciones únicas y eliminaciones en cascada. Estas pruebas requieren la pila local activa.

Si Docker no está disponible, las validaciones de JavaScript y el build pueden ejecutarse, pero `supabase:reset`, `supabase:test`, `supabase:lint` y la regeneración local de tipos quedan pendientes; no deben reportarse como aprobadas.
