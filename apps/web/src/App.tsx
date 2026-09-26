import { Box, CircularProgress } from "@mui/material";
import { Navigate, Route, Routes } from "react-router-dom";
import { appRoutes } from "./appRoutes";
import { useAuth } from "./auth/AuthContext";
import { AppShell } from "./components/AppShell";
import { LoginPage } from "./pages/LoginPage";
import { OnboardingPage } from "./pages/OnboardingPage";

function FullscreenLoader() {
  return (
    <Box sx={{ minHeight: "80vh", display: "grid", placeItems: "center" }}>
      <CircularProgress />
    </Box>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <FullscreenLoader />;
  if (!user) return <LoginPage />;
  if (!user.onboarded) return <OnboardingPage />;

  return (
    <Routes>
      <Route element={<AppShell />}>
        {appRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
