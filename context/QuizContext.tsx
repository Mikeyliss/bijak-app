'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Quiz, QuizAnswer } from '@/lib/quiz/types';

const API_KEY_STORAGE_KEY = 'bijak:gemini-api-key';

interface PendingUpload {
  questionPdf: File;
  answerPdf: File;
  subject: string;
}

interface QuizContextValue {
  apiKey: string;
  setApiKey: (k: string) => void;
  pendingUpload: PendingUpload | null;
  setPendingUpload: (u: PendingUpload | null) => void;
  quiz: Quiz | null;
  setQuiz: (q: Quiz | null) => void;
  answers: QuizAnswer[];
  setAnswers: (a: QuizAnswer[]) => void;
  reset: () => void;
}

const QuizContext = createContext<QuizContextValue | null>(null);

export function QuizProvider({ children }: { children: ReactNode }) {
  // The key never touches our server except as part of a single generate
  // request (see app/api/generate/route.ts) — it's kept here and in
  // localStorage only so the visitor doesn't have to retype it every time.
  const [apiKey, setApiKeyState] = useState('');
  const [pendingUpload, setPendingUpload] = useState<PendingUpload | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);

  useEffect(() => {
    const saved = window.localStorage.getItem(API_KEY_STORAGE_KEY);
    if (saved) setApiKeyState(saved);
  }, []);

  function setApiKey(k: string) {
    setApiKeyState(k);
    if (k) window.localStorage.setItem(API_KEY_STORAGE_KEY, k);
    else window.localStorage.removeItem(API_KEY_STORAGE_KEY);
  }

  function reset() {
    setPendingUpload(null);
    setQuiz(null);
    setAnswers([]);
  }

  return (
    <QuizContext.Provider
      value={{
        apiKey,
        setApiKey,
        pendingUpload,
        setPendingUpload,
        quiz,
        setQuiz,
        answers,
        setAnswers,
        reset
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error('useQuiz must be used inside <QuizProvider>');
  return ctx;
}
