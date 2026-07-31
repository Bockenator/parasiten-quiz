import { shuffle } from './random';

export type ShuffledOptions = {
  options: string[];
  /** newIndexOf[originalIndex] = index of that option after shuffling. */
  newIndexOf: number[];
};

export function shuffleOptions(options: string[]): ShuffledOptions {
  const order = shuffle(options.map((_, index) => index));
  const newIndexOf: number[] = new Array(options.length);
  order.forEach((originalIndex, newIndex) => {
    newIndexOf[originalIndex] = newIndex;
  });
  return { options: order.map((originalIndex) => options[originalIndex]), newIndexOf };
}
