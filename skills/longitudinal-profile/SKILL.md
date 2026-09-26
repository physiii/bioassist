---
name: longitudinal-profile
description: Assemble accepted BioAssist observations into a multi-axial, longitudinal health profile with goals, function, trajectories, relationships, and next-information plans.
---

# Longitudinal Profile

Use when generating timelines, summaries, domain views, insights, or next-measurement priorities.

## Inputs

- Accepted or explicitly limited observations from measurement-quality review.
- Goals, preferences, constraints, consent, and care context.
- Reviewed evidence claims and typed relationships.

## Workflow

1. Map each concept across domain, scale, mechanism, time, determinants, function, context, evidence, and intervention/governance axes.
2. Build the eight profile layers: identity/context, whole-person state, biology, mechanisms, life-course/exposure, interventions, care system, and uncertainty/next information.
3. Preserve source links and distinguish observed, reported, estimated, inferred, suspected, confirmed, inactive, resolved, and disproven states.
4. Separate within-person deviation, population abnormality, clinically important change, diagnostic pattern, and causal interpretation.
5. Surface discordance, such as improved biomarkers with worse function or stable disease metrics with intolerable burden.
6. Prioritize missing information by expected decision value, burden, safety, and the person’s goals.
7. Present domain trajectories and reasons for attention, never a universal health score.

## Output contract

- Versioned profile snapshot and time window.
- Domain trajectories with confidence and provenance.
- Goal, function, burden, and context summary.
- Typed relationships and competing explanations.
- Uncertainty and ranked next-information plan.

## Guardrails

- Do not diagnose from change detection alone.
- Do not hide trade-offs or unknowns inside a composite score.
- Do not let biological data erase symptoms and function, or let context dismiss urgent biological risk.
- Any urgent escalation logic must be deterministic, reviewed, and separately tested.
