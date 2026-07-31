# ParaQuiz — Parasiten-Trainer 🪱

Eine Web-App zum Lernen der **Veterinär-Parasitologie** mit Spaced Repetition, abwechslungsreichen Fragetypen und frei wählbaren Kategorien. Läuft auf **iPhone und PC** im Browser (installierbar als PWA), komplett auf **Deutsch**.

> **Status:** In Entwicklung. Diese README beschreibt das Zielbild und wie man das Projekt aufsetzt, baut und veröffentlicht.

## Features
- **Spaced Repetition (SM-2):** schwach beantwortete Fragen kommen häufiger wieder — optimiert fürs Behalten.
- **9 Fragetypen:** Multiple Choice (einfach/mehrfach), Richtig/Falsch, Lückentext, Zuordnung, Reihenfolge, Karteikarten, Fallbeispiele, (Bild-ID optional).
- **Anpassbare Auswahl:** filtere nach Parasitengruppe, Wirtstier, Thema und Merkmalen (Zoonose, meldepflichtig) sowie Wichtigkeit (★–★★★).
- **Zwei Modi:** Lernmodus (SRS) und Prüfungsmodus (fester Fragensatz mit Note).
- **Gamification:** Serie/Streak, Punkte, Abzeichen, Tagesziel, Fortschritt pro Kategorie.
- **Offline-fähig & installierbar** (PWA). Fortschritt lokal im Browser — keine Accounts nötig.

## Inhaltliche Grundlage
Alle Fragen basieren auf dem Quelldokument `content/source/parasitologie-quelle.md` (~49 Helminthen-Monografien). Jede Frage enthält eine Begründung (`explanation`) und einen Quellenverweis (`source`).

## Schnellstart (lokal)
Voraussetzung: Node.js 20+.

```bash
npm install
npm run dev        # http://localhost:5173
```

## Skripte
| Befehl | Zweck |
|---|---|
| `npm run dev` | Lokaler Entwicklungsserver |
| `npm run build` | Produktions-Build nach `dist/` |
| `npm run preview` | Produktions-Build lokal ansehen |
| `npm run validate` | Fragenbank gegen das Schema prüfen |
| `npm run test` | Unit-Tests (Vitest) |

## Projektstruktur
```
parasiten-quiz/
├─ content/            # Quelle + Fragenbank (categories.json, questions.json)
├─ public/             # PWA-Manifest, Icons, (Bilder)
├─ scripts/            # validate-questions.ts
├─ src/
│  ├─ lib/             # srs.ts (SM-2), storage.ts, selectSession.ts, stats.ts
│  ├─ components/      # Fragetyp-Komponenten, UI
│  ├─ pages/           # Dashboard, Kategorien, Quiz, Ergebnis, Statistik, Einstellungen
│  ├─ i18n/de.ts       # alle deutschen UI-Texte
│  └─ types.ts         # Frage-/Fortschritt-Schema (Zod)
└─ .github/workflows/  # deploy.yml (GitHub Pages)
```

## Veröffentlichen (GitHub Pages)
1. Repo auf GitHub anlegen (z. B. `parasiten-quiz`).
2. In `vite.config.ts` `base: '/parasiten-quiz/'` setzen (Repo-Name).
3. Code pushen. Der Workflow `.github/workflows/deploy.yml` baut und deployt automatisch.
4. In GitHub: **Settings → Pages → Source: GitHub Actions**.
5. Fertig: `https://<user>.github.io/parasiten-quiz/`

**Teilen:** einfach die URL weitergeben. Auf iPhone: Safari → Teilen → „Zum Home-Bildschirm" (installiert die App, ermöglicht Offline-Nutzung).

## Datenschutz
v1 speichert den Lernfortschritt ausschließlich lokal im Browser (`localStorage`). Es werden keine Daten an einen Server gesendet, es gibt keine Accounts.

## Roadmap (v2, optional)
Accounts + geräteübergreifender Sync (z. B. Supabase), Bestenliste, Admin-UI zum Bearbeiten der Fragen. Der Code kapselt die Speicherung so, dass ein späterer Wechsel nur `src/lib/storage.ts` betrifft.

## Weiterführende Dokumente
- **`Parasiten-Quiz_Implementation-Plan.md`** — vollständige Spezifikation.
- **`CLAUDE.md`** — verbindliche Kurzreferenz für den Coding-Agent.
- **`KICKOFF-PROMPT.md`** — Startanweisung für den Coding-Agent.
