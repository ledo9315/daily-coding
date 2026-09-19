# Landing product tour

The public homepage now leads with registration, a localized dashboard preview, a three-tab product tour, a small interactive code exercise, account benefits, FAQ, and a closing invitation. Guest challenge links remain available. The authenticated dashboard is unchanged.

## Visual direction

Keep the existing navy (#0d1117), lime (#c4fe4d), and violet identity (#b49af4 for readable accents), with pale foreground (#eef1f8) and muted copy (#a7afc0). Use a clean system sans for marketing copy, the existing pixel type for branding and the illustration caption, and JetBrains Mono for the exercise. A split hero puts the real product next to the promise; a full-width tour and an illustrated progression section provide distinct visual rhythms.

21st MCP was not exposed in the session. Public references consulted instead:
- https://21st.dev/blog/react-tabs-components
- https://21st.dev/@coss.com/components/tabs/with-icons

The tour is an original implementation with the existing Radix tabs and dialog dependencies, not imported registry code. It supports keyboard tab selection, modal focus containment, Escape, and focus return. No dependency changes.

## Images

The user-supplied Desktop/daily-coding posters became `public/landing/dashboard-tour.webp`, `editor-tour.webp`, and `profile-tour.webp`, compressed without changing content. They are explicitly labeled as example views in English in both locales. The hero uses the existing locale-specific dashboard screenshot. The closing artwork reuses `public/pixel/banner3.webp`.

`public/landing/level-up.webp` was generated with the built-in image generation tool and compressed to WebP. All four new assets together are approximately 530 KB. Original generation prompt:

> Use case: stylized-concept. Asset type: illustration for the Daily Coding programming challenge website. Create a beautiful detailed pixel-art diorama, wide 3:2 composition: a small brave adventurer coder with a purple backpack climbing three floating stone platforms toward a glowing lime green terminal-shaped trophy showing only the symbol >_. A tiny orange flame companion on the first platform, violet crystals, a few golden pixel stars. World-building inspired by high-quality indie RPG pixel art, crisp intentional square pixels, dimensional shaded objects, no blur. Midnight navy #0d1117 background, violet #a371f7 shadows, lime #c4fe4d highlights, subtle amber details. Main composition centered with ample dark negative space around objects, studio-quality game key art, joyful feeling of steady progress. No words, no letters beyond >_, no watermark, no UI, no frame. This is an illustration of a daily coding habit and leveling up.

## Verification

- Vitest covers registration and guest links, both locales, initial tab semantics, demo's initial disabled state, successful evaluation including zero/negative inputs, wrong answers, and invalid selections.
- The legacy tests requiring the old animated grid, meteors, border beam, and registration-free primary CTA were updated to the new requirements. Shared decorative-component tests remain.
- The performance checks guard reduced motion, absence of perpetual decorative renderers, and a combined 650 KB budget for the new assets.
- Browser checks: desktop 1440 px, mobile 390 px; tour switching by click and arrow key; modal open and Escape close; incorrect and correct demo answers; reset restores the disabled test button; registration route; English page; mobile horizontal overflow.

The mini challenge is a fixed local exercise; it never evaluates arbitrary visitor code, calls the execution API, or awards real account points. The landing makes that distinction explicit. Registration uplift is a hypothesis, not a measured result.
