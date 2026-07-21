# Puntaje híbrido de oportunidad

El puntaje final no lo decide OpenAI. Se calcula entre 0 y 100 con señales disponibles y trazables:

- 35% brecha digital determinística: `no_website` 100, `unreachable` 95, `outdated` 85, `basic` 65, `functional` 30 y `strong` 5.
- 20% facilidad de contacto: cero, uno o al menos dos contactos verificados equivalen a 0, 50 o 100.
- 20% actividad comercial observable: contenido de servicios aporta 60 puntos del factor y reservas aporta 40.
- 15% adecuación al servicio: nicho conocido con brecha `basic` o peor aporta 100; el resto aporta 40.
- 10% análisis IA: puntaje sugerido multiplicado por la confianza declarada.

Cada factor se limita a su intervalo antes de ponderarse y el total se redondea. La IA puede modificar como máximo diez puntos y nunca sustituye la evidencia técnica.
