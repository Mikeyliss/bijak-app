# Bijak!

Upload a past-year SPM question paper + its answer scheme (both PDFs), and get
back a self-check quiz — generated and verified by Gemini.

Live demo: _not deployed yet — repo only for now._

## How it works

1. **Upload** — drop the question paper and answer scheme PDFs, pick a subject,
   paste in your own Gemini API key.
2. **Marking** — the server rasterizes every PDF page to an image and sends the
   whole set to Gemini in one multimodal request, asking it to transcribe every
   question, match it against the scheme, and tag a topic for weak-area tracking.
3. **Quiz** — one question at a time, OMR-bubble style. Any question Gemini
   couldn't confirm against the scheme is flagged so you know to double-check it.
4. **Results** — score, a breakdown of which topics you got wrong most, and a
   button to retry just the mistakes.

There's no database, no login, and no server-side API key — everything lives
in memory/localStorage in your own browser. Close the tab and the quiz is
gone; that's intentional for this version.

## Bring your own key

This repo is public, so it doesn't ship with (or use) a shared Gemini key.
Each visitor pastes their own key into the Settings field on the upload
screen. A few things worth knowing:

- The key is stored **only in your browser's localStorage**.
- When you click "Generate quiz," the key is sent to this app's own
  `/api/generate` route (which has to run server-side to rasterize PDFs), and
  from there straight to Google's Gemini API for that one request. It is never
  written to a database, a file, or a log.
- Get a free key at https://aistudio.google.com/apikey — the free tier is
  enough to try this out.
- If you fork this and deploy it somewhere, anyone who visits will need their
  own key too — nothing to configure on your end.

## Setup (running it yourself)

You'll need Node.js 18.18+.

```bash
git clone <this-repo-url>
cd bijak
npm install
npm run dev
```

Open http://localhost:3000, paste your Gemini key into Settings on the
upload screen, and go.

## Deploying it live later

Nothing in this project is tied to local-only usage — when you're ready:

- **Vercel** is the easiest fit for Next.js (`vercel.com/new`, import this
  GitHub repo, deploy — no environment variables required since there's no
  server key).
- Any other Node.js host works too, as long as it can run `npm run build`
  followed by `npm start`.

## Notes / known limits

- **Page limit**: each PDF is capped at 20 pages (see `maxPages` in
  `lib/pdf/renderPdfToImages.ts`) to keep request size and processing time
  reasonable. Raise it if your papers are longer.
- **`@napi-rs/canvas`**: rasterizes PDF pages to PNGs server-side. Ships
  prebuilt binaries for the common platforms, so `npm install` should just
  work without extra build tools.
- **Cost**: each "Generate quiz" click is one Gemini call per visitor's own
  key — costs (if any, beyond the free tier) are theirs, not yours.
- **No persistence**: nothing is saved between sessions. When you're ready to
  keep past quizzes or a mistake bank, that's the natural point to add a
  database — the `Quiz` type in `lib/quiz/types.ts` is already the shape
  you'd persist.
- **Accuracy**: Gemini only marks a question `verified: true` when it found a
  matching entry in the answer scheme images. Anything unverified is flagged
  in the quiz UI — worth a manual glance.

## Project structure

```
app/
  page.tsx              upload screen + API key settings
  generate/page.tsx     calls /api/generate, shows the marking animation
  quiz/page.tsx         quiz player
  results/page.tsx      score + weak areas
  api/generate/route.ts the pipeline (PDF -> images -> Gemini -> Quiz JSON)
lib/
  pdf/renderPdfToImages.ts   PDF -> PNG pages (pdfjs-dist + @napi-rs/canvas)
  ai/generateQuiz.ts         builds the Gemini request, parses the response
  ai/schema.ts               the structured-output schema Gemini must follow
  quiz/types.ts              shared Quiz/Question types
context/QuizContext.tsx      holds api key/files/quiz/answers across pages
```

## License

MIT — see [LICENSE](./LICENSE).
