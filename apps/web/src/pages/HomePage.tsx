import { Alert, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { api } from "../api/client";
import { PageSection } from "../components/PageSection";

type HomePayload = {
  profileSummary: {
    focusDomains: string[];
    bottlenecks: string[];
    startingPoint: string;
  };
  priorities: Array<{ id: string; title: string; why: string; measure: string }>;
  weeklySnapshot: {
    sleepHours: number;
    stepsPerDay: number;
    mood: number;
    dataCoverage: number;
  };
};

export function HomePage() {
  const [data, setData] = useState<HomePayload | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/api/home")
      .then((res) => setData(res.data))
      .catch(() => setError("Could not load Home snapshot."));
  }, []);

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Home</Typography>
      {!!error && <Alert severity="error">{error}</Alert>}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <Stack sx={{ flex: 7 }}>
          <PageSection
            title="Priority stack"
            subtitle="Top actions ranked by impact, urgency, and feasibility, personalized from your onboarding profile."
            chips={
              data?.profileSummary.focusDomains?.length
                ? data.profileSummary.focusDomains.map((domain) => `focus: ${domain}`)
                : ["Impact", "Urgency", "Feasibility"]
            }
          >
            <Stack spacing={1.5}>
              {(data?.priorities ?? []).map((item) => (
                <Stack key={item.id} spacing={0.4}>
                  <Typography fontWeight={700}>{item.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Why: {item.why}
                  </Typography>
                  <Typography variant="body2">Measure: {item.measure}</Typography>
                </Stack>
              ))}
            </Stack>
          </PageSection>
        </Stack>
        <Stack sx={{ flex: 5 }}>
          <PageSection title="Weekly snapshot" subtitle="Minimal high-signal dashboard for this week.">
            <Stack spacing={0.8}>
              <Typography>Sleep: {data?.weeklySnapshot.sleepHours ?? "--"} hrs</Typography>
              <Typography>Steps/day: {data?.weeklySnapshot.stepsPerDay ?? "--"}</Typography>
              <Typography>Mood: {data?.weeklySnapshot.mood ?? "--"}/10</Typography>
              <Typography>Coverage: {data?.weeklySnapshot.dataCoverage ?? "--"}%</Typography>
            </Stack>
          </PageSection>
        </Stack>
      </Stack>
    </Stack>
  );
}
