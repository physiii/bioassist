import { Box, CircularProgress } from "@mui/material";
import { lazy, Suspense, type ReactNode } from "react";
import { DevicesPage } from "./pages/DevicesPage";
import { DocumentsPage } from "./pages/DocumentsPage";
import { HomePage } from "./pages/HomePage";
import { InsightsPage } from "./pages/InsightsPage";
import { LearnPage } from "./pages/LearnPage";
import { PlanPage } from "./pages/PlanPage";
import { SettingsPage } from "./pages/SettingsPage";
import { TimelinePage } from "./pages/TimelinePage";

const AtlasPage = lazy(() => import("./pages/AtlasPage").then((module) => ({ default: module.AtlasPage })));

function LazyPage({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <Box sx={{ minHeight: 420, display: "grid", placeItems: "center" }}>
          <CircularProgress aria-label="Loading page" />
        </Box>
      }
    >
      {children}
    </Suspense>
  );
}

export type AppRoute = {
  label: string;
  path: string;
  element: ReactNode;
};

export const appRoutes: AppRoute[] = [
  { label: "Home", path: "/", element: <HomePage /> },
  { label: "Timeline", path: "/timeline", element: <TimelinePage /> },
  { label: "Insights", path: "/insights", element: <InsightsPage /> },
  {
    label: "Atlas",
    path: "/atlas",
    element: (
      <LazyPage>
        <AtlasPage />
      </LazyPage>
    )
  },
  { label: "Plan", path: "/plan", element: <PlanPage /> },
  { label: "Documents", path: "/documents", element: <DocumentsPage /> },
  { label: "Devices", path: "/devices", element: <DevicesPage /> },
  { label: "Learn", path: "/learn", element: <LearnPage /> },
  { label: "Settings", path: "/settings", element: <SettingsPage /> }
];
