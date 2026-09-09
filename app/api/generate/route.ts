import { NextResponse } from 'next/server';
import { renderPdfToImages } from '@/lib/pdf/renderPdfToImages';
import { generateQuiz } from '@/lib/ai/generateQuiz';

export const runtime = 'nodejs';
// PDF rendering + a multimodal call can take a while - give it room.
export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const questionFile = form.get('questionPdf') as File | null;
    const answerFile = form.get('answerPdf') as File | null;
    const subject = (form.get('subject') as string | null) || 'General';
    const apiKey = (form.get('apiKey') as string | null) || '';

    if (!questionFile || !answerFile) {
      return NextResponse.json(
        { error: 'Both questionPdf and answerPdf files are required.' },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Add your Gemini API key first (see Settings on the upload screen).' },
        { status: 400 }
      );
    }

    const [questionBuffer, answerBuffer] = await Promise.all([
      questionFile.arrayBuffer().then(Buffer.from),
      answerFile.arrayBuffer().then(Buffer.from)
    ]);

    const [questionPages, answerPages] = await Promise.all([
      renderPdfToImages(questionBuffer),
      renderPdfToImages(answerBuffer)
    ]);

    const quiz = await generateQuiz({ questionPages, answerPages, subject, apiKey });

    return NextResponse.json(quiz);
  } catch (err: any) {
    console.error('generate route failed:', err);
    return NextResponse.json(
      { error: err?.message || 'Something went wrong generating the quiz.' },
      { status: 500 }
    );
  }
}
