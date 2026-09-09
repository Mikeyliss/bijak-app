'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brand } from '@/components/Brand';
import { useQuiz } from '@/context/QuizContext';
import type { Quiz } from '@/lib/quiz/types';

const STATUS_MESSAGES = [
  'reading the question paper',
  'reading the answer scheme',
  'matching questions to the scheme',
  'writing explanations',
  'verifying every answer'
];

export default function GeneratePage() {
  const router = useRouter();
  const { pendingUpload, apiKey, setQuiz } = useQuiz();
  const [statusIndex, setStatusIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!pendingUpload || !apiKey) {
      router.replace('/');
      return;
    }
    if (started.current) return;
    started.current = true;

    const cycle = setInterval(() => {
      setStatusIndex((i) => Math.min(i + 1, STATUS_MESSAGES.length - 1));
    }, 1800);

    (async () => {
      try {
        const form = new FormData();
        form.append('questionPdf', pendingUpload.questionPdf);
        form.append('answerPdf', pendingUpload.answerPdf);
        form.append('subject', pendingUpload.subject);
        form.append('apiKey', apiKey);

        const res = await fetch('/api/generate', { method: 'POST', body: form });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || 'Failed to generate the quiz.');
        }

        const quiz = data as Quiz;
        if (!quiz.questions?.length) {
          throw new Error('No questions came back. Try a clearer scan, or fewer pages at once.');
        }

        setQuiz(quiz);
        router.push('/quiz');
      } catch (err: any) {
        clearInterval(cycle);
        setError(err?.message || 'Something went wrong.');
      }
    })();

    return () => clearInterval(cycle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingUpload]);

  return (
    <>
      <Brand tagLine="MARKING" />
      <div className="sheet">
        <div className="sheet-inner">
          <p className="kicker">// tunggu sekejap</p>
          <div className="gen-title">marking your paper...</div>
          <div className="pencil-track">
            <span className="pencil">✏️</span>
          </div>
          <div className="gen-status">
            {error ? 'something went wrong' : STATUS_MESSAGES[statusIndex]}
          </div>

          <ul className="checklist">
            {STATUS_MESSAGES.map((msg, i) => (
              <li key={msg} className={i <= statusIndex && !error ? 'done' : ''}>
                <span className="tick">{i <= statusIndex && !error ? '✓' : ''}</span> {msg}
              </li>
            ))}
          </ul>

          {error && (
            <>
              <div className="error-note">{error}</div>
              <button className="btn-primary" onClick={() => router.push('/')}>
                Back to upload
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
