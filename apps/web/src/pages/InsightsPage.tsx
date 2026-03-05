import { Stack, Typography } from "@mui/material";
import { PageSection } from "../components/PageSection";

export function InsightsPage() {
  return (
    <Stack spacing={2}>
      <Typography variant="h4">Insights</Typography>
      <PageSection
        title="Domain trends and variability"
        subtitle="Cardiovascular, metabolic, sleep, and mental signals with confidence and missingness overlays."
        chips={["Cardio", "Metabolic", "Sleep", "Mental", "Kidney", "Liver/GI"]}
      >
        <Typography variant="body2" color="text.secondary">
          Insight cards will attach to deterministic metrics and risk drivers, then provide plain and technical explanation modes.
        </Typography>
      </PageSection>
    </Stack>
  );
}
