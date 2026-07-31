# Kickoff-Prompt für Opus (in VS Code einfügen)

> **So benutzt du das:** Öffne den Ordner `ParasiteProject` in VS Code mit Claude Code / Opus. Kopiere den Block unten als **erste Nachricht**. Er verweist Opus auf die vorhandenen Dokumente und startet Phase 0. Danach arbeitest du Phase für Phase (Prompt am Ende „Nächste Phase").

---

## ▶️ Erste Nachricht (kopieren)

```
Du baust die App „ParaQuiz" — einen deutschsprachigen Parasitologie-Lerntrainer.

Lies zuerst diese Dateien im Repo und halte dich strikt daran:
- CLAUDE.md (verbindliche Kurzreferenz + goldene Regeln)
- Parasiten-Quiz_Implementation-Plan.md (vollständige Spezifikation)
- content/source/... bzw. Parasiten.md.md (der Quellinhalt für die Fragen)

Wichtigste Regeln:
- Alle nutzer-sichtbaren Texte auf Deutsch, Code auf Englisch, UTF-8, <html lang="de">.
- Kein Backend in v1: nur statische SPA + JSON + localStorage. Storage hinter src/lib/storage.ts kapseln.
- Keine Halluzination: jede Frage braucht explanation + source aus dem Quelldokument; unsichere Fragen needsReview:true.
- npm run validate muss grün sein, bevor gebaut/deployt wird.
- Mobile-first (≤390px muss gut bedienbar sein).

Stack: Vite + React + TypeScript + Tailwind + vite-plugin-pwa, Vitest, Zod, GitHub Pages.

Starte mit PHASE 0 (Setup):
1. Kopiere Parasiten.md.md nach content/source/parasitologie-quelle.md.
2. Initialisiere das Projekt (Vite React-TS), Tailwind, PWA-Plugin, Ordnerstruktur laut Plan Abschnitt 10.
3. Lege package.json-Skripte an: dev, build, preview, validate, test.
4. Erstelle .github/workflows/deploy.yml (GitHub Pages) und setze base:'/parasiten-quiz/' in vite.config.ts.
5. Baue eine minimale lauffähige App-Hülle mit leeren Routen (Dashboard, Kategorien, Quiz, Ergebnis, Statistik, Einstellungen).

Am Ende von Phase 0: sag mir kurz, was du gebaut hast, wie ich es lokal starte (npm run dev) und was ich in GitHub einstellen muss (Settings → Pages → GitHub Actions). Committe die Phase. Warte dann auf mein „Nächste Phase", bevor du weitermachst.
```

---

## 🔁 Folge-Prompt (nach jeder Phase)

```
Phase abgeschlossen und getestet? Dann committe sie und starte die nächste Phase laut Parasiten-Quiz_Implementation-Plan.md (Abschnitt 13). Halte dich an die goldenen Regeln in CLAUDE.md. Vor Abschluss: npm run validate und npm run test müssen grün sein. Fasse am Ende kurz zusammen, was gebaut/getestet wurde.
```

---

## 🧠 Spezial-Prompt für die Fragen-Generierung (Phase 2)
Phase 2 ist die inhaltlich wichtigste. Wenn du dort bist, nutze diesen Zusatz:

```
Generiere jetzt content/questions.json aus content/source/parasitologie-quelle.md.

Vorgehen:
- Gehe die ~49 Parasiten-Monografien der Reihe nach durch.
- Pro Parasit 8–15 Fragen, gemischt über die Fragetypen (nicht nur Multiple Choice). Nutze die Quell-Felder als Vorlagen: Lebenszyklus → ordering; Endwirt/Zwischenwirt → matching; Zoonose JA/NEIN → true_false; Morphologie/Diagnose/Klinik → single_choice/multiple_choice/cloze; Fallbeispiel → case_vignette; Definitionen → flashcard.
- image_id vorerst weglassen (keine Bilder vorhanden).
- Tagge jede Frage vollständig (class/subclass/host/topic/flags) und setze importance (1–3) aus der Stern-Wichtigkeit (***/**/*).
- Jede Frage: explanation (Deutsch) + source (Kapitel/Abschnitt). Unsicheres → needsReview:true.
- Distraktoren müssen fachlich plausibel sein (verwandte Parasiten, ähnliche Wirte/Symptome).
- Aktualisiere content/categories.json so, dass nur real vorkommende Werte enthalten sind.

Arbeite in Blöcken (z. B. 5 Parasiten pro Durchlauf), damit du Qualität hältst. Nach jedem Block: npm run validate laufen lassen. Melde am Ende Gesamtzahl der Fragen, Verteilung nach Typ und Anzahl needsReview.
```

---

## ✅ Checkliste vor dem ersten Push zu GitHub
- [ ] `content/source/parasitologie-quelle.md` vorhanden.
- [ ] `vite.config.ts` `base` = Repo-Name.
- [ ] `npm run build` und `npm run validate` laufen lokal fehlerfrei.
- [ ] GitHub-Repo erstellt, Settings → Pages → Source: **GitHub Actions**.
- [ ] Nach Push: Deploy-Workflow grün, URL öffnet auf iPhone + PC.

## 📌 Offene Entscheidungen (kannst du Opus überlassen oder selbst festlegen)
- App-Name: Default „ParaQuiz" — bei Wunsch ändern.
- Repo-Name: Default `parasiten-quiz`.
- Bild-Fragen (`image_id`): nur wenn du Bilder nach `public/images/` lieferst.
- Farbschema/Branding: Default schlicht, Dark-Mode-fähig.
