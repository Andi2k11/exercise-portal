# Exercise JSON schema

One file per exercise in `data/<book>/<chapter>/<id>.json`. Menus are built from `data/index.json`.

## Manifest `data/index.json`
```json
{
  "schemaVersion": 1,
  "books": [
    {
      "id": "matte-direkt-7",
      "title": "Matte Direkt 7",
      "chapters": [
        {
          "id": "kapitel-1",
          "title": "Kapitel 1",
          "exercises": [
            { "id": "md7-k1-multiplicera-10-100-1000",
              "title": "Multiplicera med 10, 100 och 1000 (Decimaltal)",
              "file": "matte-direkt-7/kapitel-1/multiplicera-10-100-1000.json" }
          ]
        }
      ]
    }
  ]
}
```

## Exercise file

| Field | Required | Default | Meaning |
|---|---|---|---|
| `schemaVersion` | yes | – | Integer, currently `1`. Bump when the format changes in a breaking way. |
| `id` | yes | – | Unique, kebab-case. Same as in manifest. Used as localStorage key. |
| `title` | yes | – | Shown in the dropdown. |
| `answerType` | yes | – | `numeric`, `text`, `interval`, `sort`, `match`, `numberline`, `coordinate`, `expression` |
| `generator` | yes | – | How tasks are made (see below). |
| `prompt` | no | `""` | Instruction above the expression. Plain text, may contain `$...$`. |
| `count` | no | `10` | Number of tasks in one round. |
| `answerConfig` | no | `{}` | Settings for the answer type (see `ANSWER_TYPES.md`). |
| `input` | no | type default | Overrides which keys the input panel shows, e.g. `{ "keys": ["digits","comma","backspace","enter"] }`. |
| `attempts` | no | `2` | Tries per task before the correct answer is shown. |
| `showCorrectAnswer` | no | `true` | Show correct answer after the last failed attempt. |
| `hint` | no | – | Text (may contain LaTeX) shown by a hint button. |
| `seed` | no | random | Fixed seed = same tasks every time (debugging). |
| `tags` | no | `[]` | Free labels. |
| `status` | no | `"published"` | `"draft"` exercises are hidden in the menus unless the URL has `?draft=1`. |

## Generator

### `template` – random values inserted in a template
```json
"generator": {
  "type": "template",
  "template": "$${a} \\cdot {b}$$",
  "params": {
    "a": { "min": 0.1, "max": 99, "decimals": { "min": 1, "max": 2 }, "keepTrailingZeros": true },
    "b": { "oneOf": [10, 100, 1000] }
  },
  "constraints": ["a * b < 100000"],
  "answer": "a * b",
  "distinct": true
}
```

Param types:
- Number: `min`, `max` (required), `step`, `integer: true`, `decimals: 2` (exactly) or `{ "min": 1, "max": 2 }`, `exclude: [0]`, `keepTrailingZeros` (shows `1,0` instead of `1`).
- Choice: `{ "oneOf": [10, 100, 1000] }`
- Derived: `{ "expr": "a * 2" }` (may use earlier params)

Other fields:
- `constraints`: math.js boolean expressions; a task is re-drawn until all are true (max 200 tries, then error).
- `answer`: math.js expression using the params. Evaluated with BigNumber. Never JS floats.
- `distinct`: no duplicate tasks in one round (default `true`).
- Placeholders `{a}` are replaced by the Swedish-formatted value (comma). Inside `$...$` the engine makes it KaTeX-safe.

### `static` – fixed list
```json
"generator": {
  "type": "static",
  "shuffle": true,
  "tasks": [
    { "template": "$$\\frac{1}{2}$$", "answer": "0,5" },
    { "template": "$$\\frac{3}{4}$$", "answer": "0,75" }
  ]
}
```
Use for sort/match/number line when the sets are hand-made. The shape of `answer` depends on the answer type.

### `custom` – own function
```json
"generator": { "type": "custom", "name": "fractionAdd", "params": { "maxDenominator": 12 } }
```
Loads `src/generators/fractionAdd.js`, which exports `generate(rng, params)` and returns
`{ template, answer, meta }`. Use only when `template` is not enough.

## Full example (numeric)
```json
{
  "schemaVersion": 1,
  "id": "md7-k1-multiplicera-10-100-1000",
  "title": "Multiplicera med 10, 100 och 1000 (Decimaltal)",
  "answerType": "numeric",
  "prompt": "Beräkna produkten av följande tal",
  "count": 10,
  "generator": {
    "type": "template",
    "template": "$${a} \\cdot {b}$$",
    "params": {
      "a": { "min": 0.1, "max": 99, "decimals": { "min": 1, "max": 2 }, "keepTrailingZeros": true },
      "b": { "oneOf": [10, 100, 1000] }
    },
    "answer": "a * b"
  },
  "answerConfig": { "tolerance": 0, "format": "any" },
  "input": { "keys": ["digits", "comma", "minus", "backspace", "clear", "enter"] }
}
```

## Writing rules
- Decimal comma in all text. Coordinates and lists with semicolon: `(3; 4)`.
- LaTeX backslashes are doubled in JSON: `\\frac`, `\\cdot`, `\\sqrt`.
- Use `\\cdot` or `\\times` for multiplication in math, `\\div` or `\\frac` for division.
- No trailing commas in JSON. Use UTF-8 for å, ä, ö.

## Validation (later step)
A JSON Schema file `schema/exercise.schema.json` plus a small Node script (`tools/validate.mjs`, Ajv, dev-only, never shipped)
checks: required fields, `id` unique and equal to manifest, file exists, `answerType` known, generator params sane.
Use `additionalProperties: false` on stable objects to catch typos; allow an `extensions` object for experiments.
Run it before every commit that touches `data/`.

## Generating tasks safely
- Max 200 draw attempts per task and a controlled error if `count` unique tasks are impossible (for example too few distinct values).
- The answer key is always computed from the generator parameters, never typed in by hand except in `static` generators.
- Placeholders and keys never contain JavaScript. JSON is data only.
