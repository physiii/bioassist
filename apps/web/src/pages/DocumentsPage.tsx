import { Stack, Typography } from "@mui/material";
import { PageSection } from "../components/PageSection";

export function DocumentsPage() {
  return (
    <Stack spacing={2}>
      <Typography variant="h4">Documents</Typography>
      <PageSection
        title="Vault and extraction review"
        subtitle="Upload PDFs/images, inspect extraction confidence, and correct low-confidence fields."
        chips={["Upload", "Review queue", "Provenance", "Clinician packet"]}
      >
        <Typography variant="body2" color="text.secondary">
          Side-by-side document and extracted value views are planned in Phase 2, with source span traceability.
        </Typography>
      </PageSection>
    </Stack>
  );
}
