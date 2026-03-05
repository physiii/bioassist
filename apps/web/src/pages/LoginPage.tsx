import { Alert, Box, Button, Card, CardContent, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useAuth } from "../auth/AuthContext";

function getApiErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const maybeResponse = (error as { response?: { data?: { message?: string } } }).response;
    if (maybeResponse?.data?.message) return maybeResponse.data.message;
  }
  return "Authentication failed.";
}

export function LoginPage() {
  const { login, signup } = useAuth();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (tab === "signup" && !name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (tab === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      if (tab === "signup") await signup(name, email, password);
      else await login(email, password);
    } catch (error: unknown) {
      setError(getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box sx={{ minHeight: "80vh", display: "grid", placeItems: "center", px: 2 }}>
      <Card sx={{ width: "100%", maxWidth: 500 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="h5">Welcome to BioAssist</Typography>
              <Typography variant="body2" color="text.secondary">
                Start simple, build a trusted health timeline, and turn insights into measurable next actions.
              </Typography>
            </Box>

            <Tabs value={tab} onChange={(_event, value) => setTab(value)} variant="fullWidth">
              <Tab value="login" label="Sign in" />
              <Tab value="signup" label="Create account" />
            </Tabs>

            {!!error && <Alert severity="error">{error}</Alert>}

            <Box component="form" onSubmit={onSubmit}>
              <Stack spacing={2}>
                {tab === "signup" && (
                  <TextField
                    label="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    fullWidth
                  />
                )}
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  fullWidth
                />
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={tab === "login" ? "current-password" : "new-password"}
                  fullWidth
                />
                {tab === "signup" && (
                  <TextField
                    label="Confirm password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    fullWidth
                  />
                )}
                <Button type="submit" size="large" variant="contained" disabled={submitting}>
                  {submitting ? "Please wait..." : tab === "signup" ? "Create account" : "Sign in"}
                </Button>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
