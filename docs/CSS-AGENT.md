# CSS Agent Guide — damianmartin.es

Lee este documento **antes** de tocar cualquier `.module.css`, `globals.css` o estilo inline. Es la fuente única de verdad para estilos del portfolio.

Si encuentras algo en el código actual que contradiga esta guía, **es deuda**: arréglalo en el cambio que estés haciendo. No añadas deuda nueva.

---

## 1. Reglas absolutas

Estas reglas no se discuten. Si una PR las rompe, no entra.

1. **Cero `style={{...}}` inline en JSX.** Salvo dos excepciones:
   - Pasar un valor dinámico como CSS variable: `<div style={{ "--col": project.color }}>`. La clase de CSS Module consume `var(--col)`.
   - Animaciones controladas por JS de Framer Motion (que ya recibe `style` como prop estandarizada).
2. **Cero valores mágicos.** Colores, radios, espacios, transiciones, sombras, fuentes y breakpoints van siempre vía `var(--token)`. Si necesitas un valor que no existe, primero añade el token en `globals.css` y luego úsalo.
3. **CSS Modules por componente.** Un archivo `Foo.tsx` → un archivo `Foo.module.css` colocado al lado. Nombres de clase en `kebab-case` o `camelCase`, sin BEM.
4. **Sin `!important`** salvo para sobrescribir CSS de una librería externa que no expone API. Si lo añades, comenta por qué en la misma línea.
5. **Mobile-first.** Las media queries usan `min-width`. Breakpoints estándar (alineados con `--content-*`):
   - `@media (min-width: 640px)` — tablet small
   - `@media (min-width: 960px)` — tablet/desktop
   - `@media (min-width: 1200px)` — desktop wide
6. **Animaciones siempre con tokens.** Usa `--transition-interactive` (hover, focus) o `--transition-slow` (entradas, modales). Nunca `200ms ease` a pelo.
7. **Dark mode debe probarse.** Cada componente nuevo se valida en light y dark antes de cerrar. El toggle vive en `Header.tsx` y aplica `data-theme="dark"` en `<html>`.

---

## 2. Tokens disponibles (autoritativos)

Estos son los tokens definidos en [src/app/globals.css](../src/app/globals.css). **No los dupliques** en `.module.css`.

### Color — superficies y texto

| Token                       | Light       | Dark        | Uso                                              |
| --------------------------- | ----------- | ----------- | ------------------------------------------------ |
| `--color-bg`                | `#f5f3ef`   | `#111009`   | Fondo de página                                  |
| `--color-surface`           | `#faf9f6`   | `#181610`   | Cards, formularios                               |
| `--color-surface-2`         | `#ffffff`   | `#1e1b14`   | Cards elevadas, modales                          |
| `--color-surface-offset`    | `#ede9e3`   | `#221f17`   | Bandas / secciones contrastadas suaves           |
| `--color-surface-offset-2`  | `#e4dfd7`   | `#28251c`   | Hover sobre offset                               |
| `--color-surface-dynamic`   | `#d9d3ca`   | `#302d23`   | Estados activos, chips                           |
| `--color-divider`           | `#ccc8c0`   | `#383329`   | `border-bottom` de secciones                     |
| `--color-border`            | rgba 10%    | rgba 10%    | Bordes finos sobre cualquier surface             |
| `--color-text`              | `#1c1916`   | `#e8e4dc`   | Texto principal                                  |
| `--color-text-muted`        | `#706a61`   | `#8a847a`   | Texto secundario, captions, meta                 |
| `--color-text-faint`        | `#b0aa9f`   | `#52504a`   | Texto deshabilitado, placeholders                |
| `--color-text-inverse`      | `#f5f3ef`   | `#111009`   | Texto sobre fondos primary                       |

### Color — primario y estados

| Token                       | Light       | Dark        | Uso                                              |
| --------------------------- | ----------- | ----------- | ------------------------------------------------ |
| `--color-primary`           | `#c0392b`   | `#e05244`   | Botones primary, acentos                         |
| `--color-primary-hover`     | `#9d2e22`   | `#c83d30`   | Hover sobre primary                              |
| `--color-primary-active`    | `#7a2419`   | `#a32e23`   | Active/pressed                                   |
| `--color-primary-highlight` | rgba 8%     | rgba 12%    | Fondo sutil (selección, badges)                  |
| `--color-error`             | `#c0392b`   | `#e05244`   | Texto de error, bordes inválidos                 |
| `--color-error-bg`          | rgba 10%    | rgba 14%    | Fondo de mensaje de error                        |
| `--color-success`           | `#2c8a4a`   | `#4cb073`   | Confirmaciones, toasts ok                        |
| `--color-success-bg`        | rgba 12%    | rgba 14%    | Fondo de mensaje de éxito                        |
| `--color-warning`           | `#d4881f`   | `#e6a04a`   | Avisos                                           |
| `--color-warning-bg`        | rgba 12%    | rgba 14%    | Fondo de aviso                                   |
| `--color-info`              | = muted     | = muted     | Avisos informativos                              |

### Radios

| Token            | Valor      | Uso                                  |
| ---------------- | ---------- | ------------------------------------ |
| `--radius-sm`    | `0.25rem`  | Inputs pequeños, chips               |
| `--radius-md`    | `0.5rem`   | Cards, botones (default)             |
| `--radius-lg`    | `0.875rem` | Cards grandes, modales               |
| `--radius-xl`    | `1.25rem`  | Hero, contenedores destacados        |
| `--radius-full`  | `9999px`   | Pills, botones redondos              |

### Espaciado

| Token         | Valor      |
| ------------- | ---------- |
| `--space-1`   | `0.25rem`  |
| `--space-2`   | `0.5rem`   |
| `--space-3`   | `0.75rem`  |
| `--space-4`   | `1rem`     |
| `--space-5`   | `1.25rem`  |
| `--space-6`   | `1.5rem`   |
| `--space-8`   | `2rem`     |
| `--space-10`  | `2.5rem`   |
| `--space-12`  | `3rem`     |
| `--space-16`  | `4rem`     |
| `--space-20`  | `5rem`     |
| `--space-24`  | `6rem`     |

Regla mental: padding de input = `var(--space-3) var(--space-4)`. Padding de botón = `var(--space-3) var(--space-5)`. Gap entre cards = `var(--space-6)` a `var(--space-8)`.

### Tipografía

- Familias: `--font-display` y `--font-body` (ambas Space Grotesk).
- Escala fluida (clamp):
  - `--text-xs` ≈ 12-14px (eyebrows, captions)
  - `--text-sm` ≈ 14-16px (meta, secundario)
  - `--text-base` ≈ 16-18px (body)
  - `--text-lg` ≈ 18-24px (subtítulos)
  - `--text-xl` ≈ 24-36px (section titles)
  - `--text-2xl` ≈ 32-56px (titulares de página)
  - `--text-hero` ≈ 56-144px (hero only)
- Pesos: solo `300`, `400`, `500`, `600`, `700`.
- Tracking de eyebrows: `letter-spacing: 0.12em`, `text-transform: uppercase`.

### Transiciones y sombras

| Token                       | Valor                                             |
| --------------------------- | ------------------------------------------------- |
| `--transition-interactive`  | `200ms cubic-bezier(0.16, 1, 0.3, 1)`             |
| `--transition-slow`         | `400ms cubic-bezier(0.16, 1, 0.3, 1)`             |
| `--shadow-sm`               | sombra fina, hover de cards                       |
| `--shadow-md`               | cards elevadas                                    |
| `--shadow-lg`               | modales, dropdowns, focus elevation               |

### Contenedores

| Token                | Valor      | Uso                                |
| -------------------- | ---------- | ---------------------------------- |
| `--content-narrow`   | `640px`    | Forms, posts                       |
| `--content-default`  | `960px`    | Páginas estándar                   |
| `--content-wide`     | `1200px`   | Grids de proyectos, marquees       |

### Animated custom properties (`@property`)

Registradas a nivel global en `globals.css` para que las animaciones de gradientes interpolen correctamente:

| Property             | Tipo       | Initial | Uso                                       |
| -------------------- | ---------- | ------- | ----------------------------------------- |
| `--shine-angle`      | `<angle>`  | `0deg`  | Rotación del shine border en cards        |

**Por qué `@property`**: sin él, los browsers tratan los custom properties como `string` y NO los interpolan en `@keyframes`. Con `@property` registered como `<angle>`, el browser interpola suavemente de `0deg` a `360deg` en una animación.

---

## 3. Utilidades globales (no duplicar en módulos)

Definidas en `globals.css`. Úsalas directamente vía `className="..."` (no via `styles.*`):

- `.container` — wrapper con `max-width: --content-default` y padding lateral.
- `.container-wide` — idem con `--content-wide`.
- `.section` — `padding-block` fluido + `border-bottom: --color-divider`.
- `.section-label` — eyebrow uppercase color primary.
- `.section-title` — `--text-xl`, bold, tight tracking, `margin-bottom: --space-8`.

Si una clase de tu `.module.css` está reimplementando una de estas, bórrala y usa la global.

---

## 4. Patrones de componente (esqueletos)

### Botón primary

```css
/* Foo.module.css */
.btnPrimary {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: var(--text-sm);
  transition: background var(--transition-interactive);
}

.btnPrimary:hover {
  background: var(--color-primary-hover);
}

.btnPrimary:active {
  background: var(--color-primary-active);
}
```

### Botón secondary (outline)

```css
.btnSecondary {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  background: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: var(--text-sm);
  transition: background var(--transition-interactive),
              border-color var(--transition-interactive);
}

.btnSecondary:hover {
  background: var(--color-surface-offset);
  border-color: var(--color-text-muted);
}
```

### Input / textarea

```css
.input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  transition: border-color var(--transition-interactive);
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-highlight);
}

.input::placeholder {
  color: var(--color-text-faint);
}
```

### Card

```css
.card {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-6);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: transform var(--transition-interactive),
              box-shadow var(--transition-interactive);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
```

### Mensaje de error / éxito

```css
.error {
  padding: var(--space-3) var(--space-4);
  background: var(--color-error-bg);
  color: var(--color-error);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
}

.success {
  padding: var(--space-3) var(--space-4);
  background: var(--color-success-bg);
  color: var(--color-success);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
}
```

---

## 4.b Patrones de animación

Animaciones ya implementadas y validadas. Reutiliza estos snippets en lugar de reinventar.

### Shine border (conic-gradient animado)

Anillo reflectante que recorre el perímetro de un elemento. Usado en `ProjectCard`, `ProjectCardMinimal`, `cardHome`.

Requiere `@property --shine-angle` declarado en `globals.css` (ver sección 2).

```css
.card {
  position: relative;
  isolation: isolate;          /* crea stacking context propio */
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.card::before {
  content: "";
  position: absolute;
  inset: 0;
  padding: 2px;                /* grosor del anillo */
  border-radius: inherit;
  background: conic-gradient(
    from var(--shine-angle, 0deg),
    transparent 0%,
    transparent 55%,
    var(--color-primary) 72%,
    color-mix(in oklch, var(--color-primary) 70%, transparent) 82%,
    transparent 92%,
    transparent 100%
  );
  /* Máscara substractiva: anillo de "padding" px, hueco en el centro. */
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  pointer-events: none;
  z-index: 3;
  transition: opacity 0.3s ease;
}

.card:hover::before {
  opacity: 1;
  animation: shine-rotate 2.4s linear infinite;
}

@keyframes shine-rotate {
  to { --shine-angle: 360deg; }
}
```

### Marquee infinito horizontal

Auto-scroll de items, loop sin saltos, pause en hover. Usado en `CarouselBlock`, `Marquee` (home), `FeaturedMarquee`.

**Key**: el track contiene los items **duplicados** (`[...items, ...items]`) y se desplaza `-50%` exacto, que coincide con el ancho de una copia → loop invisible.

```css
.wrap {
  max-width: var(--content-default);
  margin-inline: auto;
  padding-inline: var(--space-6);
}

.viewport {
  width: 100%;
  overflow: hidden;
  /* Fade en los bordes para que el corte no sea brusco. */
  mask-image: linear-gradient(
    to right,
    transparent,
    black var(--space-8),
    black calc(100% - var(--space-8)),
    transparent
  );
}

.track {
  display: flex;
  gap: var(--space-4);
  width: max-content;
  will-change: transform;
  animation: marquee var(--marquee-duration, 40s) linear infinite;
}

.wrap:hover .track,
.wrap:focus-within .track {
  animation-play-state: paused;
}

@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(calc(-50% - var(--space-4) / 2)); }
}

@media (prefers-reduced-motion: reduce) {
  .track {
    animation: none;
    overflow-x: auto;            /* fallback scroll manual */
  }
}
```

En el TSX: `const doubled = [...items, ...items]; const duration = Math.max(20, items.length * 4);`. Pasa `duration` como CSS variable `--marquee-duration`.

### Lightbox zoom-in (dialog modal)

Apertura cinemática del `<dialog>`. Usado en `ProjectCardMinimal`.

```css
.modal[open] {
  display: flex;
  align-items: center;
  justify-content: center;
  animation: modal-fade-in 0.32s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal::backdrop {
  background: rgba(0, 0, 0, 0.85);
  animation: backdrop-fade-in 0.32s cubic-bezier(0.16, 1, 0.3, 1);
}

.modalImgWrap {
  /* La imagen entra escalando desde 0.85 con expo-out → sensación de "zoom into" */
  animation: lightbox-zoom 0.42s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modal-fade-in {
  from { opacity: 0; } to { opacity: 1; }
}

@keyframes backdrop-fade-in {
  from { background: rgba(0, 0, 0, 0); }
  to { background: rgba(0, 0, 0, 0.85); }
}

@keyframes lightbox-zoom {
  from { opacity: 0; transform: scale(0.85); }
  to { opacity: 1; transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .modal[open], .modal::backdrop, .modalImgWrap {
    animation: none;
  }
}
```

**Importante**: `.modal:not([open]) { display: none }` debe existir. Si declaras `display: flex` sin condicionar a `[open]`, todos los dialogs son visibles a la vez (bug histórico — el último gana en stacking).

### Hero canvas reactivo (HeroOrb)

Fondo de canvas 2D con dots reactivos al cursor. Patrón performant para fondos interactivos sin tirar miles de elementos DOM.

- 1 sólo `<canvas>` con RAF loop.
- Posiciones de dots precomputadas en array (no DOM nodes).
- Theme observer (MutationObserver) para repintar al cambiar light/dark.
- Apagado en `(hover: none)` y `(prefers-reduced-motion: reduce)`.

Ver `src/components/portfolio/HeroOrb.tsx` como referencia. **No reutilizar el efecto en otras páginas**: es un statement piece exclusivo del home.

---

## 4.c Componentes admin (patrones reusables)

### `Dropzone` (`src/components/admin/Dropzone.tsx`)

Visual file picker con drag-and-drop nativo + validación inline.

Props: `multiple?`, `disabled?`, `label?`, `hint?`, `onFiles(files: File[])`, `compact?`.

Úsalo en todos los formularios que reciban imágenes (cover de proyecto, header_image, galería, carrusel, avatar perfil). No vuelvas a escribir `<input type="file">` plano.

### `BlockPreview` (`src/components/admin/BlockPreview.tsx`)

Renderiza un bloque público (`HeadingBlock`, `ImageBlock`, etc.) dentro del editor para preview WYSIWYG. Recibe el bloque entero y dispatchea al componente público correcto.

### `BlockShell` (`src/components/admin/blocks/BlockShell.tsx`)

Wrapper común a todos los block forms. Provee:
- Header colapsable con tipo + summary
- Toggle de vista: `Vista` / `Ambos` / `Editar`
- Botones de mover arriba/abajo, eliminar

Cualquier nuevo tipo de bloque debe envolverse en `BlockShell` para mantener UX consistente.

### Inputs admin — clases compartidas

`src/components/admin/blocks/BlockFields.module.css` exporta:

| Clase            | Uso                                                    |
| ---------------- | ------------------------------------------------------ |
| `.row`           | Flex row gap-3, wrap. Agrupa 2+ campos lado a lado.    |
| `.field`         | Flex column gap-2. Wrapper de un par label+input.      |
| `.fieldNarrow`   | `flex: 0 0 120px` — para campos pequeños (ej. nivel).  |
| `.fieldMedium`   | `flex: 0 0 200px` — campos medianos (ej. columnas).    |
| `.fieldWide`     | `flex: 0 0 220px` — campos amplios (ej. proporción).   |
| `.label`         | Etiqueta uppercase faint.                              |
| `.input`         | Input/select estándar (border, padding, focus ring).   |
| `.textarea`      | Como `.input` pero con min-height.                     |
| `.select`        | Como `.input` con appearance:none + chevron.           |
| `.imageList`     | Grid de imágenes existentes con thumb + alt + remove.  |
| `.preview`       | Wrapper aspect-ratio para imagen subida (cover/header).|

Para limitar el ancho de un `.field`, **nunca** uses `style={{flex: "0 0 Npx"}}` inline — usa `.fieldNarrow/Medium/Wide` o añade una nueva clase si necesitas otra medida.

---

## 5. Anti-patrones detectados (no repetir)

Errores que ya hubo en el código y que están corregidos. Si los ves, márcalos:

- ❌ `var(--color-muted)` — no existe. El correcto es `var(--color-text-muted)`.
- ❌ `#cc0000`, `#c0392b` hardcoded — usar `var(--color-error)` o `var(--color-primary)`.
- ❌ `border-radius: 8px` — usar `var(--radius-md)`.
- ❌ `padding: 10px 14px` — usar `var(--space-3) var(--space-4)`.
- ❌ `transition: 0.2s ease` — usar `var(--transition-interactive)`.
- ❌ Duplicar la clase `.card` en cada módulo con valores ligeramente distintos — usar el patrón único.
- ❌ `<div onClick>` actuando como botón — usar `<button>` con la clase de botón.
- ❌ Importar Google Fonts en cada `.module.css` — el `@import` solo vive en `globals.css`.

---

## 6. Checklist de PR

Antes de cerrar un PR que toca CSS, verifica:

- [ ] Cero ocurrencias de `style={` salvo CSS-variable dinámica o Framer Motion.
- [ ] Cero hex/rgb hardcoded en `.module.css` (todo via `var(--color-*)`).
- [ ] Cero magic numbers para spacing, radii o transitions.
- [ ] Las clases que defines se usan en el JSX (sin huérfanas).
- [ ] Probado en dark mode (toggle del header).
- [ ] `:focus-visible` se ve en cualquier elemento interactivo (`button`, `a`, `input`).
- [ ] El componente respeta los breakpoints estándar (mobile-first).
- [ ] No has añadido `!important` (o si sí, está justificado en comentario).

---

## 7. Cuándo añadir un token nuevo

Añade un token en `globals.css` cuando:

- El mismo valor concreto aparece en **≥3 lugares**.
- El valor representa una decisión de diseño (no un accidente).
- Cambiar ese valor en el futuro debería cambiarlo en todos sitios.

No añadas tokens para:

- One-offs (un componente único que usa un valor específico).
- Valores derivados que ya se pueden calcular con tokens existentes.

Cuando añadas un token, **actualiza también este documento** en la sección 2.
