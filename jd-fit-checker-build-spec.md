# JD Fit Checker — AI Job Description Fit Analyzer

Build spec for a senior software engineer. This must ship as a production-quality tool, not a demo or prototype.

## Project Name
**JD Fit Checker**

## Folder Structure
Two folders only — `frontend` and `backend`. No extra scaffolding, no unused boilerplate.

## Tech Stack
- **Frontend:** React (Vite), plain CSS with a proper design system (spacing scale, consistent color variables). Color palette: black, white, and blue only. No Tailwind default look, no generic AI-generated gradient-and-emoji aesthetic.
- **Backend:** Node.js serverless function (Vercel) that runs Playwright to scrape a job posting URL, then calls the Gemini API server-side only. API key never exposed to the client.
- **Font:** Roboto or a similarly plain, professional sans-serif.
- **Profile data:** A static `profile.json` file in the backend containing the user's skills, tech stack, projects, certifications, and education. This is read alongside the scraped job description on every request.
- **Deployment:** Vercel

## Core Feature
User pastes a job posting URL into an input field and clicks Analyze. The flow:
1. Backend uses Playwright to load the URL and extract the job description text (title, requirements, responsibilities).
2. Backend sends the extracted text plus `profile.json` to the Gemini API.
3. Gemini returns a structured fit analysis.
4. Frontend renders the analysis in three clearly labeled sections:
   - **Matched** — requirements the profile genuinely satisfies, each with a one-line "why"
   - **Gaps** — requirements the profile does not satisfy, stated plainly, no spin
   - **Suggested Opener** — one honest, specific outreach line based on the real matches and gaps

## Gemini API Behavior
System prompt instructs Gemini to act as an honest technical recruiter cross-referencing a candidate profile against a job description. It must not overstate fit, must not invent matching experience that isn't in the profile, and must state gaps directly rather than glossing over them. Output strict JSON with keys `matched` (array of {requirement, reason}), `gaps` (array of strings), `suggestedOpener` (string).

## UI/UX Requirements
- Strong visual hierarchy, real spacing system, professional tool look
- Color palette: black, white, blue only
- Fully responsive — explicitly tested at mobile width
- Clear loading state (scraping + analyzing can take a few seconds, communicate that), empty state, and error state (styled, not browser alerts) — including a specific error message if the URL fails to scrape
- Copy-to-clipboard button on the suggested opener

## Engineering Requirements
- Rate limiting on the backend endpoint (basic IP-based limiter)
- Code must be modular and reusable — no duplicated logic between the Matched/Gaps/Opener rendering, share one rendering component pattern (same approach as the previous HookForge build)
- Clear comments on backend logic, especially the scrape step and the Gemini call
- `.env.example` file included, real `.env` gitignored
- Short README covering what it does, how to run it locally, and how to update `profile.json`
- Handle scrape failures gracefully (site blocks scraping, URL invalid, page structure unexpected) — never crash, always return a clear message

## Deliverable Checklist
- [ ] Deployed live on Vercel with a shareable link
- [ ] README with setup instructions
- [ ] `.env.example` present, no real keys committed
- [ ] Mobile breakpoint verified
- [ ] Rate limiting active on the API route
- [ ] No duplicated rendering logic across the three output sections
- [ ] Scrape failure handled gracefully with a clear error state
