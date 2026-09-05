# SpeakWise AI

> **🤖 SpeakWise AI** — *"Your friendly AI English companion."*

SpeakWise AI is a modern, full-stack, AI-powered conversational English learning platform built specifically for English and Marathi speakers. It features Roman Marathi and Devanagari sentence-level understanding, intent-based conversational tutoring without generic deflections, an interactive pronunciation coach, a dynamic non-repeating translation practice engine, persistent daily streaks, 6 instant design themes, and clean mobile responsiveness.

---

## Features

- **🤖 Intent-First Conversational AI**:
  - Answers the user's actual question directly before providing helpful guidance.
  - Recognizes 18 distinct intent categories (greetings, advice, casual chat, AI identity, interview prep, technical concepts, Roman Marathi, etc.).
  - Context-aware follow-up recognition (e.g., *"My English is weak"* followed by *"how?"*).
  - Clarification prompts for unfamiliar input without generic filler responses.
- **🇮🇳 Roman Marathi & Multilingual NLP**:
  - Sentence-level semantic normalization for Roman Marathi (e.g. *"mala mahit nahi yach ans ks dyaych"*, *"jevn zal ka?"*).
  - Understands mixed Marathi-English sentences (e.g., *"mala English बोलायला practice karaychi aahe"*).
  - No awkward word-by-word literal translations.
- **✏️ Polite Grammar Correction**:
  - Explains third-person singular agreement, past tense usage, and prepositions only when real errors occur.
  - Does not force grammar lessons onto casual conversation or valid tenses (*"I am going to college."*).
- **🗣️ Interactive Pronunciation Coach**:
  - Learner-friendly phonetics, IPA breakdown, definition, CEFR levels, and audio speech synthesis at multiple playback speeds (0.75x, 1.0x, 1.25x).
  - Speech recognition listening mode with articulation feedback.
- **🎯 Dynamic Practice Engine**:
  - Non-repeating translation questions across 12 practical categories and 3 difficulty tiers.
  - SQLite tracking ensures users never receive repeating practice questions.
- **🔥 Persistent Streak & Calendar**:
  - Automatic streak calculation and celebratory extended streak modals.
  - Interactive monthly calendar showing active practice days.
- **🎨 6 Instant Color Themes**:
  - Light, Dark, Purple Dream (Default), Ocean, Forest, Sunset.
  - Instant CSS variable switching with persistent settings.
- **🔒 Secure Authentication & Route Protection**:
  - JWT tokens with bcrypt password hashing.
  - Automatic redirection to `/login` for unauthenticated access to protected areas.

---

## Technologies Used

- **Frontend**: React 19, Vite 8, React Router v7, Tailwind CSS 4, Lucide React, Canvas Confetti.
- **Backend**: Node.js, Express 4, CORS, dotenv, SQLite3.
- **Database**: SQLite3 (`better-sqlite3` / `sqlite3`) with persistent schema and indexes.
- **AI / NLP**: Built-in multi-layered Intent Classification & Roman Marathi normalizer with optional Google Gemini integration.
- **Speech**: Web Speech Recognition API + Web Speech Synthesis API.

---

## Project Structure

```
AI-Assistent/
├── client/                     # Frontend Vite + React SPA
│   ├── public/                 # Static public assets (robot avatar, favicon)
│   │   ├── speakwise-robot.png
│   │   └── favicon.png
│   ├── src/
│   │   ├── assets/             # Bundled image assets
│   │   ├── components/         # Reusable UI, chat, streak components
│   │   ├── context/            # Auth, Theme, Audio contexts
│   │   ├── hooks/              # Speech recognition hooks
│   │   └── pages/              # AIAssistant, Dashboard, Login, Practice, etc.
│   └── vite.config.js          # Vite configuration with /api proxy
├── server/                     # Backend Node.js + Express API
│   ├── data/                   # SQLite database directory (speakwise.db)
│   ├── db/                     # Database connection & schema initialization
│   ├── routes/                 # Express REST API routes (auth, ai, practice, etc.)
│   ├── services/               # AI tutor, Roman Marathi NLP, grammar services
│   └── index.js                # Server entry point, static file server, SPA fallback
├── render.yaml                 # Render Blueprint configuration
├── Dockerfile                  # Production multi-stage Docker build
├── DEPLOYMENT.md               # Detailed online hosting and deployment guide
├── .env.example                # Example environment variables template
└── package.json                # Root build, postinstall, and start scripts
```

---

## Local Setup

### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/speakwise-ai.git
   cd speakwise-ai
   ```

2. Install all dependencies for both backend and frontend:
   ```bash
   npm run install:all
   ```

3. Create your local environment file:
   ```bash
   cp .env.example server/.env
   ```

---

## Environment Variables

Configure environment variables in `server/.env` (locally) or in your hosting provider's dashboard (in production):

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | Optional | `5000` | Port for the Express server |
| `NODE_ENV` | Optional | `development` | `development` or `production` |
| `JWT_SECRET` | **Yes** | — | Secure 32+ character key for JWT signing |
| `DATABASE_PATH` | Optional | `server/data/speakwise.db` | Custom file path for SQLite database |
| `AI_API_KEY` | Optional | — | Google Gemini API key for external LLM generation |
| `CORS_ORIGIN` | Optional | `*` | Allowed CORS origins |

---

## Running Locally

### Option 1: Run Full Production-Ready App (Unified)
Build the frontend and run the Express server:
```bash
npm run build
npm start
```
Open **[http://localhost:5000](http://localhost:5000)** in your browser.

### Option 2: Run in Development Mode with Hot Reloading
Run backend and frontend in separate terminals:

**Terminal 1 (Backend):**
```bash
npm run server:dev
```

**Terminal 2 (Frontend with Vite HMR):**
```bash
npm run client
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## Deployment

SpeakWise AI is fully configured for zero-config production deployment on platforms like **Render**, **Railway**, **Fly.io**, or **Docker**:

1. **Build Command**:
   ```bash
   npm install && npm run build
   ```
2. **Start Command**:
   ```bash
   npm start
   ```
3. **Persistent Disk** (Recommended):
   Mount a volume at `/var/data` and set `DATABASE_PATH=/var/data/speakwise.db`.

For complete step-by-step instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

---

## Security Notes

- **No Secrets in Client Code**: All JWT verification, passwords, and optional AI API keys are handled strictly on the backend.
- **Hashed Passwords**: Passwords are never stored in plaintext (hashed using `bcryptjs` with salt rounds = 10).
- **Authentication Guard**: Unauthenticated requests to protected API endpoints return HTTP `401 Unauthorized`. Client protected routes immediately redirect to `/login`.
- **Environment Isolation**: Real keys must never be committed to git repositories. Always use `.env.example` as a template.

---

## Testing

Run the automated test suites:

```bash
# Test the 10 required conversation scenarios & intent classifications
node server/test_required_conversations.js

# Test full end-to-end system features (Auth, Streaks, Practice, Pronunciation, etc.)
node server/test_all_features.js
```
