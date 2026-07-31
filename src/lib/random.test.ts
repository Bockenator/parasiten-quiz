import { describe, expect, it } from 'vitest';
import { shuffle, weightedShuffle } from './random';

describe('shuffle', () => {
  it('returns a permutation with the same elements', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    expect(result).toHaveLength(input.length);
    expect([...result].sort()).toEqual([...input].sort());
  });

  it('does not mutate the input array', () => {
    const input = [1, 2, 3];
    shuffle(input);
    expect(input).toEqual([1, 2, 3]);
  });
});

describe('weightedShuffle', () => {
  it('returns a permutation with the same elements', () => {
    const input = ['a', 'b', 'c', 'd'];
    const result = weightedShuffle(input, () => 1);
    expect(result).toHaveLength(input.length);
    expect([...result].sort()).toEqual([...input].sort());
  });

  it('does not mutate the input array', () => {
    const input = ['a', 'b', 'c'];
    weightedShuffle(input, () => 1);
    expect(input).toEqual(['a', 'b', 'c']);
  });

  it('places a much heavier-weighted item near the front far more often than a much lighter one', () => {
    const items = ['heavy', 'light'];
    const weightOf = (item: string) => (item === 'heavy' ? 100 : 1);

    let heavyFirstCount = 0;
    const trials = 200;
    for (let i = 0; i < trials; i++) {
      if (weightedShuffle(items, weightOf)[0] === 'heavy') heavyFirstCount++;
    }
    // Mit Gewicht 100 vs. 1 sollte "heavy" fast immer vorne landen.
    expect(heavyFirstCount).toBeGreaterThan(trials * 0.9);
  });

  it('a zero-weight item consistently sorts to the very end when a positive-weight item is present', () => {
    const items = ['excluded', 'included'];
    const weightOf = (item: string) => (item === 'excluded' ? 0 : 1);

    for (let i = 0; i < 50; i++) {
      expect(weightedShuffle(items, weightOf)).toEqual(['included', 'excluded']);
    }
  });
});
