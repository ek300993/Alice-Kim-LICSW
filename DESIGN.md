---
name: Therapy & Coaching Design System
colors:
  surface: '#fdf9f1'
  surface-dim: '#dddad2'
  surface-bright: '#fdf9f1'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3eb'
  surface-container: '#f1ede6'
  surface-container-high: '#ebe8e0'
  surface-container-highest: '#e6e2da'
  on-surface: '#1c1c17'
  on-surface-variant: '#404849'
  inverse-surface: '#31302b'
  inverse-on-surface: '#f4f0e8'
  outline: '#70787a'
  outline-variant: '#c0c8c9'
  surface-tint: '#38656b'
  primary: '#245359'
  on-primary: '#ffffff'
  primary-container: '#3e6b71'
  on-primary-container: '#bbeaf1'
  inverse-primary: '#a0ced5'
  secondary: '#54634c'
  on-secondary: '#ffffff'
  secondary-container: '#d7e8ca'
  on-secondary-container: '#5a6951'
  tertiary: '#4d4d3c'
  on-tertiary: '#ffffff'
  tertiary-container: '#666553'
  on-tertiary-container: '#e5e3cc'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#bcebf1'
  primary-fixed-dim: '#a0ced5'
  on-primary-fixed: '#001f23'
  on-primary-fixed-variant: '#1e4d53'
  secondary-fixed: '#d7e8ca'
  secondary-fixed-dim: '#bbccaf'
  on-secondary-fixed: '#121f0d'
  on-secondary-fixed-variant: '#3c4b35'
  tertiary-fixed: '#e6e3cd'
  tertiary-fixed-dim: '#c9c7b2'
  on-tertiary-fixed: '#1c1c0f'
  on-tertiary-fixed-variant: '#484837'
  background: '#fdf9f1'
  on-background: '#1c1c17'
  surface-variant: '#e6e2da'
typography:
  display:
    fontFamily: newsreader
    fontSize: 48px
    fontWeight: '500'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: newsreader
    fontSize: 36px
    fontWeight: '500'
    lineHeight: '1.2'
  headline-md:
    fontFamily: newsreader
    fontSize: 28px
    fontWeight: '500'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: newsreader
    fontSize: 22px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.7'
  body-md:
    fontFamily: manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-lg:
    fontFamily: manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  display-mobile:
    fontFamily: newsreader
    fontSize: 34px
    fontWeight: '500'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: newsreader
    fontSize: 28px
    fontWeight: '500'
    lineHeight: '1.3'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1140px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 24px
  section-gap: 120px
---

## Brand & Style
The design system is rooted in the intersection of professional clinical expertise and organic human growth. It evokes a sense of "grounded tranquility"—a space that feels both medically safe and emotionally inviting. 

The aesthetic follows a **Modern Minimalist** movement with **Organic** influences. It prioritizes clarity and calm through generous whitespace, avoiding the "clutter" often associated with mental health resources. The goal is to reduce cognitive load for users who may be seeking support during stressful life transitions. Visual elements leverage subtle natural asymmetries and soft transitions to mirror the non-linear path of personal healing.

## Colors
The palette is a sophisticated refinement of the source brand, optimized for premium depth and accessibility (WCAG AA compliance).

- **Primary (Slate Blue):** A deepened version of the original teal (#3E6B71), used for primary actions and core branding to convey stability and clinical experience.
- **Secondary (Muted Sage):** A natural green (#8A9A80) used for secondary accents, symbolizing growth and renewal.
- **Tertiary (Warm Sand):** A soft, desaturated beige (#D8D6C0) used for subtle dividers and decorative elements.
- **Neutral (Parchment):** The foundation (#FDF9F1) provides a warmer, more human alternative to clinical white, reducing eye strain.
- **Text:** High-contrast charcoal (#202020) ensures legibility across all age groups.

## Typography
The typography strategy creates a dialogue between tradition and modernity. 

**Newsreader** serves as the headline face; its academic and editorial roots signal the "Evidence-Based" nature of the practice while remaining warm and literary. 

**Manrope** is used for all functional text. It is a highly legible, modern sans-serif that balances the classicism of the headings with a contemporary, accessible feel. 

Line heights are intentionally generous (1.6x+) to facilitate easier reading and reinforce the design system's spacious, unhurried atmosphere. Display styles use slightly tighter letter-spacing for a curated, premium editorial look.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy on desktop to maintain a feeling of containment and security. 

- **Grid:** A 12-column grid with a 1140px maximum width.
- **Rhythm:** An 8px base unit governs all spatial relationships. 
- **Whitespace:** Section gaps are exceptionally large (120px on desktop) to allow the content to "breathe" and prevent visual overwhelm.
- **Adaptivity:** On mobile, margins reduce to 24px and the grid collapses to a single-column stack, ensuring that the nature-inspired imagery remains impactful without crowding the text.

## Elevation & Depth
This design system avoids heavy drop shadows in favor of **Tonal Layers** and **Ambient Depth**. 

Hierarchy is established by placing primary content on slightly different neutral tones (e.g., a sage-tinted card on a cream background). When shadows are used, they are "Ambient Shadows": extremely diffused, with low opacity (5-8%) and a subtle tint of the primary slate color. This mimics natural, soft sunlight rather than a digital interface. 

Backdrop blurs are used sparingly on navigation elements to provide a sense of glass-like transparency, maintaining a connection to the background content even when scrolling.

## Shapes
The shape language is primarily **Rounded**, but utilizes **Subtle Asymmetry** for decorative elements.

- **UI Elements:** Buttons and input fields use a consistent 0.5rem radius, providing a soft but professional touch.
- **Image Treatment:** High-quality nature photography should be masked using "Pebble" shapes—soft, non-geometric ovals that feel organic rather than clinical.
- **Cards:** Large containers (like testimonials or service blocks) use a 1rem (16px) radius to feel welcoming.

## Components
- **Buttons:** Primary CTAs are solid Slate Blue with Manrope Medium text. Secondary buttons use a Sage Green "Ghost" style (outline only) to maintain a lighter visual weight.
- **Cards:** Elegant, high-padding containers with a subtle 1px border in the Tertiary (Warm Sand) color. They use "Ambient Shadows" to appear softly lifted.
- **Navigation:** A minimalist, "floating" navigation bar with center-aligned links. It uses a high-blur backdrop filter to stay legible over imagery.
- **Input Fields:** Soft cream backgrounds with Sage Green focus states. Labels are always placed above the field in Label-LG typography for maximum clarity.
- **Nature Accents:** Use high-resolution, desaturated nature imagery (forest floors, calm water, stone textures). These should be treated as functional components that provide "visual rest" between information-heavy sections.
- **Testimonial Sliders:** Minimalist controls (thin arrows) with large-scale Newsreader serif quotes to emphasize the human voice.