---
name: evidence-claim-review
description: Bind BioAssist health claims to specific evidence, population, effect, uncertainty, applicability, review status, and citations before user display.
---

# Evidence Claim Review

Use before publishing a medical, measurement, causal, diagnostic, prognostic, preventive, or intervention claim.

## Workflow

1. Rewrite the proposed claim into a precise population, exposure/intervention, comparator, outcome, time horizon, and intended use.
2. Identify direct supporting sources and their edition/date; prefer maintained standards and primary evidence for technical claims.
3. Classify the relationship as descriptive, associative, causal, mechanistic, diagnostic, prognostic, or normative.
4. Record effect estimates and absolute context when available, plus uncertainty, harms, burden, and competing evidence.
5. Assess transportability to the intended person, subgroup, device, protocol, setting, and decision.
6. Mark the claim draft, reviewed, accepted, limited, superseded, or withdrawn, with reviewer and version.
7. Produce plain and technical explanations that preserve the same boundaries.

## Output contract

- Versioned claim text.
- Claim type and confidence.
- Direct citations and evidence cutoff.
- Applicability and subgroup limits.
- Benefit, harm, burden, and uncertainty.
- Review and supersession status.

## Guardrails

- No citation, no medical claim.
- Do not convert a biomarker association into causality or a surrogate change into patient benefit.
- Do not use atlas prose as the sole authority for individualized diagnosis, treatment, or emergency decisions.
- Preserve disagreement and uncertainty; do not manufacture consensus.
