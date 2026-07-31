import { describe, expect, it } from 'vitest';
import { shuffleOptions } from './shuffleOptions';

describe('shuffleOptions', () => {
  it('returns a permutation containing the same options', () => {
    const options = ['a', 'b', 'c', 'd'];
    const result = shuffleOptions(options);
    expect([...result.options].sort()).toEqual([...options].sort());
  });

  it('newIndexOf correctly maps each original option to its new position', () => {
    const options = ['a', 'b', 'c', 'd'];
    const { options: shuffled, newIndexOf } = shuffleOptions(options);
    options.forEach((option, originalIndex) => {
      expect(shuffled[newIndexOf[originalIndex]]).toBe(option);
    });
  });

  it('does not always place the first option first (statistically)', () => {
    const options = ['a', 'b', 'c', 'd', 'e', 'f'];
    let firstPositionCount = 0;
    for (let i = 0; i < 200; i++) {
      const { newIndexOf } = shuffleOptions(options);
      if (newIndexOf[0] === 0) firstPositionCount++;
    }
    // With 6 options, index 0 should land in position 0 only ~1/6 of the time.
    // Allow a generous margin to avoid flakiness while still catching a no-op shuffle.
    expect(firstPositionCount).toBeLessThan(100);
  });
});
