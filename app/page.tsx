'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brand } from '@/components/Brand';
import { useQuiz } from '@/context/QuizContext';

const SUBJECTS = ['Biology', 'Chemistry', 'Science', 'Maths', 'Sejarah', 'B. Melayu'];

export default function UploadPage() {
  const router = useRouter();
  const { apiKey, setApiKey, setPendingUpload, reset } = useQuiz();

  const [questionPdf, setQuestionPdf] = useState<File | null>(null);
  const [answerPdf, setAnswerPdf] = useState<File | null>(null);
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [keyInput, setKeyInput] = useState('');
  const [editingKey, setEditingKey] = useState(false);

  const questionInputRef = useRef<HTMLInputElement>(null);
  const answerInputRef = useRef<HTMLInputElement>(null);

  const canGenerate = Boolean(questionPdf && answerPdf && apiKey);

  function saveKey() {
    setApiKey(keyInput.trim());
    setKeyInput('');
    setEditingKey(false);
  }

  function handleGenerate() {
    if (!questionPdf || !answerPdf) return;
    reset();
    setPendingUpload({ questionPdf, answerPdf, subject });
    router.push('/generate');
  }

  return (
    <>
      <Brand tagLine="FORM 4 · FORM 5" />
      <div className="sheet">
        <div className="sheet-inner">
          <p className="kicker">// jom mula</p>
          <h1 className="screen-title">Turn any past-year paper into a quiz.</h1>
          <p className="screen-sub">
            Upload the question paper and the answer scheme — Bijak checks every answer
            against the real scheme, so nothing&apos;s made up.
          </p>

          <div
            className={`dropzone ${questionPdf ? 'filled' : ''}`}
            onClick={() => questionInputRef.current?.click()}
          >
            <span className="stamp-corner">soalan</span>
            <div className="icon">📄</div>
            <div className="label">{questionPdf ? 'Uploaded ✓' : 'Drop question paper (PDF)'}</div>
            <div className="sub">{questionPdf ? questionPdf.name : 'or tap to browse'}</div>
            <input
              ref={questionInputRef}
              type="file"
              accept="application/pdf"
              onChange={(e) => setQuestionPdf(e.target.files?.[0] || null)}
            />
          </div>

          <div
            className={`dropzone ${answerPdf ? 'filled' : ''}`}
            onClick={() => answerInputRef.current?.click()}
          >
            <span className="stamp-corner">skema</span>
            <div className="icon">🖊️</div>
            <div className="label">{answerPdf ? 'Uploaded ✓' : 'Drop answer scheme (PDF)'}</div>
            <div className="sub">{answerPdf ? answerPdf.name : 'or tap to browse'}</div>
            <input
              ref={answerInputRef}
              type="file"
              accept="application/pdf"
              onChange={(e) => setAnswerPdf(e.target.files?.[0] || null)}
            />
          </div>

          <span className="field-label">// your gemini key</span>
          {apiKey && !editingKey ? (
            <div className="key-row">
              <span className="key-pill">key saved ✓ ({apiKey.slice(0, 4)}…{apiKey.slice(-4)})</span>
              <button className="key-edit" onClick={() => setEditingKey(true)}>
                change
              </button>
            </div>
          ) : (
            <div className="key-row">
              <input
                className="key-input"
                type="password"
                placeholder="paste your Gemini API key"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
              />
              <button className="key-edit" onClick={saveKey} disabled={!keyInput.trim()}>
                save
              </button>
            </div>
          )}
          <p className="key-hint">
            Free at{' '}
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">
              aistudio.google.com/apikey
            </a>{' '}
            — stored only in your browser, sent straight through to Gemini for each quiz, never saved on any server.
          </p>

          <span className="field-label">// subjek</span>
          <div className="chips">
            {SUBJECTS.map((s) => (
              <button
                key={s}
                className={`chip ${subject === s ? 'selected' : ''}`}
                onClick={() => setSubject(s)}
              >
                {s}
              </button>
            ))}
          </div>

          <button className="btn-primary" disabled={!canGenerate} onClick={handleGenerate}>
            Generate quiz →
          </button>
        </div>
      </div>
    </>
  );
}
