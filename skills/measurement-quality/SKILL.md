---
name: measurement-quality
description: Evaluate BioAssist observations and research measurements for intended measurand, calibration, artifacts, reference validity, uncertainty, and fitness for use.
---

# Measurement Quality

Use when validating an observation, measurement protocol, sensor output, derived feature, or algorithm result.

## Workflow

1. State the intended use, population, setting, user, decision, and physical or behavioral measurand.
2. Trace the full chain: process to transduction, acquisition, processing, feature, inference, and decision.
3. Verify units, range, timing, synchronization, device identity, firmware, calibration, protocol, and reference method.
4. Inspect saturation, motion, contact, missing samples, drift, preprocessing, exclusions, and subgroup-sensitive failure modes.
5. Distinguish accuracy, precision, agreement, repeatability, responsiveness, clinical validity, and utility.
6. Assign a result: accepted for named use, accepted with limitations, repeat/confirm, quarantined, or invalid.
7. Emit uncertainty, quality flags, reasons, and the exact use boundary.

## Output contract

- Intended-use statement.
- Quality decision and machine-readable flags.
- Reference and calibration status.
- Artifact and missingness assessment.
- Uncertainty and subgroup limitations.
- Required confirmation or next measurement.

## Guardrails

- Correlation is not agreement and repeatability is not clinical validity.
- Agreement with another consumer device is not a reference standard.
- A derived score without accessible raw/quality lineage is not audit-ready.
- Withhold or abstain when quality is insufficient; never fabricate a clean result.
