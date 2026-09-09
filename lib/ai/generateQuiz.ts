import { GoogleGenerativeAI } from '@google/generative-ai';
import { quizResponseSchema } from './schema';
import type { Quiz, Question } from '@/lib/quiz/types';
import type { RenderedPage } from '@/lib/pdf/renderPdfToImages';

const PROMPT = `You are marking a Malaysian SPM past-year exam paper so it can be turned into a
self-check quiz for a student.

You will see two sets of images, in order:
1. The QUESTION PAPER pages.
2. The ANSWER SCHEME pages.

Task:
- Transcribe every question from the question paper faithfully. Do not invent or
  paraphrase content that isn't there.
- For each question, find its official answer in the answer scheme images and set
  "correctAnswer" to match it exactly.
- Only set "verified" to true if you actually located that question's number in the
  answer scheme. If you could not find a matching entry, set "verified" to false and
  make your best attempt at "correctAnswer" from the question paper alone.
- Tag each question with a short SPM syllabus subtopic ("topic") so a student can see
  which topics they're weak in.
- Keep explanations short (1-2 sentences) and grounded in the scheme, not invented.
- If a question has a diagram that matters, describe it briefly as part of "text" so
  the question still makes sense to someone who can't see the original image.
- Number questions using the number printed on the paper.

Return only the structured JSON described by the response schema.`;

function imagesToParts(images: RenderedPage[], label: string) {
  const parts: any[] = [{ text: `--- ${label} ---` }];
  for (const img of images) {
    parts.push({ text: `Page ${img.page}:` });
    parts.push({ inlineData: { mimeType: img.mimeType, data: img.base64 } });
  }
  return parts;
}

export async function generateQuiz({
  questionPages,
  answerPages,
  subject,
  apiKey
}: {
  questionPages: RenderedPage[];
  answerPages: RenderedPage[];
  subject: string;
  apiKey: string;
}): Promise<Quiz> {
  if (!apiKey) {
    throw new Error('No Gemini API key was provided.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-flash-latest',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: quizResponseSchema as any
    }
  });

  const contents = [
    { text: PROMPT },
    { text: `Subject: ${subject}` },
    ...imagesToParts(questionPages, 'QUESTION PAPER'),
    ...imagesToParts(answerPages, 'ANSWER SCHEME')
  ];

  let result;
  try {
    result = await model.generateContent(contents as any);
  } catch (err: any) {
    const msg = String(err?.message || err);
    if (msg.includes('API key not valid') || msg.includes('API_KEY_INVALID')) {
      throw new Error('That Gemini API key was rejected. Double-check it in Settings and try again.');
    }
    if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
      throw new Error("You've hit your Gemini quota/rate limit. Wait a bit and try again.");
    }
    throw new Error(`Gemini request failed: ${msg}`);
  }
  const raw = result.response.text();

  let parsed: { title: string; questions: any[] };
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('The model did not return valid JSON. Try again, or try fewer pages at once.');
  }

  const questions: Question[] = (parsed.questions || []).map((q: any, i: number) => ({
    id: `q${i + 1}`,
    number: q.number ?? i + 1,
    type: q.type ?? 'mcq',
    text: q.text ?? '',
    topic: q.topic ?? 'General',
    options: Array.isArray(q.options) ? q.options : undefined,
    correctAnswer: q.correctAnswer ?? '',
    explanation: q.explanation ?? undefined,
    sourcePage: q.sourcePage ?? undefined,
    verified: Boolean(q.verified)
  }));

  return {
    id: `quiz_${Date.now()}`,
    title: parsed.title || `${subject} Quiz`,
    subject,
    totalQuestions: questions.length,
    verifiedCount: questions.filter((q) => q.verified).length,
    questions
  };
}
