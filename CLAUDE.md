# CLAUDE.md — Projektanweisungen für den Coding-Agent

> Diese Datei wird von Claude Code / Opus im Repo automatisch gelesen. Sie ist die **verbindliche Kurzreferenz**. Die vollständige Spezifikation steht in **`Parasiten-Quiz_Implementation-Plan.md`** — bei Konflikten gilt der Plan.

## Was wir bauen
Eine **Web-App zum Lernen der Veterinär-Parasitologie** mit Spaced Repetition, abwechslungsreichen Fragetypen und anpassbarer Kategorieauswahl. Zielgruppe: Toms Lerngruppe (später breiter). Läuft auf iPhone + PC als installierbare PWA, gehostet auf GitHub Pages.

- **Quellinhalt** (drei Dateien in `content/source/`, aus `parasite_docs/` kopiert), auf Deutsch:
  - `parasitologie-quelle.md` — **49 Helminthen** (Trematoden 4 · Zestoden 8 · Nematoden 37)
  - `protozoa-quelle.md` — **32 Protozoen** (Flagellaten 7 · Kokzidien 14 · Piroplasmen 11)
  - `ektoparasiten-quelle.md` — **43 Ektoparasiten** (Zecken 5 · Milben 12 · Läuse 9 · Sonstige 1 · Fliegen/Mücken 12 · Flöhe 4)
- **Vollständige Abdeckungsliste:** `Parasiten-Katalog.md` — verbindliche Checkliste aller 124 Parasiten mit Wichtigkeit, Wirt, Zoonose und Tags. Jeder Eintrag muss abgedeckt werden.
- **App-Name (Default):** „ParaQuiz" — änderbar, wenn Tom etwas anderes wünscht.
- **Repo/Base-Pfad (Default):** `parasiten-quiz` → `vite.config.ts` `base: '/parasiten-quiz/'`.

## Goldene Regeln (nicht verhandelbar)
1. **Sprache:** Alle **nutzer-sichtbaren Texte auf Deutsch** (UI + Fragen + Erklärungen). **Code auf Englisch** (Variablen, Funktionen, Kommentare, Commits). UTF-8 überall; Umlaute (ä ö ü ß) müssen korrekt sein. `<html lang="de">`.
2. **Keine Halluzination im Inhalt.** Jede Frage muss sich aus einer der drei Dateien in `content/source/` belegen lassen. Pflichtfelder pro Frage: `explanation` (Begründung, Deutsch) und `source` (Kapitel/Abschnitt aus der Quelle). Unsichere Fragen: `"needsReview": true`. Fehlt in der Quelle ausreichend Fließtext (leere Kopfzeile ohne Inhalt), keine Frage dazu erfinden — Eintrag auslassen oder auf die vorhandenen Fakten beschränken.
3. **Kein Backend in v1.** Nur statische SPA + JSON + `localStorage`. Kein Auth, keine DB, keine externen Laufzeit-APIs. Storage hinter `src/lib/storage.ts` kapseln (späterer Supabase-Wechsel soll nur diese Datei betreffen).
4. **Schema-Gate.** `npm run validate` muss grün sein, bevor gebaut/deployt wird. Es läuft auch in CI.
5. **Mobile-first.** Alles muss bei ≤390px Breite gut bedienbar sein.

## Tech-Stack
Vite + React + TypeScript + Tailwind CSS + `vite-plugin-pwa`. Tests: Vitest. Fragen-Validierung mit Zod. Hosting: GitHub Pages via `.github/workflows/deploy.yml`.

## Befehle (in `package.json` anlegen)
- `npm run dev` — lokaler Dev-Server
- `npm run build` — Produktions-Build nach `dist/`
- `npm run preview` — Build lokal prüfen
- `npm run validate` — Fragenbank gegen Schema prüfen (`scripts/validate-questions.ts`)
- `npm run test` — Vitest

## Datenmodell (Kurzform — Details im Plan, Abschnitt 7)
- `content/categories.json`: Dimensionen `class`, `subclass`, `host`, `topic`, `flags`.
- `content/questions.json`: Array von Fragen. Gemeinsame Felder: `id`, `type`, `prompt`, `parasite`, `tags`, `importance` (1–3 aus Stern-Wichtigkeit), `difficulty`, `explanation`, `source`, `needsReview`, `image`. Typ-spezifische Felder je `type`.
- `src/types.ts`: TypeScript-/Zod-Schema, das dies exakt spiegelt (Discriminated Union über `type`).

## Fragetypen (9 — Details Plan Abschnitt 6)
`single_choice`, `multiple_choice`, `true_false`, `cloze` (tolerante Prüfung), `matching`, `ordering`, `image_id` (**nur wenn Bilder vorhanden — aktuell keine, also vorerst weglassen**), `flashcard`, `case_vignette`. Immer sofortiges Feedback + `explanation` + `source`.

## Spaced Repetition (Kern — Details Plan Abschnitt 8)
Vereinfachtes **SM-2** pro Frage in `localStorage`. Falsch/langsam → früher wieder. Neue Karten nach `importance` einführen (`***` zuerst). Zwei Modi: **Lernmodus** (SRS-gesteuert) und **Prüfungsmodus** (fester Satz, Note am Ende, aktualisiert aber Fortschritt). Unit-Tests für die SM-2-Berechnung.

## Kategorien / anpassbare Auswahl (Details Plan Abschnitt 5)
Jede Frage mehrfach getaggt. Nutzer filtert über `class`/`subclass`/`host`/`topic`/`flags` (UND zwischen Dimensionen, ODER innerhalb). Schnellfilter: „Nur ***", „Nur Zoonosen", „Nur Nematoden". Auswahl in `localStorage` persistieren.

## Build-Reihenfolge (Details Plan Abschnitt 13)
0. Setup (Vite/React/TS/Tailwind/PWA) + Repo + Actions → leere App deployt auf Pages.
1. Datenmodell + `validate-questions.ts` (CI-Gate).
2. **Fragenbank generieren** aus den Quellen (Helminthen zuerst, 400–800 Fragen; Protozoen und Ektoparasiten als spätere Erweiterung). **Alle Einträge aus `Parasiten-Katalog.md` abdecken**, `needsReview` bei Unsicherheit markieren.
3. Fragetyp-Komponenten + Feedback.
4. Spaced Repetition + Session-Auswahl (+ Unit-Tests).
5. Kategorie-Auswahl + Persistenz.
6. Dashboard, Ergebnis, Statistik, Gamification (Streak/XP/Abzeichen).
7. Einstellungen + Export/Import + Dark Mode + Politur (responsive, Lighthouse-PWA).
8. (Optional) Review-Modus für `needsReview`-Fragen.

Jede Phase: eigener Commit/PR mit kurzer Beschreibung (was gebaut/getestet).

## Definition of Done (pro Phase)
Code baut, `npm run validate` + `npm run test` grün, auf iPhone-Breite bedienbar, keine Konsolenfehler, nutzer-sichtbare Texte auf Deutsch.

## Was NICHT tun
- Keine Browser-Storage-Alternativen außer `localStorage` (kein Cookie-Auth etc.).
- Keine Frage ohne `source`/`explanation`.
- Keine englischen UI-Texte. Keine erfundenen Fakten.
- Keine schweren Abhängigkeiten ohne Grund (kein Next.js, kein Redux nötig).
