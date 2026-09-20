# Copilot instructions – Matematikplattform

Static web app for math practice (Swedish school, students use iPad Air).
Hosted on GitHub Pages. Everything runs in the browser.

## Read first
- `STATUS.md` → find the CURRENT step. Work only on that step.
- `docs/ARCHITECTURE.md` – folders, modules, allowed libraries
- `docs/EXERCISE_SCHEMA.md` – exercise JSON format
- `docs/ANSWER_TYPES.md` – answer type modules and validation
- `docs/ACCESSIBILITY.md`, `docs/SECURITY_AND_PRIVACY.md`, `docs/TESTING.md` – read when the step touches UI, storage or tests

## Hard constraints
- Plain HTML5, CSS and JavaScript ES modules (`type="module"`). Bootstrap 5 for UI.
- No build step, no bundler, no frameworks (no React/Vue/jQuery).
- Only use libraries listed in `docs/ARCHITECTURE.md`. Do not add others.
- Relative paths only (`./data/x.json`). Never `/data/x.json` – the site is served from a sub-path.
- Never use `eval` or `new Function`. Evaluate expressions with math.js.
- Never put student input or JSON text into the DOM with `innerHTML`. Use `textContent`.
  Math is shown only through `renderMath(element)` (KaTeX).
- No login, no server. Progress is stored in `localStorage`, keys start with `mp:`.
- Never store names, free text or identifiers. Only anonymous counters (see `docs/SECURITY_AND_PRIVACY.md`).
- Exercise JSON is data only. Never put JavaScript code in JSON. Generators are looked up by name in code.
- Do not change a public data format without bumping `schemaVersion` and updating the schema and docs.

## Working method
- Make ONE small change at a time. Only touch files named in the task.
- Do not refactor, rename, reformat or "improve" code you were not asked to change.
- Do not add features, files or dependencies that were not requested.
- If the task is ambiguous: choose the simplest reading, state the assumption in one sentence, continue.
- When done: list changed files, give 2–3 manual test steps (VS Code Live Server), tick the box in `STATUS.md`.
- Write plain assert tests (`tests/index.html`) only for pure functions: number parsing, generators, `check()`.

## Before you finish – check
- Works without a backend and under a sub-path (no absolute `/` URLs)?
- Library versions pinned? No new dependency added?
- Works with touch AND keyboard?
- No personal data or secret added?
- Edge cases covered where the step has tests?

## Isolation rule (important)
- Each answer type is ONE file in `src/answer-types/` and follows the contract in `docs/ANSWER_TYPES.md`.
- An answer type must not import another answer type.
- Core code (`src/core/`) must not contain logic for a specific answer type.
- Adding a new answer type = new file + one line in `src/answer-types/registry.js`. Nothing else.
- The page layout (shell) is frozen after step 0. Answer types only write inside `#answer-area` and `#input-area`, never change the shell, and prefix their CSS classes with the type name.

## Code conventions
- Identifiers, comments, file names: English. UI text: Swedish, defined in `src/core/strings.js`.
- `const`/`let`, arrow functions, small pure functions. No global variables.
- Every module exports named functions or a default object. No side effects on import.
- Touch targets at least 44×44 px. iPad Air landscape (1180×820) is the reference size; portrait must work too.
- Everything must be usable with keyboard. Dragging always has an alternative (buttons, arrow keys or a number field).
- Feedback is text (not only colour) in an `aria-live="polite"` region. Keep visible focus outlines.
- Every input has a `label` or `aria-label` (also `<math-field>`).

## Math rules
- Swedish notation: decimal COMMA in UI and in JSON text (`1,5`). Coordinates/lists use semicolon: `(3; 4)`.
- Internally convert with `parseDecimal()` / `formatDecimal()` in `src/core/numbers.js`. Never use `parseFloat` on student input.
- Do arithmetic on decimals with math.js BigNumber, never with plain JS floats (`1.1 * 100` is `110.00000000000001`).
- Compare in mathematical coordinates (number line, coordinate system), never in pixels.
- Keep separate: exact value, tolerance, rounding and display format.
- Never create an answer key that cannot be derived from the generator parameters.
- LaTeX in JSON needs doubled backslashes: `"$\\frac{1}{2}$"`. Delimiters are `$...$` (inline) and `$$...$$` (display).
- In KaTeX a plain comma in math mode adds a space. `prepareMathText()` converts `digit,digit` to `digit{,}digit` inside math before rendering. Always call it.
