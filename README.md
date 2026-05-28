# Rapper Tool

Japanese rap lyric writing studio with rhyme suggestions, AI-assisted generation, and lyric analysis.

Rapper Tool is a web application for drafting Japanese rap lyrics. It combines rhyme search, lyric editing, AI generation, and mobile-first UI design so ideas can be created and reviewed quickly on a phone.

## Overview

The project is currently under active development.  
The goal is to create a practical writing environment for Japanese rap lyrics, from idea notes to verse drafts and rhyme checking.

## Features

- Japanese rhyme candidate search
- AI-assisted lyric generation using DeepSeek API
- Rhyme density, flow, and vowel analysis
- Lyric memo and project saving workflow
- Manual lyric editing with reading support
- Mobile-first interface designed for iPhone usage

## Tech Stack

- Next.js 16 / App Router
- TypeScript
- Tailwind CSS
- DeepSeek API
- kuromoji for Japanese text processing
- Supabase support for optional cloud saving

## Live Demo

https://rappertool.vercel.app

## Local Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Then open http://localhost:3000.

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `DEEPSEEK_API_KEY` | Yes | API key for lyric generation |
| `DEEPSEEK_BASE_URL` | No | Default: `https://api.deepseek.com` |
| `DEEPSEEK_MODEL` | No | Model used for generation |
| `RHYME_PROVIDERS` | No | Rhyme provider configuration |
| `READING_USE_KUROMOJI` | No | Enables local reading analysis |

## Documentation

- [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md)
- [docs/STATUS.md](docs/STATUS.md)
- [docs/MOBILE_DEV.md](docs/MOBILE_DEV.md)
- [docs/RHYME_FILTER.md](docs/RHYME_FILTER.md)
- [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md)
- [plan.md](plan.md)

## Status

This project is a portfolio-ready work in progress. Core features are being refined while the UI and lyric workflow continue to improve.