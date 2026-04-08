# TimeSignature

A web PWA that listens to a song, detects its time signature using BeatNet ML, and provides:
- Visual time signature display (musical notation)
- Synchronized metronome (pendulum + sweep bar + beat counter)
- Real-sample drum patterns matched to the detected meter
- Full offline PWA support

## Stack
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + Zustand
- **Backend:** FastAPI + BeatNet (Python 3.11) in Docker
- **Deploy:** Vercel (frontend) + Railway (backend)

## Quick Start

```bash
# Start both services
docker compose up

# Frontend only (dev)
cd frontend && npm run dev

# Backend only (dev)
cd backend && uvicorn main:app --reload
```

## Development

```bash
# Frontend type check
cd frontend && npm run typecheck

# Frontend lint
cd frontend && npm run lint

# Backend tests
cd backend && pytest

# Backend type check
cd backend && mypy .
```
