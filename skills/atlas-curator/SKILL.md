---
name: atlas-curator
description: Curate BioAssist atlas sources, integrity metadata, taxonomy coverage, and source-linked catalog entries without duplicates or silent version drift.
---

# Atlas Curator

Use for adding, replacing, indexing, or auditing atlas and evidence-library sources.

## Inputs

- Source files and their location.
- Edition, evidence cutoff, and intended scope.
- Existing `docs/atlas/catalog.json` and source manifest.

## Workflow

1. Discover source files from the canonical directory; never rely on a second static filename list.
2. Compute or verify SHA-256 digests and identify byte-identical duplicates.
3. Preserve the original file. Record edition, evidence cutoff, title, kind, and coverage.
4. Extract or review purpose, safety boundary, major measurement families, research initiatives, and explicit gaps.
5. Map the source to atlas branches and supporting axes without claiming deeper coverage than the source provides.
6. Update structured metadata and validate that every discovered source is either enriched or clearly marked unregistered.
7. Report additions, replacements, duplicates, missing files, and version conflicts.

## Output contract

- Canonical source identifier and checksum.
- Source/version metadata.
- Branch and coverage mapping.
- Concise source-bound summary.
- Measurement families and initiatives.
- Integrity and gap findings.

## Guardrails

- Do not treat the atlas as patient data or personalized medical guidance.
- Never merge sources solely because titles look similar; use checksums and edition metadata.
- Never silently replace an older edition. Preserve version history and supersession links.
- Do not turn a source summary into a medical claim without evidence review.
