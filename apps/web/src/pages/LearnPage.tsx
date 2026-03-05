import { Stack, Typography } from "@mui/material";
import { PageSection } from "../components/PageSection";

export function LearnPage() {
  return (
    <Stack spacing={2}>
      <Typography variant="h4">Learn</Typography>
      <PageSection
        title="Evidence map and measurement atlas"
        subtitle="Intervention -> outcome -> effect-size pathways with citation-linked explanations."
        chips={["Evidence", "Citations", "Cost", "Invasiveness", "Signal quality"]}
      >
        <Typography variant="body2" color="text.secondary">
          The Learn experience will enforce no-citation no-claim behavior and support plain vs technical depth.
        </Typography>
      </PageSection>
    </Stack>
  );
}
