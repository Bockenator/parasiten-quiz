let audioContext: AudioContext | undefined;

function getAudioContext(): AudioContext | undefined {
  if (typeof window === 'undefined' || !window.AudioContext) return undefined;
  audioContext ??= new AudioContext();
  return audioContext;
}

function beep(frequency: number, durationMs: number): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  oscillator.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;
  const durationSeconds = durationMs / 1000;
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSeconds);
  oscillator.start(now);
  oscillator.stop(now + durationSeconds);
}

export function playCorrectSound(): void {
  beep(880, 150);
}

export function playIncorrectSound(): void {
  beep(220, 220);
}
