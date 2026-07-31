import { z } from 'zod';

export const categoryDimensionIds = ['class', 'subclass', 'host', 'topic', 'flags'] as const;
export type CategoryDimensionId = (typeof categoryDimensionIds)[number];

export const categoryValueSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
});

export const categoryDimensionSchema = z.object({
  id: z.enum(categoryDimensionIds),
  label: z.string().min(1),
  values: z.array(categoryValueSchema).min(1),
});

export const categoriesSchema = z.object({
  dimensions: z.array(categoryDimensionSchema).min(1),
});

export type CategoryDimension = z.infer<typeof categoryDimensionSchema>;
export type Categories = z.infer<typeof categoriesSchema>;

export const difficultySchema = z.enum(['leicht', 'mittel', 'schwer']);
export type Difficulty = z.infer<typeof difficultySchema>;

export const importanceSchema = z.union([z.literal(1), z.literal(2), z.literal(3)]);
export type Importance = z.infer<typeof importanceSchema>;

export const tagsSchema = z.object({
  class: z.array(z.string()).min(1),
  subclass: z.array(z.string()),
  host: z.array(z.string()).min(1),
  topic: z.array(z.string()).min(1),
  flags: z.array(z.string()),
});
export type Tags = z.infer<typeof tagsSchema>;

const baseQuestionFields = {
  id: z.string().min(1),
  prompt: z.string().min(1),
  parasite: z.string().min(1),
  tags: tagsSchema,
  importance: importanceSchema,
  difficulty: difficultySchema,
  explanation: z.string().min(1),
  source: z.string().min(1),
  needsReview: z.boolean(),
  image: z.string().min(1).nullable(),
};

// Plain ZodObjects only (no .refine chains) — z.discriminatedUnion needs
// direct access to each variant's `type` literal via `.shape`. Cross-field
// checks (e.g. correctIndex within options bounds) run in the superRefine
// below, once the discriminated union itself is assembled.

const singleCorrectFields = {
  options: z.array(z.string().min(1)).min(2),
  correctIndex: z.number().int().min(0),
};

export const singleChoiceQuestionSchema = z.object({
  ...baseQuestionFields,
  type: z.literal('single_choice'),
  ...singleCorrectFields,
});

export const caseVignetteQuestionSchema = z.object({
  ...baseQuestionFields,
  type: z.literal('case_vignette'),
  ...singleCorrectFields,
});

export const imageIdQuestionSchema = z.object({
  ...baseQuestionFields,
  type: z.literal('image_id'),
  ...singleCorrectFields,
  image: z.string().min(1),
});

export const multipleChoiceQuestionSchema = z.object({
  ...baseQuestionFields,
  type: z.literal('multiple_choice'),
  options: z.array(z.string().min(1)).min(2),
  correctIndices: z.array(z.number().int().min(0)).min(1),
});

export const trueFalseQuestionSchema = z.object({
  ...baseQuestionFields,
  type: z.literal('true_false'),
  answer: z.boolean(),
});

export const clozeQuestionSchema = z.object({
  ...baseQuestionFields,
  type: z.literal('cloze'),
  answer: z.string().min(1),
  acceptedAnswers: z.array(z.string().min(1)).optional(),
});

export const matchingQuestionSchema = z.object({
  ...baseQuestionFields,
  type: z.literal('matching'),
  left: z.array(z.string().min(1)).min(2),
  right: z.array(z.string().min(1)).min(2),
  correctPairs: z.array(z.tuple([z.number().int().min(0), z.number().int().min(0)])).min(2),
});

export const orderingQuestionSchema = z.object({
  ...baseQuestionFields,
  type: z.literal('ordering'),
  items: z.array(z.string().min(1)).min(2),
  correctOrder: z.array(z.number().int().min(0)).min(2),
});

export const flashcardQuestionSchema = z.object({
  ...baseQuestionFields,
  type: z.literal('flashcard'),
  front: z.string().min(1),
  back: z.string().min(1),
});

const questionUnionSchema = z.discriminatedUnion('type', [
  singleChoiceQuestionSchema,
  multipleChoiceQuestionSchema,
  trueFalseQuestionSchema,
  clozeQuestionSchema,
  matchingQuestionSchema,
  orderingQuestionSchema,
  imageIdQuestionSchema,
  flashcardQuestionSchema,
  caseVignetteQuestionSchema,
]);

function isPermutation(values: number[], length: number): boolean {
  if (values.length !== length) return false;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted.every((value, index) => value === index);
}

export const questionSchema = questionUnionSchema.superRefine((q, ctx) => {
  switch (q.type) {
    case 'single_choice':
    case 'case_vignette':
    case 'image_id':
      if (q.correctIndex >= q.options.length) {
        ctx.addIssue({
          code: 'custom',
          message: 'correctIndex liegt außerhalb von options',
          path: ['correctIndex'],
        });
      }
      break;

    case 'multiple_choice':
      if (new Set(q.correctIndices).size !== q.correctIndices.length) {
        ctx.addIssue({
          code: 'custom',
          message: 'correctIndices enthält Duplikate',
          path: ['correctIndices'],
        });
      }
      if (q.correctIndices.some((i) => i >= q.options.length)) {
        ctx.addIssue({
          code: 'custom',
          message: 'correctIndices enthält einen Index außerhalb von options',
          path: ['correctIndices'],
        });
      }
      break;

    case 'matching': {
      if (q.left.length !== q.right.length) {
        ctx.addIssue({
          code: 'custom',
          message: 'left und right müssen gleich lang sein',
          path: ['right'],
        });
      }
      if (q.correctPairs.length !== q.left.length) {
        ctx.addIssue({
          code: 'custom',
          message: 'correctPairs muss für jedes left-Element genau ein Paar enthalten',
          path: ['correctPairs'],
        });
      }
      const leftIndices = q.correctPairs.map(([l]) => l);
      if (!isPermutation(leftIndices, q.left.length)) {
        ctx.addIssue({
          code: 'custom',
          message: 'correctPairs deckt nicht jeden left-Index genau einmal ab',
          path: ['correctPairs'],
        });
      }
      const rightIndices = q.correctPairs.map(([, r]) => r);
      if (!isPermutation(rightIndices, q.right.length)) {
        ctx.addIssue({
          code: 'custom',
          message: 'correctPairs deckt nicht jeden right-Index genau einmal ab',
          path: ['correctPairs'],
        });
      }
      break;
    }

    case 'ordering':
      if (!isPermutation(q.correctOrder, q.items.length)) {
        ctx.addIssue({
          code: 'custom',
          message: 'correctOrder muss eine Permutation von 0..items.length-1 sein',
          path: ['correctOrder'],
        });
      }
      break;

    case 'true_false':
    case 'cloze':
    case 'flashcard':
      break;
  }
});

export type Question = z.infer<typeof questionUnionSchema>;
export type QuestionType = Question['type'];

// Spaced-Repetition-Fortschritt pro Frage (SM-2), siehe src/lib/srs.ts.
export const cardProgressSchema = z.object({
  id: z.string().min(1),
  ease: z.number(),
  intervalDays: z.number().min(0),
  repetitions: z.number().int().min(0),
  due: z.string().min(1), // Datum als YYYY-MM-DD
  lastQuality: z.number().int().min(0).max(5),
  history: z.array(z.object({ date: z.string().min(1), quality: z.number().int().min(0).max(5) })),
});
export type CardProgress = z.infer<typeof cardProgressSchema>;

export const progressMapSchema = z.record(z.string(), cardProgressSchema);
export type ProgressMap = z.infer<typeof progressMapSchema>;

export type SingleChoiceQuestion = Extract<Question, { type: 'single_choice' }>;
export type MultipleChoiceQuestion = Extract<Question, { type: 'multiple_choice' }>;
export type TrueFalseQuestion = Extract<Question, { type: 'true_false' }>;
export type ClozeQuestion = Extract<Question, { type: 'cloze' }>;
export type MatchingQuestion = Extract<Question, { type: 'matching' }>;
export type OrderingQuestion = Extract<Question, { type: 'ordering' }>;
export type ImageIdQuestion = Extract<Question, { type: 'image_id' }>;
export type FlashcardQuestion = Extract<Question, { type: 'flashcard' }>;
export type CaseVignetteQuestion = Extract<Question, { type: 'case_vignette' }>;

export const questionsSchema = z.array(questionSchema);
