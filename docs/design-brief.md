# Brief de diseño — Calma precisa

Dirección visual para Ahorro, octubre 2026. El producto es un registro local con cuatro vistas: resumen, dreams (metas y abonos), gastos y ventas. El rediseño cambia la presentación, no el modelo de datos.

## Dirección elegida

**Calma precisa:** un tablero de finanzas personales claro, con el número grande y quieto, color usado solo cuando significa algo, y movimiento corto que confirma un cambio.

Se descartó seguir el póster centrado sobre negro que tenía la app. También se descartó copiar una marca concreta:

- Revolut ordena un super-app con el saldo arriba y el resto en revelado progresivo. Aquí no hay diez productos; copiar ese cromo sobra. Sí se toma la jerarquía: una cifra principal y las acciones frecuentes a la vista ([Gummble, 2026](https://gummble.com/blog/fintech-dashboard-ui-design)).
- Nubank separa la vida del dinero en modelos mentales (mover, planear, comprar). Aquí eso se vuelve cuatro pestañas: resumen, dreams, gastos y ventas. Cada una responde una pregunta y no se mezclan en la misma pantalla ([Building Nubank](https://building.nubank.com/how-we-created-tabs/)).
- Mercury reserva el lienzo claro `#fbfcfd` al producto autenticado, un solo acento y mucho aire. Ese es el pariente más cercano de una herramienta personal ([Mercury, shadcn.io](https://www.shadcn.io/design/mercury), [Masterly](https://www.themasterly.com/blog/fintech-dashboard-design-guide)).
- Copilot abre con resumen, barras y color semántico (ingreso, gasto, aviso), no con una hoja de cálculo ([Blake Crosley](https://blakecrosley.com/guides/design/copilot-money), [OpenDesign](https://opendesign.cc/en/sites/copilot-money)).
- Monzo usa los Pots y un micro-feedback al cumplir un hábito, sin convertir la pantalla en un juego ([Lazarev](https://www.lazarev.agency/articles/fintech-app-design)).
- YNAB trata la meta como objeto de primer nivel y muestra el avance de un vistazo. El ritmo mensual que ya calculaba la app (“unos $X al mes”) se queda visible por eso ([YNAB Features](https://www.ynab.com/features)).
- Wise enseña que la animación en fintech debe explicar el movimiento del dinero, no decorar ([WANDR, tendencias móviles 2026](https://www.wandr.studio/blog/fintech-mobile-app-design-trends)).

La tendencia de tableros 2026 que mejor encaja es la “calma diseñada”: densidad legible, alertas proporcionales y color que informa en lugar de alarmar ([WANDR, 2026](https://www.wandr.studio/blog/fintech-design-trends-2026)).

## Paleta

Los verdes de neón de Copilot (`#00CC4B` sobre blanco, contraste 2.16:1) y el amarillo `#FECE4C` (1.48:1) no pasan WCAG AA para texto. En modo claro se oscurecieron. En modo oscuro sí se puede usar un verde vivo, porque sobre `#0B1210` un verde como `#00CC4B` ya llega a 9.32:1. El modo oscuro es una pasada propia, no una inversión ([WANDR](https://www.wandr.studio/blog/fintech-mobile-app-design-trends)).

Contraste medido con la fórmula WCAG 2.2 (texto normal ≥ 4.5:1, componentes gráficos ≥ 3:1). Referencia: [contraste mínimo](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) y [contraste no textual](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).

### Lienzo y texto

| Token | Claro | Oscuro | Uso |
| --- | --- | --- | --- |
| `--bg` | `#F3F6F4` | `#0B1210` | Fondo de página. El negro puro se evita: Mercury usa `#171721`, no `#000`. |
| `--surface` | `#FFFFFF` | `#141C19` | Tarjetas y formularios |
| `--surface-sunken` | `#E8F0EC` | `#0E1613` | Pozos, filas hover |
| `--ink` | `#12211C` | `#F2F7F4` | Texto principal. 16.67:1 sobre blanco; 17.49:1 sobre el fondo oscuro |
| `--ink-soft` | `#3E524B` | `#C5D5CE` | Texto secundario. 8.36:1 sobre blanco |
| `--muted` | `#4E615A` | `#A9BBB4` | Etiquetas y meta. 6.60:1 sobre blanco; 8.64:1 sobre `#141C19` |
| `--line` | `#D5E2DC` | `#24312C` | Bordes de 1px |

### Acento y semántica

El acento es un verde profundo, no el índigo de Mercury (`#5266eb`) ni el azul de Copilot (`#1C6CFF`). Ahorrar es la única acción de esta app; el verde lo dice sin gritar.

| Token | Claro | Oscuro | Rol |
| --- | --- | --- | --- |
| `--accent` | `#0C6B58` | `#0E6B52` | Botón primario. Texto claro encima: 6.44:1 y 5.98:1 |
| `--accent-hover` | `#0B5E4E` | `#127A5E` | Hover / pressed. 7.71:1 y 4.88:1 con el texto del botón |
| `--accent-ink` | `#FFFFFF` | `#F2F7F4` | Texto sobre el botón |
| `--accent-soft` | `#E7F6F1` | `#132E27` | Fondo suave de la tarjeta principal |
| `--income` | `#067647` | `#6EE7B7` | Dinero que entra: ahorrado y abonos. 5.69:1 sobre blanco; 11.39:1 sobre `#141C19` |
| `--income-soft` | `#E8F6EE` | `#12382C` | Fondo de aviso de éxito. Texto de ingreso: 5.11:1 y 8.46:1 |
| `--expense` | `#B42318` | `#FDA29B` | Salida o pérdida. Esta app no lleva un libro de gastos; el token existe para no improvisar un rojo después. 6.57:1 y 8.94:1 |
| `--expense-soft` | `#FDECEC` | `#3A1C1A` | Fondo suave de peligro. 5.76:1 y 7.95:1 |
| `--progress` | `#0C6B58` | `#34D399` | Relleno de la barra de meta |
| `--progress-track` | `#E3EEE9` | `#1C2B26` | Carril. Relleno contra carril: 5.42:1 y 7.68:1 |
| `--success` | `#067647` | `#6EE7B7` | Guardado, meta cumplida |
| `--warning` | `#7A5200` | `#F5D78E` | Fecha vencida. 6.92:1 sobre blanco; 6.44:1 sobre `#FFF6E4`; 12.39:1 el ámbar oscuro sobre `#141C19` |
| `--warning-soft` | `#FFF6E4` | `#3A2E14` | Chip de aviso |
| `--danger` | `#B42318` | `#FDA29B` | Eliminar y error de formulario |

“Falta” no usa el color de gasto. Es dinero aún por ahorrar, no una pérdida. Va en tinta normal, con la palabra “Falta” al lado. Cada estado de color lleva texto: “Meta cumplida”, “Fecha vencida”, “Quitar”, “Eliminar” ([SoftTasker](https://softtasker.net/blog/designing-for-trust-fintech)).

## Modo claro y oscuro

El claro es el punto de partida: lienzo mineral, tarjetas blancas, sombra muy baja. El oscuro recolorea superficies, texto, sombras y semántica; no invierte el claro. El interruptor guarda `light` o `dark` en `localStorage` (`ahorro-theme`). Si no hay elección, se sigue `prefers-color-scheme`. Un script en el `<head>` aplica el tema antes de pintar, para que no parpadee.

## Tipografía

Pareja autoalojada (SIL Open Font License), sin CDN en tiempo de ejecución:

- **Fraunces** (Undercase Type) solo en el título de página. Serif suave, peso 600. Da un registro editorial sin invadir los números.
- **Plus Jakarta Sans** (Tokotype) para interfaz, etiquetas y cifras. Geométrica, con cifras tabulares.

Sustitutos si la fuente no carga: Georgia en el título; `ui-sans-serif`, Segoe UI, sans-serif en el resto. Los archivos `woff2` cubren latino y latino extendido (ñ y acentos van en el bloque latino).

Escala (16px base):

| Token | Tamaño | Peso | Uso |
| --- | --- | --- | --- |
| caption | 12px / 1.4 | 500 | Etiquetas de KPI, tracking 0.04em |
| small | 13px / 1.45 | 400 | Meta, historial, toasts |
| body | 16px / 1.5 | 400 | Texto e inputs (16px evita el zoom de iOS) |
| lead | 18px / 1.45 | 400 | Bajada del título |
| title | 20px / 1.3 | 600 | Nombre del dream y títulos de panel |
| stat | clamp(1.35rem, 2.5vw, 2rem) | 700 | Cifras secundarias |
| stat-lg | clamp(1.7rem, 3vw, 2.45rem) | 700 | Ahorrado |
| display | clamp(2.15rem, 4vw, 3.35rem) / 1.05 | 600 | “Tus dreams…” tracking −0.03em |

Todas las cantidades usan `font-variant-numeric: tabular-nums` y `lining-nums`, alineadas a la derecha en el historial ([SoftTasker](https://softtasker.net/blog/designing-for-trust-fintech), [Ledger](https://designmd.in/d/ledger)).

## Espacio, radio y sombra

Base de 4px, como Mercury y la mayoría de sistemas de producto ([Mercury](https://www.shadcn.io/design/mercury)).

- Espacio: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.
- Radio: 8px controles pequeños, 12px inputs y botones, 16px tarjetas, 20px modal, píldora solo en el interruptor de tema.
- Sombra clara: `0 1px 2px rgba(18,33,28,.05)` en reposo; al hover `0 12px 32px rgba(18,33,28,.06)`.
- Sombra oscura: línea superior `rgba(255,255,255,.04)` y `0 16px 40px rgba(0,0,0,.35)`. En oscuro la elevación es borde + sombra, no un blanco invertido.

El contenido mide como máximo 1080px. El cromo (barra superior) es a todo el ancho; el contenido se alinea con el mismo padding (24px, 16px en móvil).

## Tarjetas y tablero

Orden de lectura, de arriba a abajo:

1. Barra: marca “Ahorro” y el interruptor de tema.
2. Título a la izquierda, no centrado. La bajada y el estado de los JSON quedan en texto secundario.
3. Cuatro cifras: Ahorrado (tarjeta principal), Falta, Dreams, Avance global con barra.
4. Dos paneles de acción: crear dream y abonar. En menos de 860px se apilan.
5. Lista de dreams. Cada tarjeta muestra nombre, precio, fecha, porcentaje, barra, ahorrado, falta, ritmo mensual o “Meta cumplida”, acciones (PDF, editar, eliminar) e historial de abonos.

Editar abre un modal (`<dialog>`), no un formulario incrustado. Así la tarjeta no salta de layout y el foco queda atrapado hasta guardar, cancelar o pulsar Escape. Eliminar sigue siendo inmediato, con toast, como antes.

En móvil las cifras van en grilla de dos columnas y los botones de la tarjeta hacen salto de línea. Áreas táctiles de al menos 44px.

## Visualización

No hay librería de gráficas. El dato de esta app es un avance hacia un precio:

- Barra horizontal de 8px, carril neutro, relleno `--progress`, porcentaje numérico al lado.
- La barra global usa la misma pieza: ahorrado / suma de precios.
- Al 100% la barra llega al final y el texto dice “Meta cumplida”. El color no es el único indicador.
- “Fecha vencida” es un chip con texto ámbar si la fecha límite ya pasó y aún falta dinero. No cambia el cálculo del ritmo.

## Movimiento

Duraciones dentro de 150–400ms. Sin rebote. Las curvas salen de [GoCardless Motion](https://brand.gocardless.com/motion) y de [SoftTasker](https://softtasker.net/blog/designing-for-trust-fintech); los tramos de 600–1000ms de GoCardless no se usan.

| Token | Valor | Uso |
| --- | --- | --- |
| `--dur-fast` | 150ms | Hover, press (`scale(0.98)`), sombra |
| `--dur` | 220ms | Toast, modal, cambio de tema, fade del fondo del diálogo |
| `--dur-slow` | 380ms | Entrada de tarjetas, barra que se llena, conteo de totales |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entradas y hover. Desacelera, no sobrepasa |
| `--ease-smooth` | `cubic-bezier(0.5, 0, 0, 1)` | Modal, barras, color de tema |

Qué se mueve y por qué:

- El título, las cifras y los formularios entran una vez al cargar (opacidad + 10px), con 40ms de escalonado, para marcar el orden de lectura.
- Cada dream nuevo se desliza una vez. Volver a pintar la lista no reanima las tarjetas ya vistas.
- Las barras nacen en 0% y crecen hasta su avance. El ancho es el dato.
- Ahorrado, Falta, Dreams y el porcentaje global cuentan desde el valor anterior en 380ms. Solo los totales, no cada abono.
- Botones: suben 1px al hover (solo con `hover: hover`) y se comprimen al pulsar.
- El modal escala de 0.98 y sube 8px; el fondo se oscurece. Cierra con la misma curva, incluida la edición.
- Un toast confirma crear, editar, abonar, eliminar y el error de guardado.
- Al cruzar exactamente el 100% (no en cada carga) hay un toast “Meta cumplida” y una ráfaga de 400ms. Es el momento de Monzo/Revolut, una sola vez.

`prefers-reduced-motion: reduce` anula animaciones y transiciones. El conteo, las partículas y el cierre animado del modal se saltan en JS y dejan el estado final. Es el criterio 2.3.3 de WCAG (nivel AAA); se cumple igual porque el encargo lo pide y porque GoCardless y los kits de tableros financieros lo tratan como obligatorio ([Finance Dashboard Kit](https://thefrontkit.com/docs/finance-dashboard-kit/accessibility)).

## Accesibilidad

- Contraste AA en texto e interfaz, medido arriba.
- Foco visible (`:focus-visible`) en verde oscuro sobre claro y en `#6EE7B7` sobre oscuro.
- Labels ligados con `for`/`id`, errores con `role="alert"` y `aria-invalid`.
- El diálogo de edición es nativo: foco atrapado, Escape, clic en el fondo, foco devuelto al botón Editar.
- Barras con `role="progressbar"` y valor numérico.
- Toasts en una región `aria-live="polite"`.
- Enlace “Saltar al contenido”.

## Vistas

La misma paleta cubre las cuatro secciones. El color sigue siendo semántico:

- **Dreams:** la barra de avance usa `--progress`. El dinero ahorrado y los abonos usan `--income`. Al cruzar el 100% hay toast y una ráfaga de 400ms.
- **Gastos:** montos en `--expense`, con el signo menos y la palabra de la categoría. La barra del resumen por categoría usa el mismo rojo, sobre `--expense-soft`, para no confundirla con una meta.
- **Ventas:** la ganancia positiva usa `--income` y un signo más. La pérdida usa `--expense`. “Pendiente” es un chip de `--warning` con texto, no solo color. “Vendido” es un chip de ingreso.
- **Resumen:** el ahorro general (ganancias de lo vendido) es la cifra hero. Si es negativa, pasa a `--expense`. Al lado, lo ahorrado en dreams y los gastos del mes.

Editar un dream abre el mismo diálogo nativo (nombre, precio y fecha límite). Marcar un artículo como vendido sigue en la fila, con el formulario corto que ya tenía la app.

## Fuentes consultadas

- Gummble, “Fintech Dashboard UI Design: Fey, Mercury & Revolut”: https://gummble.com/blog/fintech-dashboard-ui-design
- Lazarev, “Why fintech app design live or die by UX” (Revolut, Monzo): https://www.lazarev.agency/articles/fintech-app-design
- WANDR, “Fintech Design Trends 2026”: https://www.wandr.studio/blog/fintech-design-trends-2026
- WANDR, “Fintech Mobile App Design Trends for 2026” (Wise, densidad, modo oscuro): https://www.wandr.studio/blog/fintech-mobile-app-design-trends
- Masterly, “Fintech Dashboard Design”: https://www.themasterly.com/blog/fintech-dashboard-design-guide
- Blake Crosley, “Copilot Money”: https://blakecrosley.com/guides/design/copilot-money
- OpenDesign, “Copilot Money · Design DNA”: https://opendesign.cc/en/sites/copilot-money
- Refero, “Copilot Money design system”: https://styles.refero.design/style/91b110da-902b-4d09-8bf0-26bd1f25f8b2
- shadcn.io, extracción de Mercury: https://www.shadcn.io/design/mercury
- Building Nubank, “How we created Tabs”: https://building.nubank.com/how-we-created-tabs/
- YNAB, Features (goal tracking): https://www.ynab.com/features
- GoCardless, Motion: https://brand.gocardless.com/motion
- SoftTasker, “Designing for Trust”: https://softtasker.net/blog/designing-for-trust-fintech
- DesignMD, Ledger: https://designmd.in/d/ledger
- thefrontkit, Finance Dashboard Kit accessibility: https://thefrontkit.com/docs/finance-dashboard-kit/accessibility
- W3C, WCAG 2.2 Understanding 1.4.3 y 1.4.11
