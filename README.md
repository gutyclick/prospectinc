# Prospector AI

Aplicación web en español para descubrir negocios con oportunidades de mejora digital, analizar evidencia pública y gestionar el seguimiento comercial con control humano.

El prototipo conserva sus repositorios simulados mientras incorpora autenticación y una base PostgreSQL versionada con Supabase.

## Requisitos

- Node.js 20.9 o superior.
- pnpm 11.15.0. Si pnpm no está instalado globalmente, puede ejecutarse mediante Corepack.
- Docker Desktop o un runtime compatible para ejecutar Supabase localmente.

```bash
corepack enable
corepack prepare pnpm@11.15.0 --activate
```

## Instalación

```bash
pnpm install
Copy-Item .env.example .env.local
pnpm supabase:start
pnpm dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

## Comandos

```bash
pnpm dev          # Servidor de desarrollo
pnpm lint         # Análisis estático con ESLint
pnpm typecheck    # Comprobación estricta de TypeScript
pnpm test         # Pruebas con Vitest y React Testing Library
pnpm test:watch   # Pruebas en modo interactivo
pnpm format       # Aplicar formato con Prettier
pnpm format:check # Comprobar formato sin modificar archivos
pnpm validate     # Lint, typecheck y pruebas
pnpm build        # Build de producción
pnpm supabase:start   # Iniciar Supabase local
pnpm supabase:stop    # Detener Supabase local
pnpm supabase:reset   # Recrear DB, migraciones y seed local
pnpm supabase:migrate # Aplicar migraciones locales pendientes
pnpm supabase:test    # Ejecutar pruebas pgTAP
pnpm supabase:lint    # Revisar funciones y esquema PostgreSQL
pnpm supabase:types   # Regenerar tipos TypeScript desde la DB local
pnpm demo:import      # Importar datos demo tras autenticar al propietario
pnpm trigger:dev      # Ejecutar tareas Trigger.dev en desarrollo
pnpm trigger:deploy   # Desplegar tareas al proyecto configurado
```

## Estructura

- `src/app`: rutas y layouts de Next.js.
- `src/components`: componentes por módulo y componentes base de shadcn/ui.
- `src/lib`: dominio, datos simulados, repositorios, validación y utilidades.
- `src/lib/supabase`: clientes SSR separados para navegador, servidor y Proxy.
- `src/lib/auth`: autorización y casos de uso de autenticación.
- `src/hooks`: hooks reutilizables.
- `src/types`: tipos transversales.
- `supabase`: configuración local, migraciones, seed y pruebas de base de datos.
- `docs`: especificación, arquitectura, interfaz y roadmap.

## Variables de entorno

Para autenticación local configura al menos:

```dotenv
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<clave publicable mostrada por supabase status>
APP_OWNER_EMAIL=<correo exacto del usuario creado en Auth>
DATA_PROVIDER=supabase
GOOGLE_PLACES_API_KEY=<clave restringida a Places API (New)>
TRIGGER_SECRET_KEY=<clave secreta del entorno de Trigger.dev>
TRIGGER_PROJECT_REF=<referencia proj_... del proyecto Trigger.dev>
WEBSITE_ANALYSIS_TIMEOUT_MS=60000
```

No uses `SUPABASE_SERVICE_ROLE_KEY` en el navegador. La aplicación valida `APP_OWNER_EMAIL` en Proxy, en las rutas protegidas y durante el inicio de sesión.

`GOOGLE_PLACES_API_KEY` también es exclusivamente de servidor. Restringe esa clave en Google Cloud a Places API (New) y a los entornos autorizados.

Configura `TRIGGER_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `APP_OWNER_EMAIL` y `GOOGLE_PLACES_API_KEY` también en el entorno correspondiente de Trigger.dev. Nunca los envíes desde el navegador. `trigger.config.ts` toma la referencia desde `TRIGGER_PROJECT_REF`.

Consulta [docs/supabase.md](docs/supabase.md) para preparar el entorno, crear el propietario y vincular un proyecto remoto.
