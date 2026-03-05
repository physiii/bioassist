import { ThemeProvider } from "@mui/material";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AuthTestProvider, type AuthUser } from "../auth/AuthContext";
import { theme } from "../theme";
import { OnboardingPage } from "./OnboardingPage";

function renderOnboardingPage() {
  const completeOnboarding = vi.fn(async () => undefined);
  const value = {
    user: {
      id: "u_1",
      name: "Andy",
      email: "andy@example.com",
      onboarded: false,
      goals: "",
      constraints: "",
      focusDomains: [],
      onboardingProfile: null
    } as AuthUser,
    loading: false,
    login: vi.fn(async () => undefined),
    signup: vi.fn(async () => undefined),
    logout: vi.fn(async () => undefined),
    completeOnboarding
  };

  render(
    <ThemeProvider theme={theme}>
      <AuthTestProvider value={value}>
        <OnboardingPage />
      </AuthTestProvider>
    </ThemeProvider>
  );

  return { completeOnboarding };
}

describe("OnboardingPage", () => {
  it("keeps submit disabled until required selections are made", async () => {
    renderOnboardingPage();
    const submitButton = screen.getByRole("button", { name: /continue to dashboard/i });
    expect(submitButton).toBeDisabled();

    await userEvent.click(screen.getByRole("button", { name: /sleep quality or regularity/i }));
    await userEvent.click(screen.getByRole("button", { name: /limited time/i }));

    expect(submitButton).toBeEnabled();
  });

  it("shows dynamic detail text when option is selected", async () => {
    renderOnboardingPage();
    await userEvent.click(screen.getByRole("button", { name: /blood pressure concerns/i }));
    expect(screen.getByText(/home bp baseline and validated protocol/i)).toBeInTheDocument();
  });
});
