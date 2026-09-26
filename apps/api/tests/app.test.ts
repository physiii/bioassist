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

  it("serves the verified atlas and discovered skill catalog to authenticated users", async () => {
    const unauthorized = await request(app).get("/api/atlas");
    expect(unauthorized.status).toBe(401);

    const signup = await request(app).post("/api/auth/signup").send({
      name: "Atlas Tester",
      email: "atlas@example.com",
      password: "pass12345"
    });
    const response = await request(app)
      .get("/api/atlas")
      .set("Authorization", `Bearer ${signup.body.token as string}`);

    expect(response.status).toBe(200);
    expect(response.body.stats).toMatchObject({
      sourceCount: 19,
      declaredSourceCount: 19,
      pageCount: 1494,
      branchCount: 15,
      deepBranchCount: 4,
      axisCount: 9,
      skillCount: 6
    });
    expect(response.body.integrity.ok).toBe(true);
    expect(response.body.integrity.duplicatesIgnored).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "docs/Cardiovascular_Health_and_Measurement_Engineering_2026.pdf" })
      ])
    );
    expect(response.body.sources.every((source: { checksumStatus: string }) => source.checksumStatus === "verified")).toBe(true);
    expect(response.body.branches.find((branch: { id: string }) => branch.id === "organ-systems").sourceCodes).toHaveLength(16);
    expect(response.body.skills.map((skill: { name: string }) => skill.name)).toContain("measurement-quality");
  });
});
