# Prospector AI

Aplicación web en español para descubrir negocios con oportunidades de mejora digital, analizar evidencia pública y gestionar el seguimiento comercial con control humano.

Esta etapa contiene únicamente la base técnica. El dashboard y los módulos funcionales se construirán en fases posteriores.

## Requisitos

- Node.js 20.9 o superior.
- pnpm 11.15.0. Si pnpm no está instalado globalmente, puede ejecutarse mediante Corepack.

```bash
corepack enable
corepack prepare pnpm@11.15.0 --activate
```

## Instalación

```bash
pnpm install
Copy-Item .env.example .env.local
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
```

## Estructura

- `src/app`: rutas y layouts de Next.js.
- `src/components`: componentes por módulo y componentes base de shadcn/ui.
- `src/lib`: dominio, datos simulados, repositorios, validación y utilidades.
- `src/hooks`: hooks reutilizables.
- `src/types`: tipos transversales.
- `docs`: especificación, arquitectura, interfaz y roadmap.

## Variables de entorno

`.env.example` documentará las variables necesarias conforme se incorporen integraciones. La fase actual no requiere secretos ni servicios externos.
