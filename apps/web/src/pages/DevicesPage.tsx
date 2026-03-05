import { Stack, Typography } from "@mui/material";
import { PageSection } from "../components/PageSection";

export function DevicesPage() {
  return (
    <Stack spacing={2}>
      <Typography variant="h4">Devices</Typography>
      <PageSection
        title="Connection center"
        subtitle="Manage permissions, sync health, quality flags, and primary-device selection per metric."
        chips={["HealthKit", "Health Connect", "Coverage", "Quality flags"]}
      >
        <Typography variant="body2" color="text.secondary">
          Device adapters will normalize raw and daily aggregate metrics while preventing duplicate signal counting.
        </Typography>
      </PageSection>
    </Stack>
  );
}
