import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

export function PageSection({
  title,
  subtitle,
  chips,
  children
}: {
  title: string;
  subtitle: string;
  chips?: string[];
  children: ReactNode;
}) {
  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
      <CardContent>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6">{title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
          {!!chips?.length && (
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {chips.map((chip) => (
                <Chip key={chip} label={chip} size="small" />
              ))}
            </Stack>
          )}
          <Box>{children}</Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
