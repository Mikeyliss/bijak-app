export interface Option {
  id: string; // "A" | "B" | "C" | "D"
  text: string;
}

export interface Question {
  id: string;
  number: number;
  type: 'mcq' | 'true_false' | 'short_answer';
  text: string;
  topic: string; // e.g. "Cell Biology" - used to group weak areas in results
  options?: Option[];
  correctAnswer: string; // matches an Option.id for mcq/true_false
  explanation?: string;
  sourcePage?: number;
  verified: boolean; // did the model confirm this against the answer scheme
}

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  totalQuestions: number;
  verifiedCount: number;
  questions: Question[];
}

export interface QuizAnswer {
  questionId: string;
  chosen: string | null;
}
