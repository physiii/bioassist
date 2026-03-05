import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { resetStore } from "../src/store.js";

describe("BioAssist API", () => {
  const app = createApp();

  beforeEach(() => {
    resetStore();
  });

  it("returns health status", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it("supports signup, me, onboarding, and login", async () => {
    const signup = await request(app).post("/api/auth/signup").send({
      name: "Andy",
      email: "andy@example.com",
      password: "pass12345"
    });
    expect(signup.status).toBe(201);
    const token = signup.body.token as string;
    expect(token).toBeTruthy();
    expect(signup.body.user.onboarded).toBe(false);

    const meBefore = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);
    expect(meBefore.status).toBe(200);
    expect(meBefore.body.user.email).toBe("andy@example.com");

    const onboarding = await request(app)
      .post("/api/profile/onboarding")
      .set("Authorization", `Bearer ${token}`)
      .send({
        outcomePriorities: ["healthspan", "energy_mood"],
        bottlenecks: ["sleep", "metabolic"],
        contextFlags: ["time_limited", "high_stress_load"],
        startingPoint: "minimal_dashboard"
      });
    expect(onboarding.status).toBe(200);
    expect(onboarding.body.user.onboarded).toBe(true);
    expect(onboarding.body.user.focusDomains.length).toBeGreaterThan(0);
    expect(onboarding.body.user.onboardingProfile.outcomePriorities).toContain("healthspan");

    const login = await request(app).post("/api/auth/login").send({
      email: "andy@example.com",
      password: "pass12345"
    });
    expect(login.status).toBe(200);
    expect(login.body.user.onboarded).toBe(true);
  });
});
