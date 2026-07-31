import { useState } from 'react';
import { de } from '../../i18n/de';
import type { MatchingQuestion as MatchingQuestionType } from '../../types';
import { PrimaryButton } from '../PrimaryButton';
import type { QuestionTypeProps } from './types';
import { optionButtonClasses } from './optionStyles';

export function MatchingQuestion({ question, submitted, onSubmit }: QuestionTypeProps<MatchingQuestionType>) {
  const [pairs, setPairs] = useState<Record<number, number>>({});
  const [activeLeft, setActiveLeft] = useState<number | null>(null);

  const rightToLeft = new Map<number, number>();
  for (const [left, right] of Object.entries(pairs)) {
    rightToLeft.set(right, Number(left));
  }

  function selectLeft(leftIndex: number) {
    if (submitted) return;
    setActiveLeft((current) => (current === leftIndex ? null : leftIndex));
  }

  function selectRight(rightIndex: number) {
    if (submitted || activeLeft === null) return;
    setPairs((prev) => {
      const next = { ...prev };
      // Falls dieser rechte Begriff schon einem anderen linken Begriff zugeordnet war, lösen.
      for (const [left, right] of Object.entries(next)) {
        if (right === rightIndex) delete next[Number(left)];
      }
      next[activeLeft] = rightIndex;
      return next;
    });
    setActiveLeft(null);
  }

  function reset() {
    setPairs({});
    setActiveLeft(null);
  }

  function handleCheck() {
    const correct = question.correctPairs.every(([left, right]) => pairs[left] === right);
    onSubmit(correct);
  }

  const allPaired = Object.keys(pairs).length === question.left.length;

  function pairCorrectness(leftIndex: number): boolean | null {
    if (!(leftIndex in pairs)) return null;
    const correctRight = question.correctPairs.find(([left]) => left === leftIndex)?.[1];
    return pairs[leftIndex] === correctRight;
  }

  return (
    <div>
      <p className="text-lg font-medium">{question.prompt}</p>
      {!submitted && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{de.quiz.matchingHint}</p>}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          {question.left.map((label, leftIndex) => {
            const isPaired = leftIndex in pairs;
            const correctness = submitted ? pairCorrectness(leftIndex) : null;
            let state: 'idle' | 'selected' | 'correct' | 'incorrect' = 'idle';
            if (submitted) state = correctness ? 'correct' : 'incorrect';
            else if (activeLeft === leftIndex) state = 'selected';
            else if (isPaired) state = 'selected';
            return (
              <button
                key={leftIndex}
                type="button"
                disabled={submitted}
                onClick={() => selectLeft(leftIndex)}
                className={`${optionButtonClasses(state)} text-sm`}
              >
                {isPaired && !submitted ? `${leftIndex + 1}. ` : ''}
                {label}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-2">
          {question.right.map((label, rightIndex) => {
            const pairedLeft = rightToLeft.get(rightIndex);
            const isPaired = pairedLeft !== undefined;
            const correctness = submitted && pairedLeft !== undefined ? pairCorrectness(pairedLeft) : null;
            let state: 'idle' | 'selected' | 'correct' | 'incorrect' = 'idle';
            if (submitted) state = isPaired ? (correctness ? 'correct' : 'incorrect') : 'idle';
            else if (isPaired) state = 'selected';
            return (
              <button
                key={rightIndex}
                type="button"
                disabled={submitted}
                onClick={() => selectRight(rightIndex)}
                className={`${optionButtonClasses(state)} text-sm`}
              >
                {isPaired && !submitted ? `${pairedLeft + 1}. ` : ''}
                {label}
              </button>
            );
          })}
        </div>
      </div>
      {!submitted && (
        <div className="mt-4 flex items-center gap-3">
          <PrimaryButton onClick={handleCheck} disabled={!allPaired}>
            {de.quiz.checkAnswer}
          </PrimaryButton>
          <button
            type="button"
            onClick={reset}
            className="text-sm text-slate-500 underline dark:text-slate-400"
          >
            {de.quiz.matchingReset}
          </button>
        </div>
      )}
    </div>
  );
}
