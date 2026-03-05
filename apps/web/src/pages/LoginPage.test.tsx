import { ThemeProvider } from "@mui/material";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AuthTestProvider, type AuthUser } from "../auth/AuthContext";
import { theme } from "../theme";
import { LoginPage } from "./LoginPage";

function renderLoginPage() {
  const value = {
    user: null as AuthUser | null,
    loading: false,
    login: vi.fn(async () => undefined),
    signup: vi.fn(async () => undefined),
    logout: vi.fn(async () => undefined),
    completeOnboarding: vi.fn(async () => undefined)
  };

  render(
    <ThemeProvider theme={theme}>
      <AuthTestProvider value={value}>
        <LoginPage />
      </AuthTestProvider>
    </ThemeProvider>
  );

  return value;
}

describe("LoginPage", () => {
  it("switches to signup and shows confirm password", async () => {
    renderLoginPage();
    await userEvent.click(screen.getByRole("tab", { name: /create account/i }));
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it("shows validation on signup password mismatch", async () => {
    renderLoginPage();
    await userEvent.click(screen.getByRole("tab", { name: /create account/i }));
    await userEvent.type(screen.getByLabelText(/full name/i), "Andy");
    await userEvent.type(screen.getByLabelText(/^email$/i), "andy@example.com");
    await userEvent.type(screen.getByLabelText(/^password$/i), "password123");
    await userEvent.type(screen.getByLabelText(/confirm password/i), "password999");
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
  });
});
