---
name: Editorial Finance
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#464555'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f0f1f1'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#555f6f'
  on-secondary: '#ffffff'
  secondary-container: '#d6e0f3'
  on-secondary-container: '#596373'
  tertiary: '#7e3000'
  on-tertiary: '#ffffff'
  tertiary-container: '#a44100'
  on-tertiary-container: '#ffd2be'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#d9e3f6'
  secondary-fixed-dim: '#bdc7d9'
  on-secondary-fixed: '#121c2a'
  on-secondary-fixed-variant: '#3d4756'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb695'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7b2f00'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  h1:
    fontFamily: Pretendard
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.3'
  h2:
    fontFamily: Pretendard
    fontSize: 22px
    fontWeight: '700'
    lineHeight: '1.4'
  body-main:
    fontFamily: Pretendard
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.7'
  body-excerpt:
    fontFamily: Pretendard
    fontSize: 15px
    fontWeight: '400'
    lineHeight: '1.6'
  meta:
    fontFamily: Pretendard
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  label:
    fontFamily: Pretendard
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-max: 720px
  gutter: 24px
  margin-page: 20px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
This design system prioritizes legibility and clarity, blending the spacious, focused atmosphere of Medium with the structured efficiency of modern curated blogs. The brand personality is professional and authoritative yet accessible, designed to make complex financial information feel digestible. 

The design style is **Minimalist Editorial**. It leverages significant whitespace, a strict monochromatic base with a single high-contrast accent, and a focus on typographic hierarchy over decorative elements. The goal is to eliminate visual noise so that the reader can focus entirely on the content.

## Colors
The palette is rooted in high-contrast utility. The primary background uses a soft off-white (#fafafa) to reduce eye strain compared to pure white, while body text remains pure black (#000000) for maximum readability. 

**Indigo (#4f46e5)** serves as the sole functional accent, used exclusively for interactive elements like links and category indicators. For dark mode, the background shifts to a deep charcoal (#121212) with surfaces at #1e1e1e, maintaining the same indigo accent but adjusted for optimal luminosity against dark backgrounds. Secondary neutrals are pulled from the #F1F5F9 and #6B7280 range for subtle borders and meta-information.

## Typography
The system utilizes **Pretendard** exclusively to ensure seamless rendering of both Latin and Korean characters. The hierarchy is strictly defined: **H2 titles (22px bold)** act as the primary anchor for post lists, while the **body excerpt (15px)** uses a slightly lighter grey to create visual separation from the title. **Meta info (13px)** provides context without competing for attention. Line heights are generous (1.6 to 1.7 for body text) to support long-form reading and professional tone.

## Layout & Spacing
The layout follows a **fixed-width, single-column approach** for the main content stream to emulate an editorial reading experience. The maximum container width is capped at 720px to maintain optimal line lengths for readability. 

Vertical rhythm is established through a consistent 8px baseline grid. Post cards are stacked vertically with subtle 1px dividers. Category navigation uses a horizontal scrolling layout at the top of the feed, allowing for many categories without vertical clutter.

## Elevation & Depth
In line with the minimalist editorial aesthetic, this system avoids traditional drop shadows. Depth is conveyed through **low-contrast outlines** and **tonal layering**. 

- **Level 0 (Background):** #fafafa.
- **Level 1 (Cards/Inputs):** #ffffff with a 1px solid border (#e5e7eb).
- **Interactions:** Subtle background shifts (e.g., #fafafa to #f3f4f6 on hover) replace elevation changes. 
Dividers should be 1px solid lines using #f1f5f9 to create structure without breaking the flow of the page.

## Shapes
Shapes are conservative and "soft" (0.25rem - 0.5rem) to maintain a professional, trustworthy appearance.
- **Post Thumbnails:** 120x80px with a 4px (0.25rem) radius.
- **Buttons & Chips:** 20px (full pill) height for chips, but standard 4px - 8px radius for larger buttons.
- **Inputs:** 4px radius to align with the geometric nature of the typography.

## Components

### Post Cards
Vertical stack containing:
- **Top Row:** Thumbnail (left, 120x80) and Content (right).
- **Title:** H2 22px, max 2 lines.
- **Excerpt:** Body 15px, max 3 lines.
- **Footer:** Meta 13px (Date, Read Time, Category Tag).

### Category Chips
Horizontal scrolling container. Chips are text-only or have a very light background (#f1f5f9). Active state uses the Indigo accent (#4f46e5) for the text and a bottom-border indicator.

### Buttons
Primary buttons are solid Indigo (#4f46e5) with white text. Secondary buttons use a ghost style with a 1px #e5e7eb border.

### Pagination
Simple "Previous / Next" text links or numbered list at the bottom of the feed. Numbers are spaced generously; the current page is indicated by a bold weight and Indigo underline.

### Subtle Dividers
Horizontal lines used between post cards: 1px height, #f1f5f9 color, full width of the content container.