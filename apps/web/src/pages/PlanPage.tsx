import { Stack, Typography } from "@mui/material";
import { PageSection } from "../components/PageSection";

export function PlanPage() {
  return (
    <Stack spacing={2}>
      <Typography variant="h4">Plan</Typography>
      <PageSection
        title="Recommendations and experiments"
        subtitle="Actions stay measurable, time-bound, and grounded in evidence."
        chips={["Why", "Risks", "Measure", "Accept", "Snooze"]}
      >
        <Typography variant="body2" color="text.secondary">
          The recommendation contract will include trigger, expected effect range, risks, burden, and a stop-rule based measurement plan.
        </Typography>
      </PageSection>
    </Stack>
  );
}
