# AGENTS.md

## Propósito

Este repositorio contiene Prospector AI, una aplicación web en español para descubrir, analizar y gestionar oportunidades comerciales de negocios con presencia digital deficiente. Estas reglas se aplican a todo el repositorio.

## Stack y convenciones

- Next.js con App Router.
- TypeScript en modo estricto.
- Tailwind CSS.
- shadcn/ui para componentes base accesibles.
- Lucide Icons para iconografía.
- Una sola base de código, sin microservicios.
- React Server Components por defecto; usar `"use client"` solo cuando exista una necesidad concreta de interacción o APIs del navegador.
- Estado local y React Context antes de incorporar otra solución de estado.
- Datos simulados durante la Fase 1.
- Supabase/PostgreSQL, OpenAI API, Trigger.dev, Playwright, Gmail API y otras integraciones solo en la fase indicada por el roadmap.

## Comandos del proyecto

Una vez inicializada la aplicación Next.js, se deberán mantener disponibles estos comandos:

```bash
pnpm install
pnpm dev
pnpm lint
pnpm test
pnpm typecheck
pnpm build
```

Mientras no exista `package.json`, estos comandos son contratos del proyecto y no están disponibles todavía. No se deben simular resultados de validación.

## Validaciones obligatorias

- Después de cada cambio, ejecutar las validaciones relevantes disponibles.
- Para cambios de código, ejecutar como mínimo `pnpm lint`, `pnpm typecheck` y las pruebas relacionadas.
- Antes de entregar una fase o cambio transversal, ejecutar `pnpm build`.
- Si una validación no puede ejecutarse, documentar claramente el motivo.
- No dejar errores de TypeScript, lint, pruebas o build conocidos.

## Convenciones de nombres

- Componentes y tipos exportados: `PascalCase`.
- Funciones, variables y hooks: `camelCase`.
- Hooks: prefijo `use`.
- Constantes globales: `UPPER_SNAKE_CASE` cuando sean verdaderamente inmutables.
- Archivos de componentes: `kebab-case.tsx`.
- Otros archivos TypeScript: `kebab-case.ts`.
- Rutas y carpetas: `kebab-case`.
- Nombres de dominio en español cuando representen conceptos visibles del producto; nombres técnicos pueden usar inglés cuando sea la convención del framework o biblioteca.
- Evitar abreviaturas ambiguas.

## TypeScript y calidad

- Mantener `strict: true`.
- No usar `any` salvo que sea inevitable y exista una justificación documentada junto al uso. Preferir `unknown`, genéricos o tipos explícitos.
- Tipar las fronteras del sistema: props, respuestas externas, datos persistidos y funciones públicas.
- No ocultar errores con aserciones de tipo injustificadas, `@ts-ignore` o desactivación general de reglas.
- Mantener funciones y componentes pequeños, legibles y con una responsabilidad clara.

## Componentes y arquitectura

- Crear componentes reutilizables cuando exista una abstracción real, sin generalizar prematuramente.
- No crear componentes gigantes; separar estructura, presentación, estado y lógica de dominio por responsabilidad.
- Mantener la lógica de negocio fuera de los componentes visuales cuando pueda probarse de forma independiente.
- Preferir composición sobre configuraciones excesivas.
- No añadir dependencias sin una necesidad concreta y documentable.
- Actualizar `docs/architecture.md` y cualquier documento relacionado cuando cambie la arquitectura.

## Accesibilidad y experiencia

- La interfaz y los mensajes para el usuario deben estar completamente en español.
- Usar HTML semántico y conservar una jerarquía correcta de encabezados.
- Todas las acciones deben ser utilizables con teclado y mostrar foco visible.
- Asociar etiquetas a los controles; usar ARIA solo cuando el HTML semántico no sea suficiente.
- Proporcionar nombres accesibles para botones de icono y texto alternativo útil para imágenes informativas.
- No depender únicamente del color para comunicar estados.
- Mantener contraste suficiente y respetar `prefers-reduced-motion`.
- Diseñar primero para pantallas pequeñas y verificar los puntos de quiebre principales.

## Seguridad, datos e integraciones

- No inventar datos de contacto.
- Todo correo, teléfono o WhatsApp empresarial debe ser público y conservar su URL de origen.
- No implementar scraping de Google Maps.
- No enviar correos ni mensajes de WhatsApp automáticamente.
- Gmail solo podrá crear borradores cuando llegue su fase; WhatsApp usará enlaces click-to-chat con envío manual.
- No implementar autenticación, pagos, multitenencia, extensión de navegador ni funciones externas antes de su fase correspondiente.
- Mantener control humano explícito antes de cualquier comunicación comercial.
- Ninguna clave secreta puede usar el prefijo `NEXT_PUBLIC_`.
- `SUPABASE_SERVICE_ROLE_KEY` solo puede importarse en módulos marcados como `server-only`; nunca debe llegar a componentes cliente.
- No registrar tokens, claves, cuerpos completos de correos ni información sensible en logs.
- No automatizar WhatsApp Web.
- Los trabajos en segundo plano y los manejadores de eventos externos deben ser idempotentes.
- Toda integración externa debe permanecer detrás de una interfaz reemplazable.
- Mantener los repositorios simulados durante la migración hasta que su reemplazo real esté validado.
