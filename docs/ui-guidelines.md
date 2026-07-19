# Guía de interfaz de Prospector AI

## Principios de experiencia

- **Claridad antes que densidad:** mostrar primero la siguiente acción y la evidencia necesaria para decidir.
- **Confianza y trazabilidad:** toda señal, puntuación y contacto debe explicar su origen.
- **Control humano:** ninguna acción de contacto debe parecer automática o irreversible.
- **Consistencia:** estados, filtros y acciones mantienen el mismo lenguaje visual en todos los módulos.
- **Responsive por defecto:** la experiencia principal debe funcionar desde móvil hasta escritorio.

## Idioma y tono

- Toda la interfaz estará en español, incluidos navegación, formularios, errores, vacíos, ayudas y etiquetas accesibles.
- Usar frases breves, directas y profesionales.
- Preferir verbos específicos: “Crear propuesta”, “Marcar para seguimiento” y “Abrir WhatsApp”.
- Evitar promesas de certeza en análisis automáticos; usar términos como “señal”, “estimación” o “requiere revisión”.
- Fechas, números y puntuaciones deben presentarse con formato local coherente.

## Sistema visual

- Tailwind CSS gestionará estilos y tokens.
- shadcn/ui aportará primitivas accesibles que se adaptarán al lenguaje visual del producto.
- Lucide será la única familia de iconos salvo necesidad justificada.
- Definir colores, tipografía, espacios, radios, sombras y capas mediante tokens; evitar valores aislados repetidos.
- Mantener una paleta sobria orientada a productividad. Los colores semánticos deben reservarse para éxito, advertencia, error, información y prioridad.
- No depender solo del color: acompañar estados con texto, icono o patrón visual.

## Estructura y navegación

- Navegación principal: Inicio, Búsquedas, Prospectos, Propuestas, Bandeja y Configuración.
- En escritorio se podrá usar una barra lateral persistente; en móvil, una navegación compacta accesible.
- Cada pantalla tendrá un título inequívoco, contexto breve cuando sea necesario y una acción primaria como máximo.
- Usar breadcrumbs solo cuando aporten orientación real en niveles de detalle.
- Conservar filtros relevantes en la URL cuando permitan compartir o recuperar una vista.

## Componentes y patrones

- Usar tablas en escritorio cuando la comparación entre prospectos sea esencial; ofrecer tarjetas o filas adaptadas en móvil.
- Las fichas de prospecto deben separar resumen, evidencia digital, contactos y fuentes, puntuación, propuesta e historial.
- Mostrar la puntuación junto con sus factores; nunca como un número opaco.
- Cada contacto debe mostrar tipo, valor, estado de verificación y enlace visible a su fuente.
- Las acciones destructivas o de descarte requieren confirmación y una salida clara.
- Botones de icono necesitan tooltip visual y nombre accesible.
- No usar modales para flujos largos; preferir páginas o paneles cuando haya contexto suficiente.

## Estados de interfaz

Toda vista de datos debe contemplar:

- Carga con estructura estable y sin saltos innecesarios.
- Vacío con explicación y siguiente acción útil.
- Sin resultados por filtros, diferenciándolo de la ausencia total de datos.
- Error en lenguaje comprensible, con recuperación cuando sea posible.
- Éxito o confirmación proporcional a la acción.
- Datos parciales o no verificados claramente identificados.

## Formularios

- Etiquetas visibles; no usar placeholders como sustituto.
- Ayuda y formato esperado cerca del campo.
- Validación al perder foco o enviar, sin interrumpir mientras el usuario escribe salvo necesidad.
- Mensajes de error específicos y asociados al control.
- Conservar datos introducidos cuando falle una operación recuperable.
- Indicar campos opcionales de forma consistente.

## Accesibilidad

- Cumplir como referencia WCAG 2.2 nivel AA.
- Orden de tabulación lógico y foco visible con contraste suficiente.
- Áreas táctiles cómodas, idealmente de al menos 44 × 44 px para controles aislados.
- HTML semántico antes que roles ARIA.
- Encabezados jerárquicos y regiones identificables.
- Diálogos con foco contenido, título accesible y retorno del foco al cerrar.
- Anunciar cambios asíncronos importantes sin generar ruido.
- Respetar zoom, preferencias de movimiento reducido y tamaños de texto del usuario.

## Responsive

- Diseñar mobile-first.
- Evitar desplazamiento horizontal de la página; permitirlo solo dentro de tablas cuando exista alternativa usable.
- Mantener acciones primarias accesibles sin ocultar el contexto.
- Reducir columnas y densidad antes de truncar información crítica.
- Probar al menos móvil estrecho, tableta, portátil y escritorio amplio.

## Rendimiento percibido

- Priorizar contenido y acciones principales en la carga inicial.
- Reservar espacio para contenido asíncrono.
- Evitar animaciones decorativas prolongadas.
- Usar iconos y recursos optimizados, y cargar de forma diferida lo que no sea esencial.
