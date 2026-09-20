# Security and privacy

## Threat model
This is an open practice site, not a secure exam platform. All code and data reaches the browser and can be inspected,
so the answer key is not secret. Never put secrets, personal data or confidential material in the repository.

## Rules
- No login. No student names, e-mail, class or other identifiers. No analytics or tracking in v1.
- JSON is data, never code. No `eval`, no `new Function`, no inline event handlers.
- Render student input with `textContent` or through KaTeX/MathLive, never `innerHTML`.
- Pin third-party library versions and document their licences.

## localStorage
Anonymous counters only, keys prefixed `mp:`.
```json
{
  "version": 1,
  "exerciseProgress": {
    "exercise-id": { "attempted": 12, "correct": 9, "lastUsed": "2026-09-20" }
  }
}
```
- Add a button **Radera lokal statistik** and explain that the data exists only on this device.
- Do not store full student answers unless needed.
- Keep the last 50 round results per exercise at most.

## CDN vs vendor
CDN is fine to start. For school use, copy the pinned versions to `vendor/` with licence files later (fewer network
dependencies and no surprise upgrades). All library URLs live in `src/core/libs.js`.

## Content and copyright
Write your own instructions and generate your own tasks. Do not copy textbook task texts, images or layout.
Book and chapter names are fine as navigation labels.
