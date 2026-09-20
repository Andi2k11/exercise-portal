# Testing

Validation and generation are the riskiest parts. Test them as pure functions before testing the UI.
No test framework needed: `tests/index.html` runs plain asserts and prints PASS/FAIL (open with Live Server).

## Levels
1. Unit: number parsing/formatting, generators, `check()` of each answer type.
2. Contract: every exercise JSON validates against the schema and uses a registered answer type (`tools/validate.mjs`).
3. Component: the right answer area and keypad are created.
4. Manual on a real iPad: touch, rotation, keyboard, zoom, Safari.

## Numbers (must have tests)
`1,5` and `1.5`; negative; zero; very small/large; empty string; several decimal separators; `NaN`, `Infinity`, `1e3` rejected;
`1 000` handled; tolerance; exact decimals versus rounding; `1,1 × 100` equals `110` (no float error).

## Expressions
- `2x` and `x+x` equivalent when intended; `2x+4`, `4+2x`, `2(x+2)`, `x*2+4`.
- Different but equivalent fractions; implicit multiplication; Swedish decimal input; syntax errors.
- Domain cases such as `x/x` versus `1`: verify what Compute Engine does, decide the policy, document it.
- Symbolic comparison first; numeric sampling at safe points as a fallback. Sampling alone is not proof.

## Number line and coordinates
Different screen sizes and zoom; touch near the tolerance limit; exact hit; negative scales; reversed axes;
keyboard alternative to dragging. Compare model coordinates, never pixels.

## Regression
When a bug is found, first add a test that reproduces it, then fix it.
