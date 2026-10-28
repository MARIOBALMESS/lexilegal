# Sistema de Diseño | Lexi Legal

Guía de estilo, especificación de diseño y catálogo de tokens para la web de **Lexi Legal**.

---

## 1. Filosofía Estética

El diseño se inspira en la estética **minimalista oscura técnica / *B2B luxury*** (referentes: *Linear, Vercel, Apple Pro, Raycast*).
* **Sobriedad y autoridad:** Pensada específicamente para el sector jurídico (abogados, letrados, socios directores).
* **Ausencia de artificios:** Sin colores estridentes ni degradados multicolor. Se basa en contrastes extremos blanco-sobre-negro, luces difusas (*soft glows*) y bordes finos de baja saturación.
* **Profundidad sutil:** Los elementos no flotan con sombras tradicionales; se jerarquizan mediante opacidad de bordes (`border-border/60`), superficies de tarjeta (`bg-card/40`) y desenfoques.

---

## 2. Paleta de Colores (Color Tokens)

Todas las variables de color están centralizadas en el `:root` de [`styles.css`](styles.css).

| Token CSS | Código HEX | Rol Semántico / Uso | Muestra |
| :--- | :--- | :--- | :--- |
| `--color-dark` | `#050505` | Fondo base (*canvas*) de la aplicación | `■` Negro puro apagado |
| `--color-card` | `#0D0D0E` | Superficie de tarjetas y bloques interactivos | `■` Gris carbón oscuro |
| `--color-border` | `#1F1F23` | Bordes principales de división y contenedores | `■` Gris basalto |
| `--color-border-subtle` | `rgba(31, 31, 35, 0.5)` | Separadores y líneas de cuadrícula secundarias | `■` Borde atenuado |
| `--color-text-primary` | `#FAFAFA` | Texto principal de lectura y encabezados | `□` Blanco off-white |
| `--color-text-white` | `#FFFFFF` | Blanco puro para acentos, botones e iconos | `□` Blanco puro |
| `--color-muted` | `#8E8E93` | Subtítulos, metadatos, números mono y pies | `■` Gris medio neutro |
| `--selection-bg` | `#FFFFFF` | Fondo al seleccionar texto en la web | `□` Inversión blanca |
| `--selection-text` | `#000000` | Color del texto seleccionado | `■` Negro puro |

---

## 3. Tipografía

### Fuente Primaria: `Plus Jakarta Sans`
Una sans-serif geométrica moderna que transmite precisión tecnológica y rigor formal.

* **Origen:** Google Fonts ([Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans)).
* **Variable CSS:** `--font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;`
* **Pesos utilizados:**
  * `300 (Light)`: Textos secundarios, descripciones largas de servicios y subtítulos con lectura descansada.
  * `400 (Regular)`: Cuerpo de texto estándar y navegación.
  * `500 (Medium)`: Etiquetas de tarjeta, subtítulos de servicios y botones.
  * `600 (SemiBold)`: Titulares principales (`H1`, `H2`), logotipo y cifras clave.
  * `700 (Bold)`: Énfasis puntual.

### Fuente Secundaria / Metadatos: `Monospace`
* **Variable CSS:** `--font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;`
* **Uso:** Numeración de características (`01`, `02`, `03`) y micro-etiquetas de sección (`CONTACTO DIRECTO`).

---

## 4. Jerarquía Tipográfica y Escala

| Elemento | Clases Tailwind | Tamaño aprox. | Peso | Color |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Title (H1)** | `text-4xl md:text-6xl lg:text-7xl` | 36px – 72px | `font-semibold` (600) | Blanco (`#FAFAFA`) |
| **Section Title (H2)** | `text-3xl md:text-4xl` | 30px – 36px | `font-semibold` (600) | Blanco (`#FAFAFA`) |
| **Card Title** | `text-base` | 16px | `font-medium` (500) | Blanco (`#FAFAFA`) |
| **Hero Subtitle** | `text-lg md:text-xl` | 18px – 20px | `font-light` (300) | Atenuado (`--color-muted`) |
| **Body / Descripciones** | `text-sm` | 14px | `font-light` (300) | Atenuado (`--color-muted`) |
| **Eyebrows / Badges** | `text-xs font-mono tracking-widest uppercase` | 12px | `font-normal` (400) | Atenuado (`--color-muted`) |

---

## 5. Efectos, Luces y Componentes

### 1. Resplandor Ambiental Superior (`.glow`)
* **Gradiente:** `radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.08) 0%, transparent 70%)`
* **Propósito:** Genera una sutil fuente de luz cenital desde la parte superior de la página, simulando iluminación de estudio fotográfico.

### 2. Tarjetas de Servicio / Bloques
* **Fondo:** `bg-card/40` o `bg-card/60` (efecto translúcido sobre el lienzo oscuro).
* **Borde:** `border border-border/60`.
* **Radio de curvatura:** `rounded-xl` (12px) y `rounded-2xl` (16px) para un acabado suave sin ser excesivamente redondeado.

### 3. Botones y Llamadas a la Acción (CTA)
* **Botón Primario (Alto Contraste):**
  * Fondo: Blanco puro (`bg-white`).
  * Texto: Negro puro (`text-black font-medium`).
  * Hover: `hover:bg-neutral-200` con micro-transición suave de 200ms.
* **Botón Secundario / Enlaces de Contacto:**
  * Fondo translúcido con borde interactivo (`border-border` que transiciona a `hover:border-neutral-500`).
  * Micro-interacción: Flecha indicadora con traslación `group-hover:translate-x-1`.

---

## 6. Implementación en el Código

### En `styles.css` (`:root`):
```css
:root {
  --color-dark: #050505;
  --color-card: #0D0D0E;
  --color-border: #1F1F23;
  --color-border-subtle: rgba(31, 31, 35, 0.5);
  --color-text-primary: #FAFAFA;
  --color-text-white: #FFFFFF;
  --color-muted: #8E8E93;
  --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  --gradient-glow: radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.08) 0%, transparent 70%);
}
```

### En `script.js` (Tailwind Config):
```javascript
tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        dark: '#050505',
        card: '#0D0D0E',
        border: '#1F1F23',
        muted: '#8E8E93',
      }
    }
  }
};
```
