# BioAssist Atlas Implementation Blueprint

| Field | Value |
| --- | --- |
| Status | Initial implementation baseline |
| Atlas source cutoff | 2026-08-13 |
| Source suite | `docs/Health_Atlas_Research_Suite_Complete_2026/` |

## What the suite actually contains

The new atlas is a 19-volume, 1,494-page interim collection:

- one master taxonomy;
- one whole-person outcomes volume;
- one biological-foundations volume;
- fifteen organ-system volumes, 03A through 03O;
- one cross-system pathological-processes volume.

The master taxonomy defines fifteen branches and nine cross-cutting axes. Only branches 1–4 currently have dedicated deep packets. Branches 5–15 are mapped in the master and supported by overlapping system packets, but they are not yet complete standalone volumes. BioAssist must show that distinction instead of presenting the interim suite as uniformly complete.

The loose `docs/Cardiovascular_Health_and_Measurement_Engineering_2026.pdf` has the same SHA-256 digest as the suite copy. The suite directory is canonical; the loose copy is ignored by atlas ingestion so the source is not counted twice.

## Product interpretation

The atlas is not a library to paste into a chatbot. It defines an operating model for a health data system:

1. Preserve the source and its version.
2. Collect observations with context and consent.
3. Validate method, units, timing, artifacts, reference, and missingness.
4. Normalize concepts without destroying the raw record.
5. Locate each concept on the fifteen-branch tree and nine axes.
6. Build a longitudinal profile with uncertainty and typed relationships.
7. Distinguish change detection from abnormality, diagnosis, and causality.
8. Link every proposed action to evidence, burden, goals, governance, and a re-measurement plan.

The user-facing model should be a profile, never one opaque “health score.” A small dashboard may summarize a particular decision, but the derivation, weights, confidence, and reason for alert must remain inspectable.

## Canonical architecture

### 1. Source and evidence layer

Stores immutable originals and everything needed to audit their use:

- source document, checksum, edition, evidence cutoff, and ingestion time;
- page/region/span provenance for extracted claims;
- evidence type, population, effect estimate, uncertainty, and applicability;
- claim status: draft, reviewed, accepted, superseded, or withdrawn;
- transformation, extractor, reviewer, and model versions.

The atlas PDFs belong here. They are references and taxonomy sources, not patient observations.

### 2. Event and observation layer

Use append-only events. Corrections supersede prior records; they do not silently overwrite them.

A minimum `HealthObservation` envelope contains:

| Group | Required fields |
| --- | --- |
| Identity | observation ID, subject ID, source ID, concept and standard codes |
| Value | value, unit, scale type, allowable range, interpretation only when justified |
| Time | acquisition time and duration, assertion time, source-system time, timezone, uncertainty, episode |
| Method | measured property, modality, protocol, specimen/body site, posture/activity/fasting/environment |
| Device | model, serial, hardware, firmware, calibration state, sensor site, operator |
| Raw lineage | raw object URI, checksum, channel, sample rate, preprocessing and algorithm version |
| Quality | artifact segments, signal-quality index, controls, missing samples, confidence, validation state |
| Reference | comparator, reference interval or decision threshold, source and version |
| Semantics | measured, reported, estimated, inferred, or adjudicated |
| Governance | consent version, permitted purpose, access class, retention, and equity flags |

Missingness is typed: not measured, unavailable, below detection, declined, not applicable, device failure, not indicated, lost to follow-up, or withheld for privacy. A bare null is not sufficient.

### 3. Health-coordinate graph

`HealthConceptInstance` is the common object for a condition, trait, symptom, function, exposure, intervention, environment, or inferred process at a time. It carries:

- one or more atlas branches;
- scale;
- mechanism and confidence;
- time and life-course context;
- determinants and exposures;
- function and lived outcome;
- context and population;
- evidence, method, and uncertainty;
- intervention and governance;
- typed relationships such as `causes`, `manifests_as`, `modifies`, `contraindicates`, `responds_to`, and `conflicts_with`.

Relationships must say whether they are associative, causal, mechanistic, diagnostic, prognostic, or normative. The graph must not turn hypotheses into facts.

### 4. Longitudinal profile read model

Generate eight visible layers from the event log and graph:

1. identity and context;
2. current whole-person state;
3. physiological and biological state;
4. mechanisms and causal graph;
5. life-course and exposure timeline;
6. intervention and medication graph;
7. care-system map;
8. uncertainty and next-information plan.

The UI should progressively disclose these layers. Home shows the few next decisions that matter; Timeline shows source events; Insights shows trajectories and uncertainty; Atlas explains coverage and measurement options; Plan shows goal-linked action contracts.

### 5. Purpose-specific projections

The same governed data should produce separate projections rather than one overloaded schema:

- patient-facing goals and trends;
- clinician summary;
- device-validation dataset;
- longitudinal trajectory;
- causal research cohort;
- safety surveillance;
- intervention response;
- population and equity dashboard;
- multimorbidity interaction graph.

## Runtime organization

### Current deployable slice

- `apps/web`: authenticated React experience and interactive atlas.
- `apps/api`: catalog discovery, source integrity, skill discovery, and existing user APIs.
- `docs/atlas/catalog.json`: versioned semantic catalog.
- `skills/*/SKILL.md`: discoverable operational capability contracts.

### Next service boundary

- `apps/worker`: document extraction, normalization, terminology mapping, quality checks, and derived views.
- PostgreSQL: identities, events, observations, concepts, relationships, goals, consent, and audit metadata.
- S3-compatible object storage: originals, images, raw waveforms, and evidence bundles.
- Redis: bounded ingestion queues, job state, and cache invalidation.
- Terminology adapter: FHIR-facing codes and mappings for SNOMED CT, LOINC, RxNorm, ICD-11, ICF, and local concepts.

Do not add infrastructure before the observation contract and retention/consent rules are stable. The current container deployment remains intentionally small while those boundaries are proven.

## Software program

### Phase A — Atlas foundation (current slice)

- discover and integrity-check the 19 canonical sources;
- expose branches, axes, profile layers, source coverage, skills, and build programs through one API;
- ship a simple interactive visual map;
- expose deep versus master-only coverage honestly.

### Phase B — Collection and provenance

- implement the append-only observation envelope;
- add document upload, object storage, checksums, extraction spans, and correction history;
- add manual/self-report capture with instrument versions;
- implement typed missingness and consent/purpose checks;
- establish FHIR-aligned concept and unit normalization.

### Phase C — Cardiovascular pilot

- build a measurement and protocol registry;
- connect validated cuff readings, ECG, PPG, IMU, temperature, symptoms, posture, medication, and environment;
- retain synchronized raw signals and quality channels;
- create a cardiovascular trajectory and next-information view;
- validate on simulators and reference instruments before any clinical claim.

### Phase D — Cross-domain pilots

Prioritize interaction value: sleep/circadian, metabolic/endocrine, cognition/mood, respiratory, immune/infection, renal/fluid, function/pain/rehabilitation, and environment/occupation.

### Phase E — Multi-domain decisions

- typed causal and interaction graph;
- intervention-response tracking;
- goal and burden-aware recommendations;
- multimorbidity, pregnancy, aging, post-infectious, and chronic-pain profiles;
- subgroup, equity, and unintended-consequence evaluation.

## Hardware program

The first hardware boundary is a transparent research acquisition platform, not a universal diagnostic.

### Reference equipment

- research multi-lead ECG recorder;
- validated upper-arm blood-pressure monitor and appropriate cuffs;
- pulse oximeter with waveform output where available;
- calibrated temperature and motion references;
- digital stethoscope or calibrated contact microphone;
- ECG/arrhythmia simulator and pressure calibrator.

### First buildable node

- one or two ECG channels with lead-off and saturation detection;
- dual-wavelength PPG with ambient, LED-current, and gain state logging;
- low-noise accelerometer and gyroscope;
- contact and ambient temperature;
- optional acoustic, seismocardiography, or bioimpedance channels;
- one shared hardware clock, local checksummed storage, and raw export;
- battery power and hard isolation from mains while human-connected.

The software must record exact acquisition timestamps, measured sample rates, gain changes, dropped data, hardware/firmware/algorithm versions, calibration, quality, and synchronization uncertainty.

### Hardware gates

1. Bench verification with simulators, fixtures, clock/noise/power characterization, and fault tests.
2. Controlled physiology at rest, posture change, breathing, walking, exercise, and recovery against references.
3. One or two narrow analytical claims with a locked algorithm and independent validation.
4. Representative disease cohorts with ethics approval and clinical partners.
5. Utility testing: whether use improves a decision or meaningful outcome.

No invasive, implantable, defibrillation-connected, catheter-based, or treatment-delivering prototype is authorized by the atlas or this plan.

## Skill suite

The initial project-local skills separate responsibilities that should not be collapsed into one general health agent:

| Skill | Responsibility |
| --- | --- |
| `atlas-curator` | Source discovery, checksums, versioning, deduplication, taxonomy coverage, and catalog updates |
| `health-data-ingestion` | Append-only intake, normalization, temporal semantics, typed missingness, consent, and lineage |
| `measurement-quality` | Intended measurand, calibration, artifacts, references, quality gates, and uncertainty |
| `evidence-claim-review` | Claim-evidence binding, applicability, confidence, citations, and supersession |
| `longitudinal-profile` | Nine-axis mapping, eight-layer profile, trajectories, goals, and next-information planning |
| `device-research` | Simulator-first hardware plans, synchronized raw acquisition, validation ladders, and safety boundaries |

Skills exchange typed artifacts. For example, ingestion emits an observation envelope; measurement quality may validate or quarantine it; longitudinal profile consumes only accepted observations; evidence review controls which explanatory claims can be shown.

## Safety and trust gates

- No citation, no medical claim.
- No unsupported conversion from signal to diagnosis.
- No silent unit conversion, interpolation, deduplication, or imputation.
- No alert without source, reason, confidence, and escalation boundary.
- No recommendation without trigger, target, expected benefit, risk, burden, alternatives, measurement plan, and stop rule.
- No model release without external validation, subgroup analysis, abstention behavior, monitoring, and rollback.
- No sensitive location, reproductive, genetic, audio, or passive data without an explicit purpose and consent.
- No human-connected research hardware without electrical isolation, risk controls, protocol, and appropriate oversight.

## Immediate backlog after the atlas slice

1. Define Zod and database schemas for Source, Event, Observation, Device, Protocol, Quality, Consent, Goal, and Relationship.
2. Add Postgres/object storage/Redis only with migrations, backup, retention, and recovery tests.
3. Build document upload and atlas-style provenance review using a non-sensitive synthetic lab report first.
4. Build the cardiovascular measurement registry and simulator dataset before live acquisition.
5. Add a waveform viewer that renders raw channels, gaps, gain changes, and quality overlays.
6. Add a minimal manual measurement flow for validated home blood pressure with protocol context.
7. Create the eight-layer profile read model from synthetic events.
8. Add evidence-ledger and recommendation-contract safety tests before generating health guidance.

## Source anchors

- Master architecture and record model: `Atlas_of_Human_Health_Unified_Taxonomy_2026.pdf`, sections 10, 58, 59, 73, 74, and 78.
- Whole-person outcomes: `01_Whole_Person_Health_States_and_Outcomes.pdf`.
- Shared biological substrate: `02_Biological_Foundations_and_Regulation.pdf`.
- Cardiovascular data and staged hardware: `Cardiovascular_Health_and_Measurement_Engineering_2026.pdf`, sections 44, 52, 55–66.
- Domain-specific measurement landscapes and research programs: volumes 03B–03O.
- Cross-organ mechanisms and minimum longitudinal schema: `04_Cross_System_Pathological_Processes.pdf`.
