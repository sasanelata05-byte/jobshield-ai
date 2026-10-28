# JobShield AI — Career Safety Lab

A responsive job-scam screening website built with HTML, CSS, vanilla JavaScript, Node.js and Express. It reviews job text, recruiter messages, employer/role details, salary claims and a supplied URL for common warning patterns, then explains each matched signal and suggests next steps.

> **Important:** This is an educational, rule-based prototype. It does not use a trained ML model, verify a company against live registries, browse a submitted URL, or prove a job is legitimate/fraudulent. Risk scores are heuristic indicators, not calibrated probabilities. Do not submit passwords, OTPs, banking details, or private identity data.

## Features

- Responsive landing page and scanner UI
- Job description, recruiter message, company, role, salary and URL inputs
- Transparent warning indicators and explanations
- URL format/shortener checks (does not visit the URL)
- Next-step recommendations and safety checklist
- Demo scam example
- Copy/export text report
- Recent scans for the current browser session only
- Dark/light theme toggle
- Express API validation, basic rate limiting, security headers
- No database, paid API, account, or API key required

## Requirements

- Node.js 18 or newer
- npm

## Run locally

```bash
npm install
npm start
```

Open http://localhost:3000. Click **Load example scam offer**, then **Analyze for risk**.

Development mode (auto-restarts when supported by your Node version):

```bash
npm run dev
```

## API

`GET /api/health` — health check.

`POST /api/analyze` JSON body:

```json
{
  "company": "Example employer",
  "role": "Junior analyst",
  "jobText": "Paste job advertisement here...",
  "recruiterMessage": "Optional message",
  "salary": "₹4–6 LPA",
  "sourceUrl": "https://example.com/careers"
}
```

The combined input must contain at least 20 characters and is limited to 20,000 characters. Analysis happens in memory; the app does not persist scans to a server database.

## GitHub upload

1. Create a new empty repository on GitHub named `jobshield-ai` (do not add a README there if this folder already has one).
2. In this project folder, open a terminal and run:

```bash
git init
git add .
git commit -m "Build JobShield AI scam screening website"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/jobshield-ai.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username. Never commit `.env`, tokens, API keys, or personal data. `node_modules` is excluded by `.gitignore`.

## Free hosting options

- **GitHub Pages** only hosts static files; it cannot run this Express API. Do not publish this exact full-stack app to GitHub Pages and expect scanning to work.
- For a full-stack demo, check the current free-tier terms for a Node hosting provider such as Render. Create a Web Service from your GitHub repo, set build command `npm install`, start command `npm start`, and use the assigned public URL. Free tiers and sleep/usage limits can change.
- For reliable no-cost portfolio hosting, a static frontend plus a separately hosted API can work, but the API host must support Node.js and CORS must be configured if the domains differ. This starter serves frontend and API from the same origin to avoid that complication.

## Suggested next upgrades

1. Add a labelled dataset and evaluate a real text-classification model separately from the rules.
2. Add tests and a model-card page explaining limitations.
3. Add verified employer lookups only through legitimate public sources/APIs; do not scrape sites or claim verification without evidence.
4. Add database-backed history only with clear consent and a privacy policy.
