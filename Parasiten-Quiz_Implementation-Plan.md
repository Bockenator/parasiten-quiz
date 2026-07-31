# Parasiten-Quiz — Implementierungsplan (für Opus / VS Code)

**Version:** 1.0
**Autor des Plans:** vorbereitet für Tom
**Zielgruppe dieses Dokuments:** ein Coding-Agent (Opus), der die App von Grund auf baut.

> **Wichtig für Opus:** Dieses Dokument ist die Spezifikation. Baue exakt nach dieser Struktur. Alle **Benutzer-sichtbaren Texte sind auf Deutsch** (UI + Inhalte). Der Code (Variablen, Kommentare, Commit-Messages) ist auf Englisch. Wenn eine Entscheidung offen ist, wähle die im Abschnitt „Empfehlung" genannte Option und dokumentiere sie im README.

---

## 1. Ziel & Kontext

Tom hat ein Google-Doc mit **~115 Seiten** Inhalt zur **Veterinär-Parasitologie** (auf Deutsch). Ziel ist eine **Web-App zum Lernen mit Fokus auf Wissensretention**, die:

- **Spaß macht** (Gamification, abwechslungsreiche Fragetypen),
- **Spaced Repetition** nutzt (schwache Fragen tauchen häufiger auf),
- **anpassbar** ist (Nutzer wählt aus, welche Parasiten/Kategorien abgefragt werden),
- **ohne Programmierkenntnisse nutzbar** ist (einfach eine URL öffnen),
- auf **iPhone und PC** läuft (responsive + installierbar als PWA),
- auf **GitHub Pages** kostenlos gehostet wird.

**Startphase:** wenige Nutzer (Toms Lerngruppe). **Später:** breit zugänglich. Deshalb: v1 komplett **ohne Backend/Accounts** (Fortschritt lokal im Browser), aber mit einem klar dokumentierten **Upgrade-Pfad** zu Accounts/Sync (Abschnitt 12).

---

## 2. Tech-Stack (Empfehlung)

| Bereich | Wahl | Begründung |
|---|---|---|
| Build | **Vite** | schnell, simple GitHub-Pages-Deployment, kein SSR nötig |
| Framework | **React + TypeScript** | wartbar, Opus-freundlich, große Ökosystem-Basis |
| Styling | **Tailwind CSS** | schnelles, konsistentes, mobile-first Design |
| State/Persistenz | **localStorage** (via kleinem Wrapper), kein Backend | funktioniert offline, keine Serverkosten, DSGVO-arm |
| PWA | **vite-plugin-pwa** | installierbar auf iPhone (Zum Home-Bildschirm) + offline |
| Datenformat | **statische JSON-Dateien** (Fragenbank) | einfach zu versionieren, kein DB nötig |
| Hosting | **GitHub Pages** via GitHub Actions | kostenlos, permanente URL |
| Tests | **Vitest** (Unit) + ein einfaches Schema-Validierungsskript | verhindert kaputte Fragenbank |

> **Bewusst kein schwerer Stack:** kein Next.js, keine Datenbank, kein Auth in v1. Alles läuft als statische Single-Page-App. Das hält es kostenlos, schnell und für Nicht-Programmierer nutzbar (nur eine URL).

**Sprache/Encoding:** Alle Dateien **UTF-8**. Umlaute (ä, ö, ü, ß) müssen korrekt gespeichert und gerendert werden. `<html lang="de">`.

---

## 3. Inhalts-Workflow: vom Google-Doc zur Fragenbank

Dies ist der **kritischste Teil** — die Qualität der Fragen entscheidet über den Nutzen.

### 3.1 Quelldokument (bereits vorhanden)
Die Quelle liegt als Markdown vor: **`Parasiten.md.md`** (~26.000 Wörter, ~5.250 Zeilen). Für das Repo nach `content/source/parasitologie-quelle.md` kopieren/umbenennen.

**Tatsächliche Struktur der Quelle (wichtig — daran orientieren!):**
- Es sind **~49 durchnummerierte Parasiten-Monografien**, ausschließlich **Helminthen** (Würmer). **Keine Protozoen, keine Arthropoden** als eigenständige Themen (Flöhe/Zecken kommen nur als Vektoren/Zwischenwirte vor).
- Jedem Parasiten ist eine **Stern-Wichtigkeit** vorangestellt: `***` = sehr prüfungsrelevant, `**` = mittel, `*` = weniger. Diese Wichtigkeit steuert Schwierigkeit & Priorisierung (siehe 3.2, 5, 8).
- Jede Monografie hat sehr **konsistente Felder**: Erreger/Morphologie (oft als Tabelle Adult/Eier), Endwirt, Zwischenwirt, Vorkommen/Verbreitung, Entwicklung/Epidemiologie (Lebenszyklus als nummerierte Schritte), Pathogenese/Pathologie, Klinik, Diagnose, Therapie, Prophylaxe, und ein Feld **`Zoonose: JA/NEIN`** (teils **MELDEPFLICHTIG**).

Diese Feldstruktur ist ein Geschenk: sie mappt fast 1:1 auf die Themen-Dimension (Abschnitt 5) und liefert direkte Fragen-Vorlagen (Lebenszyklus → `ordering`, Endwirt/Zwischenwirt → `matching`, Zoonose → `true_false`, Morphologie/Diagnose → `single_choice`/`image_id`).

Falls Bilder (z. B. Eier, Morphologie) für Bild-Fragen genutzt werden sollen, separat nach `public/images/` exportieren (die aktuelle Markdown-Quelle enthält nur Text/Tabellen).

### 3.2 Fragengenerierung durch Opus
Opus liest die Quelldatei, teilt sie **thematisch** (pro Parasit / Parasitengruppe) und erzeugt Fragen im JSON-Schema aus Abschnitt 7. **Regeln:**

1. **Keine Halluzination.** Jede Frage muss sich direkt aus dem Quelldokument belegen lassen. Jede Frage bekommt ein Feld `source` (Kapitel/Abschnitt/Seite) und eine `explanation` (Begründung der richtigen Antwort, auf Deutsch, mit Kurzbeleg aus dem Text).
2. **Abdeckung.** Ziel: die gesamten 115 Seiten abdecken. Grober Richtwert: **8–15 Fragen pro wesentlichem Thema/Parasit**, gemischt über die Fragetypen. Erzeuge realistisch mehrere Hundert Fragen (Zielkorridor **400–800**), aber Qualität vor Quantität.
3. **Fragetyp-Mix.** Pro Thema verschiedene Typen (nicht nur MC). Siehe Abschnitt 6.
4. **Plausible Distraktoren.** Falsche MC-Antworten müssen fachlich plausibel sein (z. B. verwandte Parasiten, ähnliche Wirte/Symptome), nicht offensichtlich falsch.
5. **Schwierigkeitsgrad** taggen: `leicht` | `mittel` | `schwer`. Orientierung an der **Stern-Wichtigkeit** der Quelle: `***`-Parasiten → mehr und tiefere Fragen (Kernwissen); `*`-Parasiten → wenige Basisfragen. Speichere die Wichtigkeit zusätzlich pro Frage als `importance` (1–3), damit der Lernmodus wichtige Themen zuerst einführen kann.
6. **Mehrfach-Tagging** jeder Frage nach Kategorien (Abschnitt 5), damit Filterung flexibel ist. Nutze die vorhandenen Quell-Felder: `Zoonose: JA/NEIN` → Tag `zoonose`, `MELDEPFLICHTIG` → Tag `meldepflichtig`.
7. **Deutsch + Fachbegriffe.** Fachterminologie (lat. Artnamen) korrekt; Formulierungen klar und prüfungsnah.

### 3.3 Validierung
Ein Skript `scripts/validate-questions.ts` prüft die gesamte Fragenbank gegen das JSON-Schema (Pflichtfelder, gültige Typen, mind. eine richtige Antwort, IDs eindeutig, referenzierte Kategorien existieren, referenzierte Bilder existieren). CI schlägt fehl, wenn Validierung fehlschlägt.

### 3.4 Menschliche Kontrolle
Da es um Prüfungswissen geht: Opus markiert Fragen mit geringer Quellen-Sicherheit als `"needsReview": true`. Tom kann diese in einer einfachen Liste durchsehen. (Optional: kleiner „Review-Modus", der nur `needsReview`-Fragen zeigt.)

---

## 4. Fun & Retention — Designprinzipien

- **Sofortiges Feedback** nach jeder Frage: richtig/falsch + `explanation`. Feedback ist der stärkste Retentionshebel.
- **Spaced Repetition** als Kern (Abschnitt 8): falsch/langsam beantwortete Fragen kommen früher wieder.
- **Gamification, dezent:** Serie/Streak (🔥), Punkte/XP, Fortschrittsbalken pro Kategorie, Abzeichen, Tagesziel.
- **Zwei Modi:** *Lernmodus* (Spaced Repetition, kein Zeitdruck) und *Prüfungsmodus* (fester Fragensatz, Zeit optional, Note am Ende).
- **Kurze Sessions** möglich (z. B. „10 Fragen"), damit man auch am iPhone zwischendurch lernt.
- **Abwechslung** durch Fragetyp-Rotation hält Aufmerksamkeit hoch.

---

## 5. Kategorien-Struktur (anpassbare Auswahl)

Damit Nutzer „welche Parasiten" wählen können, wird **jede Frage mehrfach getaggt**. Der Nutzer filtert dann über mehrere Dimensionen. Diese Taxonomie ist **an den echten Doc-Inhalt angepasst** (reine Helminthen-Sammlung). Opus verfeinert die Werte anhand der Quelle; nur real vorkommende Werte aufnehmen.

**Dimension A — Parasitengruppe (`class`):** die Hauptachse, nach der man Parasiten auswählt.
- `Trematoden` (Saugwürmer) — z. B. Fasciola, Paramphistomum, Dicrocoelium, Opisthorchis.
- `Zestoden` (Bandwürmer) — z. B. Diphyllobothrium, Mesocestoides, Anoplocephala, Moniezia, Dipylidium, Taenia, Echinococcus.
- `Nematoden` (Rundwürmer) — die größte Gruppe. Wegen Umfang mit **Untergruppen** (`subclass`): `Magen-Darm-Strongyliden` (Ostertagia, Haemonchus, Cooperia, Trichostrongylus …), `große/kleine Strongyliden` (Pferd), `Hakenwürmer` (Ancylostoma, Uncinaria, Bunostomum), `Lungenwürmer` (Dictyocaulus, Metastrongylus, Angiostrongylus, Aelurostrongylus, Crenosoma), `Askariden` (Ascaris, Parascaris, Toxocara, Toxascaris, Ascaridia), `Filarien` (Dirofilaria, Parafilaria, Stephanofilaria), `sonstige` (Trichuris, Capillaria, Trichinella, Strongyloides, Oxyuris, Syngamus …).

**Dimension B — Wirtstier (`host`):**
`Wiederkäuer` (Rind/Schaf/Ziege), `Pferd`, `Schwein`, `Hund`, `Katze`, `Geflügel`, `Fisch`, `Mensch (zoonotisch)`. (Werte nur, wo im Doc als End-/Zwischenwirt genannt.)

**Dimension C — Thema/Lernaspekt (`topic`):** entspricht direkt den Quell-Feldern.
`Morphologie`, `Endwirt/Zwischenwirt`, `Lebenszyklus/Entwicklung`, `Pathogenese`, `Klinik/Symptome`, `Diagnose`, `Therapie`, `Prophylaxe`, `Epidemiologie`.

**Dimension D — Flags (`flags`):** aus der Quelle direkt ableitbar, sehr prüfungsrelevant.
`zoonose` (aus `Zoonose: JA`), `meldepflichtig` (aus `MELDEPFLICHTIG`).

**Zusätzliches Attribut `importance` (1–3)** aus der Stern-Wichtigkeit — kein Filter-Chip, sondern zur Priorisierung im Lernmodus und als Standardschwierigkeit.

**UI-Konsequenz:** Der Kategorie-Auswahlbildschirm zeigt diese Dimensionen als Gruppen von Checkboxen/Chips. Auswahl kombiniert sich (UND zwischen Dimensionen, ODER innerhalb). Sinnvolle Schnellfilter: „Nur `***` (Hochrelevant)", „Nur Zoonosen", „Nur Nematoden" usw. „Alles auswählen" / „Zurücksetzen" vorhanden. Auswahl wird in localStorage gespeichert.

---

## 6. Fragetypen (Vielfalt)

Jeder Typ hat ein `type`-Feld. Mindestens diese Typen implementieren:

1. **`single_choice`** — Multiple Choice, **eine** richtige Antwort.
2. **`multiple_choice`** — **mehrere** richtige Antworten (Nutzer muss alle korrekten wählen).
3. **`true_false`** — Richtig/Falsch-Aussage.
4. **`cloze`** — Lückentext; Freitexteingabe mit **toleranter** Prüfung (Groß-/Kleinschreibung ignorieren, Leerzeichen trimmen, optional akzeptierte Synonyme/Schreibvarianten via `acceptedAnswers`).
5. **`matching`** — Zuordnung (z. B. Parasit → Wirt, oder Parasit → typische Erkrankung, oder Ei/Stadium → Art).
6. **`ordering`** — Reihenfolge (z. B. Stadien eines Lebenszyklus in korrekte Reihenfolge bringen).
7. **`image_id`** — Bild-Identifikation (Morphologie/Ei erkennen). Nur wenn Bilder vorhanden; sonst weglassen. Bild + MC-Antworten.
8. **`flashcard`** — Karteikarte (Vorderseite Frage/Begriff, Rückseite Antwort). Selbsteinschätzung „Gewusst / Nicht gewusst" speist Spaced Repetition. Ideal für Lebenszyklus-/Definitionslernen.
9. **`case_vignette`** — Fallbeispiel: kurzes klinisches Szenario → Frage (meist `single_choice`-artig). Für höhere Schwierigkeit/Anwendung.

**UI je Typ:** klare, tippbare Elemente (mobile-first), Tastatur-Navigation auf PC, deutliches Richtig/Falsch-Feedback mit Farbe + `explanation`.

---

## 7. Datenmodell (JSON-Schema)

### 7.1 `content/categories.json`
```json
{
  "dimensions": [
    {
      "id": "class",
      "label": "Parasitengruppe",
      "values": [
        { "id": "trematoden", "label": "Trematoden" },
        { "id": "zestoden", "label": "Zestoden" },
        { "id": "nematoden", "label": "Nematoden" }
      ]
    },
    {
      "id": "subclass",
      "label": "Nematoden-Untergruppe",
      "values": [
        { "id": "magendarm_strongyliden", "label": "Magen-Darm-Strongyliden" },
        { "id": "strongyliden_pferd", "label": "Große/kleine Strongyliden (Pferd)" },
        { "id": "hakenwuermer", "label": "Hakenwürmer" },
        { "id": "lungenwuermer", "label": "Lungenwürmer" },
        { "id": "askariden", "label": "Askariden" },
        { "id": "filarien", "label": "Filarien" },
        { "id": "sonstige_nematoden", "label": "Sonstige Nematoden" }
      ]
    },
    {
      "id": "host",
      "label": "Wirtstier",
      "values": [
        { "id": "wiederkaeuer", "label": "Wiederkäuer" },
        { "id": "pferd", "label": "Pferd" },
        { "id": "schwein", "label": "Schwein" },
        { "id": "hund", "label": "Hund" },
        { "id": "katze", "label": "Katze" },
        { "id": "gefluegel", "label": "Geflügel" },
        { "id": "mensch", "label": "Mensch (zoonotisch)" }
      ]
    },
    {
      "id": "topic",
      "label": "Thema",
      "values": [
        { "id": "morphologie", "label": "Morphologie" },
        { "id": "wirte", "label": "Endwirt/Zwischenwirt" },
        { "id": "lebenszyklus", "label": "Lebenszyklus/Entwicklung" },
        { "id": "pathogenese", "label": "Pathogenese" },
        { "id": "klinik", "label": "Klinik/Symptome" },
        { "id": "diagnose", "label": "Diagnose" },
        { "id": "therapie", "label": "Therapie" },
        { "id": "prophylaxe", "label": "Prophylaxe" },
        { "id": "epidemiologie", "label": "Epidemiologie" }
      ]
    },
    {
      "id": "flags",
      "label": "Merkmale",
      "values": [
        { "id": "zoonose", "label": "Zoonose" },
        { "id": "meldepflichtig", "label": "Meldepflichtig" }
      ]
    }
  ]
}
```

### 7.2 `content/questions.json` (Array von Frage-Objekten)
Gemeinsame Felder für **alle** Typen:
```jsonc
{
  "id": "q_0001",                 // eindeutig, stabil
  "type": "single_choice",        // siehe Abschnitt 6
  "prompt": "Welcher Parasit ...",// Fragetext (Deutsch)
  "parasite": "Fasciola hepatica",// zugehöriger Parasit (für Statistik/Gruppierung)
  "tags": {                       // Mehrfach-Tagging, Werte referenzieren categories.json
    "class": ["trematoden"],
    "subclass": [],               // nur bei Nematoden gefüllt
    "host": ["wiederkaeuer", "mensch"],
    "topic": ["diagnose"],
    "flags": ["zoonose"]
  },
  "importance": 3,                // 1..3 aus Stern-Wichtigkeit der Quelle
  "difficulty": "mittel",         // leicht | mittel | schwer
  "explanation": "Kurzbegründung ... (Deutsch)",
  "source": "Kap. 4.2, S. 37",   // Beleg aus dem Quelldokument
  "needsReview": false,
  "image": null                    // oder "images/xyz.jpg"
}
```

Typ-spezifische Felder:

- **`single_choice` / `case_vignette` / `image_id`:**
  ```json
  "options": ["A", "B", "C", "D"],
  "correctIndex": 2
  ```
- **`multiple_choice`:**
  ```json
  "options": ["A", "B", "C", "D"],
  "correctIndices": [0, 2]
  ```
- **`true_false`:**
  ```json
  "answer": true
  ```
- **`cloze`:**
  ```json
  "answer": "Toxocara canis",
  "acceptedAnswers": ["toxocara canis", "t. canis"]
  ```
- **`matching`:**
  ```json
  "left": ["Toxocara canis", "Dirofilaria immitis"],
  "right": ["Dünndarm", "Herz/Lunge"],
  "correctPairs": [[0,0],[1,1]]
  ```
- **`ordering`:**
  ```json
  "items": ["Ei", "L1", "L2", "L3", "Adult"],
  "correctOrder": [0,1,2,3,4]
  ```
- **`flashcard`:**
  ```json
  "front": "Endwirt von Echinococcus granulosus?",
  "back": "Hund (und andere Kanidae)"
  ```

> **Opus:** Definiere zusätzlich `src/types.ts` mit TypeScript-Typen, die dieses Schema exakt spiegeln (Discriminated Union über `type`). Das Validierungsskript nutzt diese Typen bzw. ein Zod-Schema.

---

## 8. Spaced Repetition (Kern-Algorithmus)

**Algorithmus:** vereinfachtes **SM-2** (Anki-artig), pro Frage, gespeichert in localStorage.

Pro Frage wird ein Fortschrittsobjekt gehalten:
```ts
type CardProgress = {
  id: string;
  ease: number;        // Leichtigkeitsfaktor, Start 2.5
  intervalDays: number;// aktuelles Intervall
  repetitions: number; // wie oft hintereinander richtig
  due: string;         // ISO-Datum, wann wieder fällig
  lastQuality: number; // 0..5 letzte Bewertung
  history: { date: string; quality: number }[];
};
```

**Ablauf nach jeder Antwort:**
1. Bewertung `quality` (0–5) ableiten:
   - falsch → `0–2` (abhängig von Nähe/Teilrichtigkeit; bei Flashcards: Nutzer-Selbsteinschätzung „Nicht gewusst" = 1),
   - richtig → `3–5` (schneller/sicherer = höher). Bei Flashcards: „Gut" = 4, „Sehr leicht" = 5.
2. **SM-2-Update:**
   - Wenn `quality < 3`: `repetitions = 0`, `intervalDays = 1` (Frage kommt bald wieder).
   - Sonst: `repetitions += 1`;
     - `repetitions == 1` → `intervalDays = 1`
     - `repetitions == 2` → `intervalDays = 6`
     - sonst → `intervalDays = round(intervalDays * ease)`
   - `ease = max(1.3, ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))`
   - `due = heute + intervalDays`

**Lernmodus-Auswahl:** Sitzung zieht bevorzugt (a) **fällige** Karten (`due <= heute`), dann (b) **neue** ungesehene Karten (begrenzt pro Tag, z. B. max. 20 neue), dann (c) bald fällige. Nur aus den vom Nutzer **gewählten Kategorien**. Reihenfolge leicht randomisiert, aber schwache Karten priorisiert. **Neue Karten werden nach `importance` eingeführt** (`***` zuerst), damit Kernwissen zuerst sitzt.

**Prüfungsmodus:** ignoriert Fälligkeit; zieht zufälligen, ausgewogenen Satz aus gewählten Kategorien (Anzahl wählbar: 10/20/50/alle). Ergebnis mit Note/Prozent, aber aktualisiert trotzdem `CardProgress` (Antworten zählen fürs Lernen).

**Statistik:** pro Kategorie: gesehen / beherrscht (z. B. `repetitions >= 3` und `ease >= 2.3`) / fällig / Trefferquote. Dashboard zeigt Fortschrittsbalken.

---

## 9. Bildschirme / UX

Mobile-first, große Tap-Ziele, funktioniert einhändig am iPhone. Alle Texte Deutsch.

1. **Start / Dashboard (`Startseite`)**
   - Begrüßung, aktuelle Serie/Streak, Tagesziel-Fortschritt.
   - „Weiterlernen"-Button (startet Lernmodus mit letzter Kategorieauswahl).
   - Fortschrittsbalken pro Hauptkategorie.
   - Buttons: *Lernen*, *Prüfung*, *Kategorien wählen*, *Statistik*, *Einstellungen*.

2. **Kategorie-Auswahl (`Kategorien`)**
   - Chips/Checkboxen je Dimension (Abschnitt 5). „Alles" / „Zurücksetzen". Anzahl passender Fragen live anzeigen. Auswahl speichern.

3. **Lern-/Quiz-Session (`Quiz`)**
   - Fortschrittsanzeige (z. B. 3/10), Fragetyp-spezifische UI, Antwort → sofortiges Feedback (Farbe + `explanation` + `source`), „Weiter"-Button. Möglichkeit „Frage melden" (schreibt lokal in eine Melde-Liste).
   - Session-Länge wählbar; „Session beenden" jederzeit.

4. **Ergebnis (`Ergebnis`)**
   - Trefferquote, XP verdient, Serie aktualisiert, Liste falsch beantworteter Fragen mit Erklärung, „Falsche wiederholen"-Button.

5. **Statistik (`Statistik`)**
   - Fortschritt pro Kategorie, fällige Karten heute, Verlauf (einfaches Balken-/Liniendiagramm), beherrschte vs. offene Fragen.

6. **Einstellungen (`Einstellungen`)**
   - Tagesziel, max. neue Karten/Tag, Ton/Animation an/aus, Daten exportieren/importieren (JSON), Fortschritt zurücksetzen, Dark Mode.

**Gamification-Elemente:** Streak-Zähler (verpasster Tag = Reset, mit Kulanz optional), XP/Level, Abzeichen (z. B. „100 Fragen", „Nematoden-Meister", „7-Tage-Serie"), Tagesziel-Ring.

**Accessibility:** ausreichender Kontrast, Fokus-States, `aria`-Labels, Tastatursteuerung (1–4 für MC-Optionen, Enter = Weiter), Schriftgröße respektiert System.

---

## 10. Projektstruktur (Vorschlag)

```
parasiten-quiz/
├─ index.html
├─ package.json
├─ vite.config.ts            # base: '/<repo-name>/' für GitHub Pages
├─ tailwind.config.js
├─ tsconfig.json
├─ public/
│  ├─ manifest.webmanifest   # PWA, name/lang de
│  ├─ icons/                 # PWA-Icons (iPhone-tauglich)
│  └─ images/                # Parasitenbilder (falls genutzt)
├─ content/
│  ├─ source/parasitologie-quelle.md   # Toms Export (Eingabe)
│  ├─ categories.json
│  └─ questions.json
├─ scripts/
│  └─ validate-questions.ts  # Schema-Validierung (CI)
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx
│  ├─ types.ts               # Frage-/Progress-Typen (Zod-Schema)
│  ├─ i18n/de.ts             # alle UI-Strings (Deutsch, zentral)
│  ├─ lib/
│  │  ├─ storage.ts          # localStorage-Wrapper (+ Export/Import)
│  │  ├─ srs.ts              # SM-2-Logik
│  │  ├─ selectSession.ts    # Fragenauswahl (Lern-/Prüfungsmodus)
│  │  └─ stats.ts
│  ├─ components/            # QuestionCard, Feedback, ProgressBar, ...
│  │  └─ questionTypes/      # eine Komponente pro Fragetyp
│  └─ pages/                 # Dashboard, Categories, Quiz, Result, Stats, Settings
└─ .github/workflows/deploy.yml
```

---

## 11. Deployment (GitHub Pages)

1. **Repo** erstellen (z. B. `parasiten-quiz`).
2. `vite.config.ts`: `base: '/parasiten-quiz/'` (Repo-Name), damit Asset-Pfade stimmen.
3. **GitHub Actions Workflow** `.github/workflows/deploy.yml`: baut bei jedem Push auf `main` und deployt nach Pages.

```yaml
name: Deploy
on:
  push: { branches: [main] }
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run validate    # Fragen-Schema prüfen — bricht bei Fehler ab
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages }
    steps:
      - uses: actions/deploy-pages@v4
```

4. In GitHub: **Settings → Pages → Source: GitHub Actions**.
5. Ergebnis: permanente URL `https://<user>.github.io/parasiten-quiz/`. Auf iPhone: Safari → Teilen → „Zum Home-Bildschirm" installiert die PWA. Auf PC: einfach die URL.
6. **Optional später:** eigene Domain (CNAME) und Custom-Domain in Pages-Settings.

**Für Nicht-Programmierer (Toms Lerngruppe):** nur die URL teilen. Keine Installation nötig; PWA-Installation ist optional für Offline-Nutzung.

---

## 12. Skalierungs-Pfad (v2, nur dokumentieren — nicht in v1 bauen)

v1 speichert Fortschritt **pro Gerät** (localStorage). Für breite Zugänglichkeit mit geräteübergreifendem Sync/Accounts später:

- **Backend-Option:** **Supabase** (kostenloser Tier: Auth + Postgres). Fortschritt und optional Fragenbank in DB. GitHub Pages bleibt Frontend; nur API-Calls dazu.
- **Auth:** Magic-Link/E-Mail oder Google-Login.
- **Zusatzfeatures:** Bestenliste/Leaderboard, geteilte Fragensätze, mehrere Fächer, Admin-UI zum Fragen-Editieren (statt JSON).
- **Migration:** Export/Import-Funktion aus v1 (Abschnitt 9) erleichtert Übernahme.
- **DSGVO:** Bei Accounts Datenschutzhinweis nötig; v1 (nur localStorage, keine Server) ist datensparsam.

Code so strukturieren (Storage hinter `lib/storage.ts`-Interface), dass ein späterer Wechsel von localStorage zu Supabase **nur diese Schicht** betrifft.

---

## 13. Build-Phasen für Opus (mit Abnahmekriterien)

**Phase 0 — Setup.** Vite+React+TS+Tailwind+PWA-Plugin, Repo, Actions-Workflow, leere Seiten-Routen. *Abnahme:* leere App deployt auf GitHub Pages, öffnet auf iPhone & PC.

**Phase 1 — Datenmodell & Validierung.** `types.ts`/Zod, `categories.json`, `validate-questions.ts`, `npm run validate`. *Abnahme:* Validierung läuft in CI, schlägt bei fehlerhafter Frage fehl.

**Phase 2 — Fragenbank generieren.** Aus `content/source/...` die `questions.json` erzeugen (Abschnitt 3). *Abnahme:* Zielkorridor Fragen, alle valide, breite Kategorie-Abdeckung, `needsReview`-Fälle markiert.

**Phase 3 — Fragetyp-Komponenten.** Alle Typen aus Abschnitt 6 mit Feedback + Erklärung. *Abnahme:* jeder Typ manuell durchspielbar, korrekte Auswertung.

**Phase 4 — Spaced Repetition + Session-Auswahl.** `srs.ts`, `selectSession.ts`, `storage.ts`. *Abnahme:* falsch beantwortete Fragen kommen früher wieder; Fälligkeit korrekt; Unit-Tests für SM-2.

**Phase 5 — Kategorie-Auswahl + Persistenz.** Filter-UI, Live-Zähler, Speicherung. *Abnahme:* Auswahl beeinflusst Fragenpool korrekt.

**Phase 6 — Dashboard, Ergebnis, Statistik, Gamification.** Streaks/XP/Abzeichen/Fortschritt. *Abnahme:* Werte aktualisieren korrekt über Sessions hinweg.

**Phase 7 — Einstellungen + Export/Import + Dark Mode + Politur.** *Abnahme:* Datenexport/-import funktioniert; responsive auf iPhone-Breiten (≤390px) und Desktop; Lighthouse PWA-tauglich.

**Phase 8 — Review-Modus (optional).** Zeigt `needsReview`-Fragen für Toms Kontrolle.

Jede Phase: eigener Commit/PR, Beschreibung was gebaut/getestet wurde.

---

## 14. Qualität & Tests

- **Unit-Tests (Vitest):** SM-2-Berechnung, Session-Auswahl, cloze-Toleranzprüfung, Statistik-Aggregation.
- **Schema-Validierung** als CI-Gate (Abschnitt 3.3).
- **Manuelle Checkliste:** jeder Fragetyp korrekt auswertbar; Umlaute korrekt; PWA installierbar; Offline-Nutzung nach erstem Laden.
- **Inhaltliche Prüfung:** `needsReview`-Fragen von Tom durchsehen lassen bevor breit geteilt wird.

---

## 15. Was Tom bereitstellen / entscheiden muss

1. ~~**Quelldokument exportieren**~~ ✅ **erledigt** — `Parasiten.md.md` liegt vor (nur nach `content/source/parasitologie-quelle.md` kopieren). Bilder für `image_id`-Fragen fehlen noch — nur exportieren, falls Bild-Fragen gewünscht sind.
2. **GitHub-Account** + Repo-Name (Vorschlag: `parasiten-quiz`).
3. **App-Name / Branding** (Vorschlag: „ParaQuiz" oder „Parasiten-Trainer") + evtl. Farbschema.
4. Ob **Bild-Fragen** gewünscht sind (nur wenn Bilder vorhanden).
5. Später: ob/wann **Accounts/Sync** (Abschnitt 12) gebaut werden sollen.

---

## 16. Zusammenfassung der Kernentscheidungen

- **Sprache:** komplett Deutsch (UI + Inhalt), UTF-8.
- **Stack:** Vite + React + TS + Tailwind, PWA, statische JSON-Fragenbank, localStorage, GitHub Pages.
- **Kein Backend in v1**, klarer Upgrade-Pfad zu Supabase für Accounts/Sync.
- **Fragetypen:** 9 verschiedene für Abwechslung (`image_id` nur, falls Bilder nachgeliefert werden).
- **Inhalt:** ~49 Helminthen-Monografien (Trematoden/Zestoden/Nematoden), konsistente Felder, Stern-Wichtigkeit, Zoonose/Meldepflicht-Flags.
- **Kategorien:** Mehrfach-Tagging über Dimensionen `class` / `subclass` / `host` / `topic` / `flags` + `importance` → flexible Nutzerauswahl, an die echte Quelle angepasst.
- **Retention:** SM-2 Spaced Repetition + sofortiges Feedback + Gamification.
- **Fragen:** von Opus aus dem Doc generiert, quellenbelegt, schema-validiert, kritische Fälle zur Kontrolle markiert.
```
