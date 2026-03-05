# BioAssist Roadmap

BioAssist should feel like a clean health operating system: low-friction to start, deep when needed, and always evidence-linked, measurable, and user-controlled.

This roadmap is grounded in:
- `docs/bioassist_platform_blueprint_v1.pdf`
- `docs/bioassist_platform_blueprint_v2_2_detailed.pdf`
- `docs/comprehensive_health_playbook_v5_with_measurement_atlas.pdf`
- UI/login patterns from `needl` and `MovieTime`

## Product Direction (What We Are Building)

- **Core loop:** collect -> normalize -> understand -> recommend -> re-measure.
- **Primary value:** a single source of truth timeline with provenance, then high-confidence next actions.
- **Safety posture:** assistant for organization and decision support, not diagnosis or dosing.
- **User promise:** privacy controls, export/delete, and transparent evidence/citations.

## UX + Material Design System

### Design principles

- **Progressive disclosure:** show 3-7 high-impact items first; hide complexity until requested.
- **Low cognitive load:** stable navigation, clean cards, strong typography hierarchy.
- **Evidence transparency:** every recommendation has Why, Risks, Measure, and citation links.
- **Neutral language:** alert when needed, avoid alarmist tone for mild abnormalities.

### Visual language (Material-inspired, professional)

- **Style:** Material 3 inspired surfaces, rounded cards, soft elevation, high readability.
- **Typography:** Inter + Roboto fallback; strong headings, compact helper text.
- **Spacing:** 8px grid; dense data cards but breathable page layout.
- **Component defaults:** card-first UI, chip filters, timeline feed, recommendation cards, quality/provenance badges.

### Color system (initial proposal)

- `primary`: `#1E88E5` (Trust Blue)
- `secondary`: `#00BFA5` (Vital Teal)
- `accent`: `#8E24AA` (Insight Violet)
- `warning`: `#F59E0B` (Action Amber)
- `error`: `#D32F2F` (Critical Red)
- `background`: `#F6F8FB`
- `surface`: `#FFFFFF`
- `text.primary`: `#0F172A`
- `text.secondary`: `#475569`
- `divider`: `#DCE3EC`

Notes:
- Keep contrast AA+ for all key content.
- Reserve warning/error colors for genuine escalation states.
- Use secondary/accent for trend and insight visuals, not noise.

## Information Architecture (V1 Navigation)

- `Home`
- `Timeline`
- `Insights`
- `Plan`
- `Documents`
- `Devices`
- `Learn`
- `Settings`

Mobile: bottom nav with 5 primary items + `More`.  
Web: left sidebar with all primary sections visible.

## Login + Onboarding Strategy (from Needl + MovieTime patterns)

- **Login UI:** single clean auth card, tabbed `Sign in` / `Create account` pattern.
- **Auth methods:**
  - Email/password in MVP.
  - OAuth (Google) in v1.
- **Post-login routing:** support `next` redirect parameter for deep-link continuity.
- **Onboarding after first login:** lightweight mandatory profile completion (goals, constraints, core health context).
- **Session model:** secure JWT/session cookie + explicit logout + device/session visibility.

This combines:
- Needl’s practical redirect + post-auth profile completion flow.
- MovieTime’s simple, polished card-based auth UX.

## Technical Architecture (Phased, Practical)

- **Frontend:** React + MUI (Material-inspired design system).
- **Backend API:** Node/TypeScript service with clear domain boundaries.
- **Data stores:**
  - Postgres for entities and normalized records.
  - Object storage (S3-compatible) for document vault and large artifacts.
  - Redis for queues/cache (ingestion, extraction jobs, read model cache).
- **Data model:** FHIR-aligned core entities + source provenance graph.
- **AI usage:** constrained JSON outputs + schema validation + retrieval-based citations.
- **Recommendation engine:** deterministic safety/risk layers first, AI explanation layer second.

## Delivery Phases

## Phase 0 - Foundation and Repo Setup (Week 1)

- Establish monorepo structure (`apps/web`, `apps/api`, `packages/*`, `infra/*`).
- Set coding standards, linting, formatting, CI skeleton.
- Define design tokens (colors, typography, spacing, radius, elevation).
- Define canonical event names and domain contracts.
- Add local Docker stack that starts cleanly on a new machine.

**Exit criteria**
- `docker compose up --build` succeeds.
- Health endpoint and placeholder web app are reachable.
- CI runs lint + typecheck successfully.

## Phase 1 - Auth, Privacy Basics, and Shell UI (Weeks 2-4)

- Ship login/signup pages and session handling.
- Implement settings basics: export/delete placeholders, consent/privacy screens.
- Build app shell: top bar, navigation, global search input scaffold.
- Build polished empty states for each page.
- Add audit event logging baseline (login, upload, export actions).

**Exit criteria**
- User can register, sign in, sign out.
- App shell navigation works across all primary routes.
- Empty states teach next steps (connect data or upload docs).

## Phase 2 - Document Vault + Extraction MVP (Weeks 4-8)

- Upload PDFs/images into encrypted object storage.
- Document classification and extraction for common lab reports (CBC/CMP/lipids/A1c).
- Review queue for low-confidence extracted fields.
- Provenance links (document/page/region/line).
- Timeline v1 with labs/doc events.

**Exit criteria**
- User can upload records and see structured timeline entries.
- Extraction confidence shown; low-confidence values editable.
- Exportable 12-month summary packet v0.

## Phase 3 - Home, Trends, and Measurement Loop (Weeks 8-12)

- Home priority stack (3-7 items), weekly snapshot, and coverage meter.
- Trend charts for core metrics with confidence + missingness indicators.
- Minimal weekly dashboard aligned to playbook:
  - sleep, activity, mood, BP (when relevant), weight/waist.
- Plan page v1 with recommendation cards and task acceptance.

**Exit criteria**
- User sees top actions + what to measure next.
- At least 10-20 starter recommendations available with measurement plans.
- Task completion loop and weekly recap generated.

## Phase 4 - Device Integrations + Data Quality (Months 3-6)

- Integrate Apple HealthKit and Android Health Connect first.
- Add selected wearables next (Fitbit/Oura/Garmin/Withings).
- Primary-device-per-metric selection and duplicate prevention.
- Device quality checks: missingness, drift, timezone shifts, discontinuities.

**Exit criteria**
- Connected device data appears in timeline and weekly snapshots.
- Coverage score reflects real ingestion quality.
- Clear sync status and data quality badges are visible to users.

## Phase 5 - Recommendation Engine + Safety Hardening (Months 4-8)

- Implement layered recommendation stack:
  - safety triage
  - guideline reminders
  - risk scoring
  - evidence levers
  - personalization
  - N-of-1 experiments
- Enforce recommendation contract schema.
- Add escalation and contraindication guardrails.
- Add evidence-linked explanation modes (plain + technical).

**Exit criteria**
- Every recommendation includes trigger, target, effect range, risks, burden, and measurement plan.
- Red-flag paths are deterministic and tested.
- No uncited medical claims shown in UX.

## Phase 6 - Learn, Evidence Map, and Advanced Integrations (Months 6-12)

- Learn page with intervention -> outcome -> effect-size map.
- Measurement atlas UI with invasiveness/cost/signal trade-offs.
- Experiment mode templates with stop rules and cadence.
- SMART-on-FHIR and claims ingestion where feasible.
- Caregiver sharing and multi-profile support.

**Exit criteria**
- Users can browse evidence and understand why actions are recommended.
- Advanced diagnostic suggestions follow "test only if it changes decision."
- Sharing/export workflows are reliable and auditable.

## Testing and Quality Gates (Every Phase)

- **Unit + integration tests:** API contracts, normalization, recommendation schema validation.
- **E2E tests:** auth, upload, extraction review, recommendation acceptance, export.
- **Safety tests:** synthetic high-risk cases and escalation language checks.
- **Data tests:** dedupe, unit harmonization, reference ranges, timezone handling.
- **Performance checks:** fast home read model, async long-running jobs.

## Docker and Local Runtime Plan

### Current requirement (now)

- Keep one clean root `docker-compose.yml` that builds and runs this repo.
- Include a lightweight docs/roadmap runtime so contributors can start immediately.

### Target runtime (as implementation lands)

- `web` (React app)
- `api` (Node service)
- `worker` (ingestion/extraction/recommendation jobs)
- `postgres`
- `redis`
- `objectstore` (S3-compatible, e.g., MinIO)

Each phase should incrementally replace placeholders with real services, without breaking `docker compose up --build`.

## Simple Repo Structure (Do Not Make a Mess)

Planned structure:

- `apps/web`
- `apps/api`
- `apps/worker`
- `packages/ui`
- `packages/types`
- `infra/docker`
- `docs/`
- `ROADMAP.md`

Rules:
- Keep top-level minimal.
- One purpose per folder.
- Avoid duplicated docs and stale parallel roadmaps.

## Immediate Build Plan (Next 2 Weeks)

1. Ship Phase 0 foundation + Docker baseline.
2. Implement auth shell and page routing skeleton.
3. Add document upload + storage + extraction stub pipeline.
4. Deliver first clickable Home/Timeline/Plan experience with mock data.
5. Add CI checks and first E2E smoke flow.

## Success Metrics

- Activation: first upload or first data connection within 24h.
- Time-to-insight: upload to first useful action list under 2 minutes.
- Coverage growth: week-over-week increase in measured key signals.
- Action adoption: accepted recommendations and completion rate.
- Trust: export usage, low inaccuracy complaints, confidence feedback quality.

