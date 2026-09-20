# Architecture

## Idea
A small **core** + one **plugin file per answer type** + **one JSON file per exercise**.
The core never knows how a number line works; it only asks the answer type to mount, read and check.

```
index.html
assets/css/app.css
data/
  index.json                         # manifest: book -> chapter -> exercise (drives the dropdowns)
  matte-direkt-7/kapitel-1/multiplicera-10-100-1000.json
src/
  main.js                            # start-up
  core/
    app.js                           # state + flow (select exercise, next task, finish)
    manifest.js  loader.js           # fetch index.json / exercise JSON, apply defaults
    generator.js                     # build tasks from generator config
    rng.js                           # seeded random (mulberry32, ~5 lines, no library)
    numbers.js                       # parseDecimal, formatDecimal (Swedish comma)
    math-render.js                   # prepareMathText(), renderMath(el) using KaTeX
    storage.js                       # localStorage wrapper, prefix "mp:"
    strings.js                       # all Swedish UI text
  ui/
    layout.js                        # header selects, question card, answer card, input card
    keypad.js                        # builds Bootstrap keypad from key names
  answer-types/
    registry.js                      # { numeric, text, ... }
    numeric.js text.js interval.js sort.js match.js numberline.js coordinate.js expression.js
  generators/                        # optional custom generators, one file each
schema/exercise.schema.json          # JSON Schema (dev-time validation)
tools/validate.mjs                   # Node + Ajv, run in VS Code only, never shipped
tests/index.html                     # plain assert tests for pure functions
docs/                                # this documentation
vendor/                              # optional: local copies of libraries (see below)
```

## Layout (Bootstrap 5.3)
Reference: iPad Air landscape 1180×820 CSS px (portrait 820×1180 must also work).

- Header: `row` with three `form-select` (book, chapter, exercise).
- Main card (`card`): question area, same for every exercise (prompt + expression, KaTeX).
- Bottom `row`: answer card (`col-8`) and input card (`col-4`). Both are emptied and refilled by the answer type.
- Progress (task n of N, correct count) in a slim bar or badge row.
- `meta viewport` with `width=device-width, initial-scale=1`; CSS `touch-action: manipulation` on buttons.
- Later: responsive breakpoints for phones/laptops. Keep sizes in CSS variables so this is easy.

## Layout contract (built first, then frozen)
The shell is built once in `index.html` + `assets/css/app.css` + `src/ui/layout.js`. Answer types only FILL it.

| Region | Element id | Owner |
|---|---|---|
| Header selects | `#select-book`, `#select-chapter`, `#select-exercise` | core |
| Progress | `#progress` | core |
| Question | `#question-area` (prompt + expression) | core |
| Answer | `#answer-area` | answer type |
| Input | `#input-area` | answer type |
| Feedback | `#feedback` (`aria-live="polite"`) | core |
| Actions | `#btn-check`, `#btn-next` | core |
| Round result | `#result-view` | core |
| Error box | `#error-box` | core |

Rules:
- An answer type writes only inside `#answer-area` and `#input-area`. It never creates cards, changes sizes or edits global CSS. Its own CSS classes are prefixed with the type name (`.nl-` for number line, `.cs-` for coordinate system).
- `#answer-area` fills the remaining height; content scales inside it (number line and coordinate system use a container with fixed aspect ratio).
- `#input-area` has a fixed width in landscape (`col-4`) and goes under the answer area in portrait.
- The layout must not jump when content changes between tasks (fixed min-heights).
- The MathLive virtual keyboard is shown inside `#input-area` if `mathVirtualKeyboard.container` works; otherwise reserve space at the bottom so it never covers the answer area.
- Mock panels (`?mock=<type>`) exist only to check fit. Remove or keep behind the query flag.

## Data flow
1. `manifest.js` loads `data/index.json` → fills the three selects.
2. Student picks exercise → `loader.js` fetches the JSON, applies defaults, checks required fields.
3. `generator.js` builds `count` tasks: `{ questionText, expressionLatex, answer, meta }`.
4. `app.js` shows task → `renderMath()` on the question area.
5. `registry[answerType].mount({ answerEl, inputEl, task, config, onSubmit })` draws answer area + input panel.
6. On submit: `check(answer, task, config)` → feedback → next task → at the end: result + `storage.js`.

## Libraries
Load from CDN with an EXACT pinned version (never `@latest`). Look up versions on jsdelivr.com and fill in the table.
Heavy libraries are loaded lazily with `import()` only when the answer type needs them (fast start on iPad).

| Library | Use | Loaded | Pinned version |
|---|---|---|---|
| Bootstrap 5.3 (CSS, JS bundle only if modal/toast needed) | layout, forms, buttons, cards | always | TODO |
| KaTeX + auto-render extension | LaTeX in questions, feedback, answer previews | always | TODO |
| math.js | safe evaluation of `answer` expressions, BigNumber, fractions, units (value with unit) | when generating / numeric / unit | TODO |
| MathLive (`<math-field>`) | LaTeX answer input with customizable virtual keyboard, exports LaTeX | `expression` type only | TODO |
| Cortex Compute Engine (`@cortex-js/compute-engine`) | parse student LaTeX, compare with `isEqual()` | `expression` type only | TODO |
| SortableJS | drag to sort, touch-friendly | `sort` type only | TODO |
| JSXGraph | number line and coordinate system with draggable, snapping points | `numberline`, `coordinate` only | TODO |

Not used on purpose: MathJax (heavier and slower than KaTeX), React/Vue, jQuery, any backend.
Alternative for number line / coordinate if JSXGraph is too heavy: hand-written SVG (~150 lines each).

### Loading notes
- KaTeX: css + js + `contrib/auto-render`. Delimiters: `$$..$$` (display), `$..$` (inline).
  Call `renderMath(el)` after every dynamic content update.
- MathLive: needs its fonts. If fonts fail to load from CDN, set `MathfieldElement.fontsDirectory` or copy the package to `vendor/`.
- If school Wi-Fi is unreliable, copy the pinned libraries to `vendor/` and change the URLs in one file (`src/core/libs.js`). Keep all library URLs in that single file.

## Rules that keep exercises from breaking each other
- One answer type = one file, stable contract (see `ANSWER_TYPES.md`).
- Exercises are pure data (JSON). Custom generators live in `src/generators/`, one file each.
- Core has no `if (answerType === ...)`.
- Every JSON is validated against the schema before publishing (`tools/validate.mjs`).
- Do NOT run Ajv in the browser: Ajv builds its validators with `new Function`, which this project forbids. The browser only does a light check of required fields in `loader.js` and shows a readable error box instead of crashing.
- A failing exercise or answer type shows an error box; the rest of the page keeps working.
- State is owned by `app.js` (idle → loading → presenting → answered → feedback → completed), not by buttons or DOM elements.

## Related documents
`ACCESSIBILITY.md`, `SECURITY_AND_PRIVACY.md`, `TESTING.md`.
