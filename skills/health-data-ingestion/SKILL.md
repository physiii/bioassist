---
name: health-data-ingestion
description: Ingest clinical, document, device, self-report, and environmental events into append-only BioAssist observation envelopes with provenance and consent.
---

# Health Data Ingestion

Use when accepting, extracting, importing, normalizing, correcting, or deduplicating health-related data.

## Inputs

- Original source or connector payload.
- Subject and consent/purpose context.
- Acquisition and source-system timestamps.
- Method, device, protocol, specimen/body site, units, and quality metadata when available.

## Workflow

1. Store the immutable original or a checksum-addressed reference before transformation.
2. Create an append-only source event with subject, source, assertion time, and permitted purpose.
3. Extract observations while retaining exact page/span, raw channel/window, or upstream record provenance.
4. Normalize concepts and units into canonical representations while preserving original text and value.
5. Record event time, interval, timezone, uncertainty, episode, and correction/supersession history.
6. Use typed missingness: not measured, unavailable, below detection, declined, not applicable, device failure, not indicated, lost to follow-up, or privacy-withheld.
7. Send observations to measurement-quality checks. Quarantine failures instead of deleting them.

## Output contract

- Source event ID and checksum.
- One or more versioned observation envelopes.
- Original and normalized value/unit/concept.
- Full temporal, provenance, quality, and governance metadata.
- Deduplication or supersession relationship.

## Guardrails

- Never infer a diagnosis during ingestion.
- Never silently impute, interpolate, convert, merge, or discard data.
- Do not collect identity, location, audio, reproductive, or genetic detail without an explicit purpose and permission.
- A missing quality field is unknown quality, not good quality.
