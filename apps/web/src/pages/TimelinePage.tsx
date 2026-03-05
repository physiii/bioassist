import { Stack, Typography } from "@mui/material";
import { PageSection } from "../components/PageSection";

export function TimelinePage() {
  return (
    <Stack spacing={2}>
      <Typography variant="h4">Timeline</Typography>
      <PageSection
        title="Unified event feed"
        subtitle="Labs, visits, symptoms, medications, and device summaries in one chronological view."
        chips={["Labs", "Meds", "Symptoms", "Encounters", "Devices"]}
      >
        <Typography variant="body2" color="text.secondary">
          Timeline ingestion and provenance rendering will populate here as document and device connectors come online.
        </Typography>
      </PageSection>
    </Stack>
  );
}
