# Tailwind CSS v4 Rules for Antigravity

- **Gradients**: Use `bg-linear-to-*`, never `bg-gradient-to-*`.
- **Equal Dimensions**: Use `size-{n}` instead of `w-{n} h-{n}` (e.g. `size-10`, `size-8`, `size-7`).
- **Standard Scale**: Avoid arbitrary bracket dimensions (e.g. `w-[40px]`). Divide pixels by 4 (e.g. `w-10`, `min-w-5`, `min-h-5`).
- **Aspect Ratio**: Use `aspect-4/3` instead of `aspect-[4/3]`.
- **Z-Index**: Use `z-999` instead of `z-[999]`.
- **Single Display**: Never use multiple conflicting display utilities on a single element (e.g., avoid `block flex`, use only `flex`).
