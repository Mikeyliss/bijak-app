import { SchemaType } from '@google/generative-ai';

// Mirrors lib/quiz/types.ts - kept separate because Gemini's structured
// output schema uses its own (OpenAPI-subset) format, not TS types directly.
export const quizResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    title: { type: SchemaType.STRING, description: 'Short title for this exam, e.g. "Biology Paper 1 - Cell Structure"' },
    questions: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          number: { type: SchemaType.INTEGER, description: 'Question number as printed on the paper' },
          type: { type: SchemaType.STRING, format: 'enum', enum: ['mcq', 'true_false', 'short_answer'] },
          text: { type: SchemaType.STRING, description: 'The full question text, transcribed faithfully' },
          topic: { type: SchemaType.STRING, description: 'Short SPM syllabus subtopic this question belongs to, e.g. "Cell Biology", "Genetics"' },
          options: {
            type: SchemaType.ARRAY,
            description: 'For mcq/true_false only. Omit for short_answer.',
            items: {
              type: SchemaType.OBJECT,
              properties: {
                id: { type: SchemaType.STRING, description: 'Option letter, e.g. A, B, C, D' },
                text: { type: SchemaType.STRING }
              },
              required: ['id', 'text']
            }
          },
          correctAnswer: { type: SchemaType.STRING, description: 'The option id (A/B/C/D) that matches the official answer scheme, or the short answer text' },
          explanation: { type: SchemaType.STRING, description: 'One or two sentences on why this is correct, referencing the scheme' },
          sourcePage: { type: SchemaType.INTEGER, description: 'Page number (1-indexed, in the question paper images) this question appears on' },
          verified: { type: SchemaType.BOOLEAN, description: 'True only if you found an explicit, matching entry for this question number in the answer scheme images' }
        },
        required: ['number', 'type', 'text', 'topic', 'correctAnswer', 'verified']
      }
    }
  },
  required: ['title', 'questions']
};
