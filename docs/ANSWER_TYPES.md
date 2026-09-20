# Answer types and validation

## Contract
Every file in `src/answer-types/` default-exports this object:

```js
export default {
  type: 'numeric',
  defaultKeys: ['digits', 'comma', 'minus', 'backspace', 'clear', 'enter'],

  // Draws the answer area and the input panel. Returns a handle.
  mount({ answerEl, inputEl, task, config, keys, onSubmit }) {
    return {
      getAnswer() { /* current student answer */ },
      reset() {},
      setDisabled(disabled) {},
      destroy() {}
    };
  },

  // Pure function. No DOM.
  check(answer, task, config) {
    return { correct: true, reason: null, expected: '10' };
    // reason: 'wrong' | 'parse' | 'empty' | 'unit' | 'format'
  }
};
```

Rules:
- `check()` is pure and unit-testable. Never touch the DOM there.
- `reason: 'parse'` means "could not read the answer" → tell the student to check how it is written; do NOT count as wrong attempt.
- `expected` is a display string (Swedish format, may contain LaTeX) for "show correct answer".
- Text from the student is shown with `textContent` or through KaTeX, never `innerHTML`.

## Input keys (used by `src/ui/keypad.js`)
`digits`, `comma`, `minus`, `plus`, `times`, `divide`, `equals`, `parens`, `power`, `sqrt`, `fraction`,
`var:x` (any letter as a key), `backspace`, `clear`, `left`, `right`, `enter`.
Exercises may override with `"input": { "keys": [...] }`.
On iPad the native keyboard must not appear: plain inputs get `inputmode="none"` and `readonly`-like behaviour, MathLive uses its own virtual keyboard policy.

## Shared number handling (`src/core/numbers.js`)
- `parseDecimal(str)`: trim; remove spaces (thousand separators, "1 000"); accept `,` or `.`; accept leading `-`; reject everything else → `null`. Returns a canonical decimal string, not a float.
- `formatDecimal(value, { decimals, keepTrailingZeros })` → Swedish string with comma.
- Compare with math.js BigNumber (`equal`, or `abs(a-b) <= tolerance`).

## Types

### numeric – a value
Config: `tolerance` (default 0), `format`: `"any"` | `"integer"` | `{ "decimals": 2 }` (exact number of decimals required), `unit` (optional, see below).
Check: parse → compare to `task.answer`. `1,50` and `1,5` are both correct unless `format` demands decimals.

### numeric with unit
Config: `unit: { "expected": "cm", "input": "keys" | "select", "options": ["mm","cm","dm","m"], "acceptEquivalent": true }`.
Check: value and unit both must be right. With `acceptEquivalent`, use math.js units (`100 cm` = `1 m`). Wrong unit → `reason: 'unit'`.

### interval – any value inside a range
Config: `min`, `max`, `inclusive: [true, true]`. Answer is valid if it lies inside. (`task.answer` may hold the range.)

### text
Config: `accept: ["m/s", "m per s"]`, `caseSensitive: false`, `trim: true`, `collapseSpaces: true`.
For units written as text and short words. Compare after normalization.

### sort
Task: `answer` is the correct order (array). Config: `direction: "asc" | "desc"` (if items are numbers, the engine sorts them itself).
UI: SortableJS list + "Kontrollera". Check: same order as expected (equal values are interchangeable).

### match
Task: `answer` is a list of pairs `[["kilo","10^3"], ...]`. Config: `shuffle: true`.
UI: tap left item, then tap right item to pair (more reliable on touch than drag). Check: all pairs correct.

### numberline
Config: `min`, `max`, `step` (grid), `mode: "exact" | "approx"`, `tolerance` (approx only, absolute), `snap: true` (exact), `labels: "ends" | "all" | "none"`.
UI: JSXGraph line with one draggable point. Check: exact → equal to answer after snapping; approx → `abs(x - answer) <= tolerance`.

### coordinate
Config: `xRange`, `yRange`, `grid: 1`, `snap: true`, `tolerance` (0 when snapping), `mode: "place" | "read"` ("read" = type coordinates for a shown point; use semicolon `(3; 4)`).
Check: point equals answer within tolerance.

### expression – expression, algebra, equation
Input: MathLive `<math-field>` with a custom virtual keyboard (only needed keys).
Config: `variables: ["x"]`, `mode: "equivalent" | "exact-form"`, `forbid: ["("]`, `require: []`, `samples: 8`.
Check pipeline (`expression.js`):
1. `latex = field.value`. Normalize: `{,}` and `,` between digits → `.`; remove `\left`/`\right`; trim.
2. Empty → `reason: 'empty'`. Parse with Compute Engine (`ce.parse(latex)`); invalid → `reason: 'parse'`.
3. `equivalent`: `student.isEqual(expected)`. If that is not conclusive, evaluate both at `samples` random values of each variable (avoid 0, avoid division by zero) and compare with small tolerance.
4. `exact-form` (e.g. "expand", "factor"): after step 3 succeeds, also check `forbid` / `require` on the normalized LaTeX (for example an expanded answer must not contain `(`).
5. Equation answers ("solve for x"): ask for `x = value` and treat as `numeric`. For "write the equation", compare `lhs - rhs` up to a constant factor by sampling. Do this last.

## Alternatives to dragging (required)
- sort: up/down buttons on each item, plus drag.
- match: tap-tap pairing (no drag).
- numberline: arrow keys move the point one step, `−`/`+` buttons, and a number field; the current value is always visible and the step size is explained.
- coordinate: arrow keys, `−`/`+` buttons or two number fields (x and y).

## Feedback flow (in core, not in the types)
- Feedback is text plus icon (not only colour) in an `aria-live="polite"` region.
- Correct → positive feedback, next task.
- `parse`/`empty` → hint text, attempt not consumed.
- Wrong → attempt consumed; after `attempts` failures show `expected` (if `showCorrectAnswer`) and go on.
- Round result: `{ exerciseId, date, correct, total }` appended in `storage.js` (last 50 per exercise).

## Test cases to keep for `check()` (write as plain asserts in a `tests.html` page)
numeric: `"10"`, `"10,0"`, `" 10 "`, `"1 000"`, `"10,"`, `"abc"`, `""`, `"1e3"` (must be parse error).
expression: `2x+4` vs `4+2x` vs `2(x+2)` vs `x*2+4`; `2x+4` vs `2x+5`.
