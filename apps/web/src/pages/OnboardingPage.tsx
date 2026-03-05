import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Divider,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { useState } from "react";
import { useAuth } from "../auth/AuthContext";

type Option = {
  id: string;
  label: string;
  description: string;
  detail: string;
};

const outcomeOptions: Option[] = [
  {
    id: "healthspan",
    label: "Healthspan & function",
    description: "Stay physically and cognitively capable long-term.",
    detail: "Focuses early plans on function, mobility, and resilience metrics."
  },
  {
    id: "longevity",
    label: "Longevity risk reduction",
    description: "Reduce long-term cardiovascular and metabolic risk.",
    detail: "Prioritizes blood pressure, lipid, glucose, and prevention workflows."
  },
  {
    id: "energy_mood",
    label: "Energy & mood",
    description: "Improve daily energy, stress tolerance, and emotional stability.",
    detail: "Starts with sleep regularity, activity, and mood tracking loops."
  },
  {
    id: "condition_control",
    label: "Condition management",
    description: "Better control of existing chronic conditions.",
    detail: "Emphasizes medication/lab/timeline organization and follow-up prompts."
  },
  {
    id: "performance",
    label: "Performance",
    description: "Optimize training, recovery, and high-output performance.",
    detail: "Uses fitness baselines and experiment templates with burden controls."
  }
];

const bottleneckOptions: Option[] = [
  {
    id: "sleep",
    label: "Sleep quality or regularity",
    description: "Irregular sleep schedule, fatigue, or poor sleep quality.",
    detail: "High-leverage target with strong downstream effects on mood and metabolic health."
  },
  {
    id: "blood_pressure",
    label: "Blood pressure concerns",
    description: "Known high BP or concern about BP trend quality.",
    detail: "Home BP baseline and validated protocol are high-value early signals."
  },
  {
    id: "activity_fitness",
    label: "Low activity or fitness",
    description: "Not enough aerobic or strength activity currently.",
    detail: "Evidence supports rapid gains from moving inactive -> moderately active."
  },
  {
    id: "metabolic",
    label: "Metabolic markers",
    description: "Weight, glucose, lipids, or waist trends need attention.",
    detail: "Guides early metabolic dashboards and follow-up measurement cadence."
  },
  {
    id: "mood_stress",
    label: "Mood, anxiety, or stress",
    description: "High stress load, mood symptoms, or burnout patterns.",
    detail: "Mental health is modeled as both a core outcome and behavior mediator."
  },
  {
    id: "substances",
    label: "Nicotine/alcohol/substance risk",
    description: "Current use patterns likely affecting long-term outcomes.",
    detail: "Substance risk is a high-EV bottleneck in population burden data."
  },
  {
    id: "pain_mobility",
    label: "Pain, mobility, or injury risk",
    description: "Pain/injury limits activity or independence.",
    detail: "Builds function-first plans around strength, balance, and safety."
  }
];

const contextOptions: Option[] = [
  {
    id: "time_limited",
    label: "Limited time",
    description: "Need very low-friction plans.",
    detail: "Recommendations will bias toward quick wins and low daily burden."
  },
  {
    id: "shift_work",
    label: "Shift/irregular schedule",
    description: "Sleep and routine windows are variable.",
    detail: "Plans will avoid rigid timing assumptions and use adaptable cadence."
  },
  {
    id: "budget_limited",
    label: "Budget constrained",
    description: "Need low-cost measurement and intervention paths.",
    detail: "Atlas recommendations will favor lower-cost and less invasive options."
  },
  {
    id: "caregiving_load",
    label: "Caregiving load",
    description: "Managing someone else’s care or high family demand.",
    detail: "Prioritization engine reduces plan volume and increases feasibility weighting."
  },
  {
    id: "high_stress_load",
    label: "High stress load",
    description: "Recovery capacity is currently limited.",
    detail: "Builds stress-aware sequencing so we do not stack too many changes."
  },
  {
    id: "limited_access_care",
    label: "Limited care access",
    description: "Hard to get appointments or continuity.",
    detail: "Timeline and packet workflows are prioritized to improve visit efficiency."
  }
];

const startOptions: Option[] = [
  {
    id: "minimal_dashboard",
    label: "Start with minimal dashboard",
    description: "Sleep, activity, mood, and BP-first starter loop.",
    detail: "Fastest path to weekly value with minimal friction."
  },
  {
    id: "upload_documents",
    label: "Start with document upload",
    description: "Build timeline depth from labs/visit records first.",
    detail: "Best if you already have clinical PDFs to organize."
  },
  {
    id: "connect_device",
    label: "Start with device connection",
    description: "Begin with wearable/device trends and coverage meter.",
    detail: "Best when you already track signals through a device ecosystem."
  }
];

function getApiErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const maybeResponse = (error as { response?: { data?: { message?: string } } }).response;
    if (maybeResponse?.data?.message) return maybeResponse.data.message;
  }
  return "Could not complete onboarding.";
}

export function OnboardingPage() {
  const { completeOnboarding, user } = useAuth();
  const [outcomePriorities, setOutcomePriorities] = useState<string[]>(
    user?.onboardingProfile?.outcomePriorities ?? ["healthspan"]
  );
  const [bottlenecks, setBottlenecks] = useState<string[]>(user?.onboardingProfile?.bottlenecks ?? []);
  const [contextFlags, setContextFlags] = useState<string[]>(user?.onboardingProfile?.contextFlags ?? []);
  const [startingPoint, setStartingPoint] = useState<"minimal_dashboard" | "upload_documents" | "connect_device">(
    (user?.onboardingProfile?.startingPoint as "minimal_dashboard" | "upload_documents" | "connect_device") ||
      "minimal_dashboard"
  );
  const [notes, setNotes] = useState(user?.onboardingProfile?.notes ?? "");
  const [showNotes, setShowNotes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const valid = outcomePriorities.length > 0 && bottlenecks.length > 0 && contextFlags.length > 0 && !!startingPoint;

  function toggleWithMax(
    current: string[],
    setter: (next: string[]) => void,
    id: string,
    max: number
  ) {
    if (current.includes(id)) {
      setter(current.filter((item) => item !== id));
      return;
    }
    if (current.length >= max) return;
    setter([...current, id]);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!valid) {
      setError("Select at least one option in each required section.");
      return;
    }
    setSubmitting(true);
    try {
      await completeOnboarding({
        outcomePriorities,
        bottlenecks,
        contextFlags,
        startingPoint,
        notes: notes.trim()
      });
    } catch (error: unknown) {
      setError(getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box sx={{ minHeight: "80vh", display: "grid", placeItems: "center", px: 2 }}>
      <Card sx={{ width: "100%", maxWidth: 700 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="h5">Complete your profile</Typography>
              <Typography variant="body2" color="text.secondary">
                Answer a few high-value questions so BioAssist can personalize your first plan with minimal friction.
              </Typography>
            </Box>

            {!!error && <Alert severity="error">{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                <Stack spacing={1}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    1) What matters most right now? (choose up to 3)
                  </Typography>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    {outcomeOptions.map((option) => {
                      const selected = outcomePriorities.includes(option.id);
                      return (
                        <Chip
                          key={option.id}
                          label={option.label}
                          color={selected ? "primary" : "default"}
                          onClick={() => toggleWithMax(outcomePriorities, setOutcomePriorities, option.id, 3)}
                        />
                      );
                    })}
                  </Stack>
                  {outcomeOptions.map((option) => {
                    if (!outcomePriorities.includes(option.id)) return null;
                    return (
                      <Typography key={option.id} variant="body2" color="text.secondary">
                        {option.label}: {option.detail}
                      </Typography>
                    );
                  })}
                </Stack>

                <Divider />

                <Stack spacing={1}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    2) Which bottlenecks best describe your current situation? (choose up to 4)
                  </Typography>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    {bottleneckOptions.map((option) => {
                      const selected = bottlenecks.includes(option.id);
                      return (
                        <Chip
                          key={option.id}
                          label={option.label}
                          color={selected ? "primary" : "default"}
                          onClick={() => toggleWithMax(bottlenecks, setBottlenecks, option.id, 4)}
                        />
                      );
                    })}
                  </Stack>
                  {bottleneckOptions.map((option) => {
                    if (!bottlenecks.includes(option.id)) return null;
                    return (
                      <Typography key={option.id} variant="body2" color="text.secondary">
                        {option.label}: {option.detail}
                      </Typography>
                    );
                  })}
                </Stack>

                <Divider />

                <Stack spacing={1}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    3) What constraints should the plan respect? (choose at least 1)
                  </Typography>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    {contextOptions.map((option) => {
                      const selected = contextFlags.includes(option.id);
                      return (
                        <Chip
                          key={option.id}
                          label={option.label}
                          color={selected ? "primary" : "default"}
                          onClick={() => toggleWithMax(contextFlags, setContextFlags, option.id, 4)}
                        />
                      );
                    })}
                  </Stack>
                  {contextOptions.map((option) => {
                    if (!contextFlags.includes(option.id)) return null;
                    return (
                      <Typography key={option.id} variant="body2" color="text.secondary">
                        {option.label}: {option.detail}
                      </Typography>
                    );
                  })}
                </Stack>

                <Divider />

                <Stack spacing={1}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    4) How do you want to start?
                  </Typography>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    {startOptions.map((option) => {
                      const selected = startingPoint === option.id;
                      return (
                        <Chip
                          key={option.id}
                          label={option.label}
                          color={selected ? "primary" : "default"}
                          onClick={() => setStartingPoint(option.id as "minimal_dashboard" | "upload_documents" | "connect_device")}
                        />
                      );
                    })}
                  </Stack>
                  {startOptions.map((option) => {
                    if (startingPoint !== option.id) return null;
                    return (
                      <Typography key={option.id} variant="body2" color="text.secondary">
                        {option.description} {option.detail}
                      </Typography>
                    );
                  })}
                </Stack>

                <Button variant="text" onClick={() => setShowNotes((value) => !value)}>
                  {showNotes ? "Hide custom notes" : "Add optional custom notes"}
                </Button>

                <Collapse in={showNotes}>
                  <TextField
                    label="Optional notes"
                    placeholder="Anything important we should factor in (medication sensitivity, care preferences, upcoming life events)..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    multiline
                    minRows={3}
                    fullWidth
                  />
                </Collapse>

                <Button type="submit" variant="contained" size="large" disabled={submitting || !valid}>
                  {submitting ? "Saving..." : "Continue to dashboard"}
                </Button>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
