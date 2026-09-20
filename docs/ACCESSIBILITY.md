# Accessibility and iPad

Bootstrap solves layout, not accessibility. Every interaction must work without precise dragging.

## iPad (reference: iPad Air, Safari)
- Touch targets at least 44×44 CSS px. Never rely on hover.
- Use `min-height: 100dvh`, not fixed heights. Respect `env(safe-area-inset-*)`.
- Test portrait and landscape. On narrow screens the answer/input cards move under the question.
- Keep the "Kontrollera" button visible and reachable.
- Custom keypad instead of the native keyboard: `inputmode="none"` on plain inputs; MathLive virtual keyboard policy for math fields.
- Disable double-tap zoom on buttons with `touch-action: manipulation`.

## Semantics
- One `h1` per page. Question in a `section` with `aria-labelledby`.
- Every input has a `label` or `aria-label`, including each `<math-field>`.
- Feedback in an `aria-live="polite"` region. Errors are text, never only colour; combine colour + icon + text.
- Move focus carefully after a new task or a wrong answer. Keep a visible focus outline.

## Math
- Give static formulas a readable text alternative when the expression is complex.
- MathLive provides an accessible representation; set an ARIA name on the field.

## Colour and motion
- Check contrast for text, focus and error markers.
- Respect `prefers-reduced-motion`. No time limits by default.

## Alternatives to dragging
See `ANSWER_TYPES.md` → "Alternatives to dragging".
