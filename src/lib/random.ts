export function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Gewichtete Zufallsreihenfolge ohne Zurücklegen (Efraimidis-Spirakis): höher
 * gewichtete Elemente landen im Erwartungswert weiter vorn. Jedes Präfix des
 * Ergebnisses ist selbst eine gültige gewichtete Stichprobe — daher eignet
 * sich `.slice(0, n)` danach, um z.B. eine Fragetypen-Verteilung umzusetzen.
 * Gewicht 0 sortiert zuverlässig ans Ende (aber besser vorher ausschließen,
 * falls der Typ komplett ausgeschlossen werden soll).
 */
export function weightedShuffle<T>(items: T[], weightOf: (item: T) => number): T[] {
  return items
    .map((item) => {
      const weight = Math.max(weightOf(item), 1e-6);
      const key = Math.random() ** (1 / weight);
      return { item, key };
    })
    .sort((a, b) => b.key - a.key)
    .map((entry) => entry.item);
}
