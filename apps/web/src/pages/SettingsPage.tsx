import { Stack, Typography } from "@mui/material";
import { PageSection } from "../components/PageSection";

export function SettingsPage() {
  return (
    <Stack spacing={2}>
      <Typography variant="h4">Settings</Typography>
      <PageSection
        title="Privacy and trust controls"
        subtitle="Manage permissions, export/delete actions, and user-visible audit history."
        chips={["Permissions", "Export", "Delete", "Audit log", "AI transparency"]}
      >
        <Typography variant="body2" color="text.secondary">
          Privacy UX primitives are first-class product features and remain accessible from day one.
        </Typography>
      </PageSection>
    </Stack>
  );
}
