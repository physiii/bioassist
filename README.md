# BioAssist

BioAssist is a health operating system in active build: document + device ingestion, longitudinal timeline normalization, and evidence-linked recommendation planning.

## Current app status

- `apps/api`: Express + TypeScript API with auth, onboarding, and Home snapshot endpoints.
- `apps/web`: React + MUI app shell with Material-inspired UX, auth flow, onboarding, and primary route structure.
- Tests included for both API and web flows.

## Local development

```bash
npm install
npm run dev
```

- Web: `http://localhost:5173`
- API: `http://localhost:4000`

## Docker compose

```bash
docker compose up -d --build
```

- Web: `http://localhost:15173`
- API health: `http://localhost:14000/api/health`

## Test commands

```bash
npm run test:api
npm run test:web
npm run test
```
