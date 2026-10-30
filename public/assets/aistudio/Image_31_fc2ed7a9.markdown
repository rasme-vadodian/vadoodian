---
name: Vadudian Heritage Cafe & Museum
colors:
  surface: '#fff8f4'
  surface-dim: '#e0d9d3'
  surface-bright: '#fff8f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#faf2ec'
  surface-container: '#f4ece6'
  surface-container-high: '#efe7e1'
  surface-container-highest: '#e9e1db'
  on-surface: '#1e1b18'
  on-surface-variant: '#434751'
  inverse-surface: '#33302c'
  inverse-on-surface: '#f7efe9'
  outline: '#747782'
  outline-variant: '#c3c6d2'
  surface-tint: '#365da2'
  primary: '#002252'
  on-primary: '#ffffff'
  primary-container: '#00377b'
  on-primary-container: '#7fa3ed'
  inverse-primary: '#adc6ff'
  secondary: '#835428'
  on-secondary: '#ffffff'
  secondary-container: '#febf89'
  on-secondary-container: '#794c20'
  tertiary: '#002926'
  on-tertiary: '#ffffff'
  tertiary-container: '#00413d'
  on-tertiary-container: '#29b5ab'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#194589'
  secondary-fixed: '#ffdcc1'
  secondary-fixed-dim: '#f8ba84'
  on-secondary-fixed: '#2e1500'
  on-secondary-fixed-variant: '#673d12'
  tertiary-fixed: '#7af6eb'
  tertiary-fixed-dim: '#5adacf'
  on-tertiary-fixed: '#00201d'
  on-tertiary-fixed-variant: '#00504b'
  background: '#fff8f4'
  on-background: '#1e1b18'
  surface-variant: '#e9e1db'
typography:
  display:
    fontFamily: Noto Serif
    fontSize: 2.25rem
    fontWeight: '700'
    lineHeight: 3rem
  headline-lg:
    fontFamily: Noto Serif
    fontSize: 1.75rem
    fontWeight: '600'
    lineHeight: 2.5rem
  headline-md:
    fontFamily: Noto Serif
    fontSize: 1.375rem
    fontWeight: '600'
    lineHeight: 2rem
  title-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.125rem
    fontWeight: '700'
    lineHeight: 1.75rem
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 1rem
    fontWeight: '600'
    lineHeight: 1.5rem
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.625rem
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.5rem
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.875rem
    fontWeight: '600'
    lineHeight: 1.25rem
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.75rem
    fontWeight: '500'
    lineHeight: 1rem
  price-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.125rem
    fontWeight: '700'
    lineHeight: 1.5rem
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.25rem
---

## Brand & Style

This design system expresses the dialogue between Persian cultural heritage and modern third-wave cafe hospitality. Rooted in the archival atmosphere of Cafe & Museum Vadudian (کافه و موزه ودودیان), the visual identity balances historical Persian tilework, calligraphy, and antique warmth with contemporary digital efficiency.

### Visual Character
- **Artisanal Heritage meets Contemporary Polish:** Clean typographic structures grounded by ornamental arabesque motifs, ceramic blue undertones, and clay-tinted neutrals.
- **Atmospheric Warmth:** Avoids sterile starkness; utilizes tactile antique paper tones and terracotta-leaning ochre accents to emulate daylight filtered through stained-glass courtyards (orosi).
- **RTL-Native Rhythm:** Engineered from the ground up for right-to-left Persian script reading dynamics, ensuring optical balance for Persian calligraphy, numeral typography, and bilingual annotations.
- **Sensory Hospitality:** High-appeal culinary card presentations, clear dietary labels, and intuitive micro-interactions that mirror effortless table service.

## Colors

The palette is derived directly from Persian architectural pigments: deep cobalt tile glaze, warm desert earth, and luminous oxidized copper.

### Color Tokens & Roles
- **Primary (`#00377B` - Cobalt Navy):** The anchor of the brand, reflecting traditional Isfahan and Qajar tile work. Used for primary interactive actions, high-emphasis headings, key pricing numerals, active tab indicators, and prominent icons.
- **Secondary (`#BD8655` - Warm Earth Ochre):** Evoking adobe architecture, roasted espresso, and wood craft. Applied to secondary interactive surfaces, category highlight chips, badges, and warm border accents.
- **Tertiary (`#00A79D` - Persian Turquoise / Firoozeh):** Sourced from Iranian enameling and vaulted domes. Reserved for seasonal callouts, "Chef's Recommendation" tags, active state indicators, and fresh herbal/beverage flags.
- **Neutral Canvas (`#F2EAE4` - Antique Linen Cream):** A soft, tactile paper tint serving as the default application background, preventing glare while honoring the tactile essence of vintage museum manuscripts.
- **Surface Elevation (`#FFFFFF` - Pure White):** Used for elevated cards, modal sheets, and food item containers to guarantee photographic vibrancy and readability.
- **Text Hierarchy:**
  - `text-primary`: `#142238` (Deep navy-tinted charcoal for maximum contrast without harsh pure black).
  - `text-secondary`: `#5D6677` (Subdued cobalt slate for descriptions, origins, and ingredient lists).
  - `text-tertiary`: `#8C7768` (Warm muted earth for secondary metadata, volume/gram units, and subtle timestamps).

## Typography

The typographical architecture bridges classical Iranian heritage with clean Latin pairing. For Persian text contexts, the platform maps systematically to Persian typefaces (such as **Vazirmatn** or **Shabnam**), while Latin elements, bilingual titles, and numeral systems utilize **Noto Serif** for prestige display and **Plus Jakarta Sans** for modern legibility.

### Guidelines
- **Script Handling:** When rendering Persian text, provide increased line-height (+20% relative to Latin standard) to accommodate Persian ascenders, descenders, and accent marks (Tashkeel).
- **Pricing & Currency:** Prices must feature bold, tabular digits followed by the unit currency token (تومان / Toman or ریال / Rial) set in a slightly smaller regular weight to maintain visual order.
- **RTL Fluidity:** Heading and body text align to `text-right` across all default Persian views. In bilingual cards, English titles are styled in `title-md` italicized or muted below the Persian calligraphy titles.

## Layout & Spacing

The layout is built mobile-first to prioritize patrons ordering or browsing tableside from smartphones, scaling gracefully into tablet stations and counter displays.

### Layout Principles
- **Grid Architecture:** 
  - **Mobile (< 640px):** Single column stream with sticky horizontal category tabs, `margin: 1rem`, and `space-md: 1rem` vertical stacking between item cards.
  - **Tablet (640px - 1024px):** 2-column card grid with `gutter: 1rem` and `margin: 1.5rem`.
  - **Desktop / Display (> 1024px):** Fixed max-width container (`1140px`) centered with sticky museum sidebar navigation and a 3-column menu grid.
- **Touch Targets:** Minimum interactive touch footprint of `44px x 44px` on all buttons, category filters, and expand toggles.
- **Sticky Navigation:** Horizontal category pill bar with smooth horizontal scroll and snap-to-edge alignment adhering to RTL scroll position.

## Elevation & Depth

Visual hierarchy uses warm, tinted ambient drop shadows inspired by natural interior lighting on plaster walls rather than cold algorithmic grayscale shadows.

### Elevation Hierarchy
- **Level 0 (Flat / Canvas):** Antique Linen (`#F2EAE4`) background; no shadow.
- **Level 1 (Menu Item Cards):** Pure White (`#FFFFFF`) surfaces elevated with a warm diffuse shadow: `0 4px 16px -2px rgba(189, 134, 85, 0.10), 0 2px 6px -1px rgba(0, 55, 123, 0.04)`. Outlined with a delicate hairline border (`1px solid rgba(189, 134, 85, 0.15)`).
- **Level 2 (Sticky Headers & Quick Filters):** Frosted Antique White with `backdrop-filter: blur(12px)` and shadow: `0 6px 20px -4px rgba(0, 55, 123, 0.08)`.
- **Level 3 (Modals, Item Detail Drawer, & Active Order Trays):** Elevated floating sheet with: `0 16px 36px -6px rgba(0, 55, 123, 0.18)`.

## Shapes

The form language is disciplined, balancing modern digital cleanliness with soft organic curves reminiscent of Persian archways and traditional glazed earthenware.

### Geometric Rules
- **Item Cards & Surface Panels:** Uniform `16px` (`1rem`) border radius, establishing soft structure that prevents visual harshness.
- **Interactive Controls (Buttons, Inputs, Selectors):** Standardized `12px` (`0.75rem`) radius for optimal thumb accessibility and modern cohesion.
- **Chips, Badges, & Navigation Pills:** Fully rounded `9999px` pill contours for tactile friction-free scrolling.
- **Image Frames:** `12px` interior radius when nested within cards, maintaining uniform concentric margins (`space-sm` / `8px` or `space-md` / `16px`).

## Components

### Buttons
- **Primary Action (e.g., "سفارش" / Add to Order):** Solid Cobalt Navy (`#00377B`) with crisp White (`#FFFFFF`) text, `12px` radius, and `12px 20px` padding. On active tap, transitions into a deeper indigo tone with subtle scale transform (`0.98`).
- **Secondary Action (e.g., "مشاهده جزئیات" / View Details):** Ochre Tint outline (`1.5px solid #BD8655`) with Ochre text (`#BD8655`) over a transparent or White background.
- **Accent Action (e.g., "پیشنهاد باریستا" / Special Recommendations):** Persian Turquoise (`#00A79D`) surface with White text, accompanied by an icon.

### Category Filter Chips
- **Inactive:** White background with subtle Warm Ochre border (`1px solid rgba(189, 134, 85, 0.2)`), secondary slate text, pill-shaped (`9999px`).
- **Active:** Cobalt Navy (`#00377B`) background, Pure White text, accompanied by a subtle turquoise micro-dot indicator on the right of the label (RTL layout).

### Menu Item Cards
- Structured dual-zone card in White (`#FFFFFF`):
  - **Content Zone:** Persian headline on the right, English/Latin designation below in muted typography, truncated ingredient synopsis, and highlighted price badge in Cobalt Navy.
  - **Media Zone:** Square aspect ratio (`1:1` or `4:3`) with soft `12px` corners, subtle warm vignette, and an optional Turquoise or Ochre ribbon for "Specialty" (ویژه) or "Museum Recipe" (دستور موزه).

### Price Badges
- Displayed with high visual weight at the bottom-left of the card (counterbalancing the RTL Persian title on the top-right). Formatted as: `[Amount in bold] [Toman in label-sm]`.

### Sticky Bottom Bar & Drawer
- Mobile order summary bar fixed to the bottom viewport with safe-area padding, glassmorphic Antique Cream backing, and a dual-split Cobalt button showcasing total item count and tally price.