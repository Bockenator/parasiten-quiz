export type QuestionTypeProps<Q> = {
  question: Q;
  submitted: boolean;
  onSubmit: (correct: boolean) => void;
};
