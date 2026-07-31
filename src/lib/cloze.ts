function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function checkClozeAnswer(input: string, answer: string, acceptedAnswers?: string[]): boolean {
  const candidates = [answer, ...(acceptedAnswers ?? [])].map(normalize);
  return candidates.includes(normalize(input));
}
