import cors from "cors";
import express, { type Request, type Response } from "express";
import { z } from "zod";
import {
  createSession,
  createUser,
  deleteSession,
  findUserByEmail,
  findUserByToken,
  toPublicUser,
  updateOnboarding
} from "./store.js";

type AuthedRequest = Request & { userId?: string };

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(120).optional()
});

const onboardingSchema = z.object({
  outcomePriorities: z
    .array(z.enum(["healthspan", "longevity", "energy_mood", "condition_control", "performance"]))
    .min(1)
    .max(3),
  bottlenecks: z
    .array(z.enum(["sleep", "blood_pressure", "activity_fitness", "metabolic", "mood_stress", "substances", "pain_mobility"]))
    .min(1)
    .max(4),
  contextFlags: z
    .array(z.enum(["time_limited", "shift_work", "budget_limited", "caregiving_load", "high_stress_load", "limited_access_care"]))
    .min(1)
    .max(4),
  startingPoint: z.enum(["minimal_dashboard", "upload_documents", "connect_device"]),
  notes: z.string().max(800).optional().default(""),
  goals: z.string().max(1000).optional().default(""),
  constraints: z.string().max(1000).optional().default("")
});

const bottleneckToDomain: Record<string, string> = {
  sleep: "sleep",
  blood_pressure: "cardio",
  activity_fitness: "fitness",
  metabolic: "metabolic",
  mood_stress: "mental",
  substances: "preventive",
  pain_mobility: "musculoskeletal"
};

function labelize(value: string) {
  return value.replaceAll("_", " ");
}

function getBearerToken(header?: string) {
  if (!header) return "";
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer") return "";
  return token ?? "";
}

function requireAuth(req: AuthedRequest, res: Response, next: () => void) {
  const token = getBearerToken(req.header("authorization"));
  const user = findUserByToken(token);
  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  req.userId = user.id;
  next();
}

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "bioassist-api" });
  });

  app.post("/api/auth/signup", (req, res) => {
    const parsed = authSchema.safeParse(req.body);
    if (!parsed.success || !parsed.data.name) {
      res.status(400).json({ message: "Invalid signup payload" });
      return;
    }

    const existing = findUserByEmail(parsed.data.email);
    if (existing) {
      res.status(409).json({ message: "Email is already registered" });
      return;
    }

    const user = createUser({
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password
    });
    const token = createSession(user.id);
    res.status(201).json({ token, user: toPublicUser(user) });
  });

  app.post("/api/auth/login", (req, res) => {
    const parsed = authSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid login payload" });
      return;
    }

    const user = findUserByEmail(parsed.data.email);
    if (!user || user.password !== parsed.data.password) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = createSession(user.id);
    res.json({ token, user: toPublicUser(user) });
  });

  app.get("/api/auth/me", requireAuth, (req: AuthedRequest, res) => {
    const user = findUserByToken(getBearerToken(req.header("authorization")));
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    res.json({ user: toPublicUser(user) });
  });

  app.post("/api/auth/logout", requireAuth, (req: AuthedRequest, res) => {
    deleteSession(getBearerToken(req.header("authorization")));
    res.status(204).send();
  });

  app.post("/api/profile/onboarding", requireAuth, (req: AuthedRequest, res) => {
    const parsed = onboardingSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid onboarding payload" });
      return;
    }

    const focusDomains = Array.from(new Set(parsed.data.bottlenecks.map((item) => bottleneckToDomain[item]).filter(Boolean)));
    const goalsSummary =
      parsed.data.goals.trim() ||
      `Primary outcomes: ${parsed.data.outcomePriorities.map(labelize).join(", ")}. Current bottlenecks: ${parsed.data.bottlenecks
        .map(labelize)
        .join(", ")}.`;
    const constraintsSummary =
      parsed.data.constraints.trim() ||
      `Context constraints: ${parsed.data.contextFlags.map(labelize).join(", ")}. Preferred start: ${labelize(parsed.data.startingPoint)}.`;

    const user = updateOnboarding(req.userId!, {
      goals: goalsSummary,
      constraints: constraintsSummary,
      focusDomains: focusDomains.length ? focusDomains : ["sleep"],
      onboardingProfile: {
        outcomePriorities: parsed.data.outcomePriorities,
        bottlenecks: parsed.data.bottlenecks,
        contextFlags: parsed.data.contextFlags,
        startingPoint: parsed.data.startingPoint,
        notes: parsed.data.notes
      }
    });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json({ user: toPublicUser(user) });
  });

  app.get("/api/home", requireAuth, (req: AuthedRequest, res) => {
    const user = findUserByToken(getBearerToken(req.header("authorization")));
    const bottlenecks = user?.onboardingProfile?.bottlenecks ?? [];
    const priorities = [
      bottlenecks.includes("sleep")
        ? {
            id: "sleep-regularity",
            title: "Stabilize sleep schedule",
            why: "Sleep regularity is a high-leverage driver across mood and cardiometabolic pathways.",
            measure: "Track sleep duration and schedule consistency this week."
          }
        : null,
      bottlenecks.includes("blood_pressure")
        ? {
            id: "bp-baseline",
            title: "Establish blood pressure baseline",
            why: "Home BP trends are one of the highest-value preventive signals.",
            measure: "2 readings AM/PM for 7 days with a validated cuff."
          }
        : null,
      bottlenecks.includes("activity_fitness")
        ? {
            id: "activity-baseline",
            title: "Set activity + strength baseline",
            why: "Activity and fitness have strong links to morbidity and mortality outcomes.",
            measure: "Track steps and log two strength sessions this week."
          }
        : null,
      {
        id: "timeline-coverage",
        title: "Upload one clinical document",
        why: "Document-backed clinical context improves recommendation precision and safety.",
        measure: "Upload and confirm extraction for one lab or visit summary."
      }
    ].filter(Boolean);

    res.json({
      profileSummary: {
        focusDomains: user?.focusDomains ?? [],
        bottlenecks,
        startingPoint: user?.onboardingProfile?.startingPoint ?? "minimal_dashboard"
      },
      priorities,
      weeklySnapshot: {
        sleepHours: 6.8,
        stepsPerDay: 6230,
        mood: 6.4,
        dataCoverage: 61
      }
    });
  });

  return app;
}
