# JD Fit Checker

JD Fit Checker compares a public job posting with a candidate profile and returns an honest view of matched requirements, gaps, and a specific outreach opener.

## Run locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and add a Gemini API key.
3. Run `npm run dev` and open the local Vite URL.

The frontend calls `/api/analyze`. Use Vercel CLI (`vercel dev`) or a Vercel preview deployment to run the serverless function locally. Playwright must have its Chromium browser available in the deployment environment.

## Update the candidate profile

Edit `backend/profile.json`. The complete JSON object is sent to Gemini alongside each scraped job description, so keep the profile factual and current.

## Deploy

Import the repository into Vercel, set `GEMINI_API_KEY` (and optionally `GEMINI_MODEL`) in the project environment variables, and deploy. The API key is only read by the serverless function and is never bundled into the frontend.

## Scripts

- `npm run dev` starts Vite.
- `npm run build` creates the production frontend in `dist`.
- `npm run lint` checks the JavaScript source.
