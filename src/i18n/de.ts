// Zentrale Sammlung aller nutzer-sichtbaren Texte (Deutsch).
export const de = {
  appName: 'ParaQuiz',
  appTagline: 'Parasiten-Trainer für die Veterinärmedizin',
  nav: {
    dashboard: 'Start',
    categories: 'Kategorien',
    quiz: 'Quiz',
    result: 'Ergebnis',
    stats: 'Statistik',
    settings: 'Einstellungen',
  },
  pages: {
    dashboard: {
      title: 'Willkommen bei ParaQuiz',
      placeholder: 'Hier entsteht das Dashboard mit Streak, Tagesziel und Schnellstart.',
    },
    categories: {
      title: 'Kategorien wählen',
      placeholder: 'Hier entsteht die Auswahl nach Parasitengruppe, Wirt, Thema und Merkmalen.',
    },
    quiz: {
      title: 'Quiz',
      placeholder: 'Hier entsteht die Lern-/Prüfungssession mit allen Fragetypen.',
    },
    result: {
      title: 'Ergebnis',
      placeholder: 'Hier entsteht die Auswertung der letzten Session.',
    },
    stats: {
      title: 'Statistik',
      placeholder: 'Hier entsteht der Fortschritt pro Kategorie und der Lernverlauf.',
    },
    settings: {
      title: 'Einstellungen',
      placeholder: 'Hier entstehen Tagesziel, Export/Import und Dark Mode.',
    },
  },
} as const;
