# STATUS

**CURRENT STEP: 0**  (change this number when a step is finished)

Rules for the agent: work on the current step only. Tick the box when done. Do not start the next step.

## Build plan
- [ ] **0. Complete layout shell** – build the FINAL page layout once, with no exercise logic (see `docs/ARCHITECTURE.md` → "Layout contract"). Includes:
  - header with three `form-select`; progress bar (task n of N, correct count); question card; answer card (`#answer-area`); input card (`#input-area`); feedback region (`aria-live`); result view (end of round); error box.
  - landscape (1180×820) and portrait (820×1180): input card beside the answer card in landscape, under it in portrait. Buttons "Kontrollera"/"Nästa" always visible.
  - fixed sizes for the areas so dynamic content cannot resize the page (answer area fills the remaining height).
  - dev-only mock panels: `?mock=numeric|sort|numberline|coordinate|expression` fills the two areas with static placeholder HTML (number line strip, square coordinate grid, sortable list, math field + keypad) so you can check that every type FITS on the iPad before any logic exists.
  - Acceptance: opens without console errors; each mock fits in both orientations without page scroll; layout files are then frozen (changes only when a step says so).
- [ ] **1. Numbers + rng** – `numbers.js` (`parseDecimal`, `formatDecimal`), `rng.js` (mulberry32, `makeRng(seed)`), `tests.html` with asserts (cases in `docs/ANSWER_TYPES.md`).
- [ ] **2. Manifest + loader** – `data/index.json` with one exercise, `manifest.js` fills the selects, `loader.js` fetches the JSON and applies defaults.
- [ ] **3. Math rendering** – `math-render.js`: `prepareMathText()` (comma fix) and `renderMath(el)`. Show `$$1{,}0 \cdot 10$$` correctly.
- [ ] **4. Template generator** – `generator.js` for `type: "template"` with math.js BigNumber, constraints, `distinct`, `keepTrailingZeros`.
- [ ] **5. Numeric answer type** – `keypad.js`, `numeric.js`, registry, feedback flow (attempts, next task, end-of-round result).
- [ ] **6. Local statistics** – `storage.js`, result per exercise, small summary in the UI.
- [ ] **7. First real exercises** – 3 JSON files for the first chapter. Test with students on iPad. **Stop and evaluate here.**
- [ ] **8. text + interval** types
- [ ] **9. sort** (SortableJS) and **match**
- [ ] **10. numberline** and **coordinate** (JSXGraph)
- [ ] **11. expression** (MathLive + Compute Engine)
- [ ] **12. Validation script + content workflow** – `schema/exercise.schema.json`, `tools/validate.mjs` (Ajv, dev-only), `docs/CONTENT_WORKFLOW.md` (prompt for generating exercise JSON with AI and a review checklist for AI-made exercises).
- [ ] **13. Responsive layout** for other devices.
- [ ] **14. Optional:** PWA/offline cache, libraries copied to `vendor/` with licence texts.

## Definition of done for an answer type
- One file, follows the contract, no imports from other answer types.
- Covered in the JSON Schema and one example exercise exists.
- `check()` has plain assert tests including edge cases.
- Works with touch and keyboard; drag has an alternative; ARIA names set.
- A broken JSON gives a readable error, not a blank page.
- Tested in Safari on a real iPad Air (landscape and portrait).

## Not now
Accounts and student registers, cloud sync, teacher dashboard, adaptive difficulty, secure examination, analytics/tracking.

## To verify early (on a real iPad, GitHub Pages URL)
- [ ] Relative paths work when served from `https://<user>.github.io/<repo>/`.
- [ ] Native iPad keyboard does not appear over the custom keypad.
- [ ] KaTeX shows `1{,}5` without extra space after the comma.
- [ ] MathLive: fonts load from CDN; decimal comma input works (check the `decimalSeparator` option; otherwise normalize `,` → `{,}` on input).
- [ ] MathLive virtual keyboard can be reduced to the keys the exercise needs.
- [ ] MathLive keyboard can be shown inside the input card (`mathVirtualKeyboard.container`), otherwise reserve bottom space so it does not cover the answer area.
- [ ] Compute Engine `isEqual()` gives the expected result for the expression test cases.
- [ ] Load time on school Wi-Fi is acceptable (lazy loading works).
- [ ] Compute Engine: how assumptions (e.g. x is real) are set, and whether `x/x` equals `1`. Decide the policy and write it in `docs/ANSWER_TYPES.md`.
- [ ] Portrait and landscape rotation, safe areas, zoom.

## Decisions
- Core + one file per answer type; exercises are JSON data.
- Bootstrap 5.3, KaTeX (text), MathLive + Compute Engine (expression input), math.js (evaluation/units), SortableJS, JSXGraph.
- Swedish notation: decimal comma, semicolon in coordinates.
- No login; statistics in localStorage only.

## Notes / problems
-
