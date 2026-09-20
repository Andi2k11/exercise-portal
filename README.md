# Matematikplattform

Webbaserad övningssida för mängdträning i matematik. Eleverna väljer bok, kapitel och övning.
Ingen inloggning, ingen server. Statistik sparas lokalt i webbläsaren (`localStorage`).

Byggd med HTML5, CSS, JavaScript (ES-moduler) och Bootstrap 5. Publiceras via GitHub Pages.

## Köra lokalt
Öppna mappen i VS Code och starta **Live Server**, eller kör `python -m http.server 8000` och gå till `http://localhost:8000`.
Öppna inte `index.html` direkt från disk (`file://`) – då blockeras inläsning av JSON-filer.

## Publicera
Repo → Settings → Pages → Deploy from branch → `main` / root. Alla sökvägar i koden är relativa.

## Lägga till en övning
1. Skapa en JSON-fil i `data/<bok>/<kapitel>/` enligt `docs/EXERCISE_SCHEMA.md`.
2. Lägg till en rad i `data/index.json`.
3. Ladda om sidan. Övningen finns i rullistorna.

## Dokumentation
| Fil | Innehåll |
|---|---|
| `.github/copilot-instructions.md` | Regler som GitHub Copilot läser automatiskt |
| `STATUS.md` | Byggordning, nuvarande steg, saker att verifiera, vad som inte ska göras nu |
| `docs/ARCHITECTURE.md` | Mappstruktur, dataflöde, bibliotek |
| `docs/EXERCISE_SCHEMA.md` | Format för övnings-JSON och manifest |
| `docs/ANSWER_TYPES.md` | Svarstyper, inmatning och rättning |
| `docs/ACCESSIBILITY.md` | Tillgänglighet och iPad |
| `docs/SECURITY_AND_PRIVACY.md` | Integritet, säkerhet, lokal statistik |
| `docs/TESTING.md` | Vad som ska testas och hur |

## Arbetssätt med Copilot
Ett steg i taget enligt `STATUS.md`. Skriv t.ex.: *"Gör steg 3 i STATUS.md. Rör bara math-render.js och index.html."*
