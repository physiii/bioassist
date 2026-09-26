---
name: device-research
description: Plan BioAssist measurement hardware and device studies from intended claim through simulator-first acquisition, validation, safety, and utility gates.
---

# Device Research

Use when designing research hardware, acquisition software, protocols, validation studies, or staged device programs.

## Workflow

1. Start with one narrow intended claim and define measurand, population, setting, operator, reference, and decision.
2. Select the smallest sensor set that can test the claim; document the measurement chain and failure modes.
3. Specify raw channels, range, bandwidth, sample rate, clock, synchronization, calibration, quality channels, storage, power, and security.
4. Verify on simulators and fixtures before any human-connected use.
5. For noninvasive human research, require protocol, consent, appropriate oversight, battery operation while attached, isolation, fault controls, and emergency boundaries.
6. Progress through bench, analytical, physiological, clinical-validity, utility, human-factors, implementation, and surveillance gates.
7. Lock algorithms for independent validation and report exclusions, confidence intervals, subgroup performance, abstention, drift, and rollback.

## Output contract

- Intended-use and claim contract.
- Sensor and system architecture.
- Raw data and metadata schema.
- Hazard and failure-mode register.
- Verification and validation matrix.
- Stage gate, evidence, and stop criteria.

## Guardrails

- Never authorize invasive, implantable, catheter-based, defibrillation-connected, or treatment-delivering construction or use from an atlas plan.
- Never connect a human-contact prototype to mains or an unisolated host.
- Do not claim blood pressure, diagnosis, or clinical utility from proxy signals without the corresponding validation.
- More sensors are not automatically more information; every channel needs a validation hypothesis.
