import { describe, expect, it } from 'vitest';
import { checkClozeAnswer } from './cloze';

describe('checkClozeAnswer', () => {
  it('accepts an exact match', () => {
    expect(checkClozeAnswer('hepatica', 'hepatica')).toBe(true);
  });

  it('ignores case', () => {
    expect(checkClozeAnswer('Hepatica', 'hepatica')).toBe(true);
  });

  it('trims surrounding whitespace', () => {
    expect(checkClozeAnswer('  hepatica  ', 'hepatica')).toBe(true);
  });

  it('collapses repeated internal whitespace', () => {
    expect(checkClozeAnswer('T.   canis', 'T. canis')).toBe(true);
  });

  it('accepts a listed alternative answer', () => {
    expect(checkClozeAnswer('t. canis', 'Toxocara canis', ['T. canis'])).toBe(true);
  });

  it('rejects a wrong answer', () => {
    expect(checkClozeAnswer('spiralis', 'hepatica')).toBe(false);
  });
});
