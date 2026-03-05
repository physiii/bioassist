import { randomUUID } from "node:crypto";

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  password: string;
  onboarded: boolean;
  goals?: string;
  constraints?: string;
  focusDomains: string[];
  onboardingProfile?: {
    outcomePriorities: string[];
    bottlenecks: string[];
    contextFlags: string[];
    startingPoint: string;
    notes: string;
  };
};

type SessionRecord = {
  token: string;
  userId: string;
};

const users = new Map<string, UserRecord>();
const usersByEmail = new Map<string, UserRecord>();
const sessions = new Map<string, SessionRecord>();

export function resetStore() {
  users.clear();
  usersByEmail.clear();
  sessions.clear();
}

export function findUserByEmail(email: string) {
  return usersByEmail.get(email.toLowerCase()) ?? null;
}

export function findUserByToken(token: string) {
  const session = sessions.get(token);
  if (!session) return null;
  return users.get(session.userId) ?? null;
}

export function createUser(payload: Pick<UserRecord, "name" | "email" | "password">) {
  const user: UserRecord = {
    id: randomUUID(),
    name: payload.name.trim(),
    email: payload.email.toLowerCase().trim(),
    password: payload.password,
    onboarded: false,
    focusDomains: []
  };
  users.set(user.id, user);
  usersByEmail.set(user.email, user);
  return user;
}

export function createSession(userId: string) {
  const token = randomUUID();
  sessions.set(token, { token, userId });
  return token;
}

export function deleteSession(token: string) {
  sessions.delete(token);
}

export function updateOnboarding(
  userId: string,
  payload: {
    goals: string;
    constraints: string;
    focusDomains: string[];
    onboardingProfile: {
      outcomePriorities: string[];
      bottlenecks: string[];
      contextFlags: string[];
      startingPoint: string;
      notes: string;
    };
  }
) {
  const user = users.get(userId);
  if (!user) return null;
  user.goals = payload.goals;
  user.constraints = payload.constraints;
  user.focusDomains = payload.focusDomains;
  user.onboardingProfile = payload.onboardingProfile;
  user.onboarded = true;
  return user;
}

export function toPublicUser(user: UserRecord) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    onboarded: user.onboarded,
    goals: user.goals ?? "",
    constraints: user.constraints ?? "",
    focusDomains: user.focusDomains,
    onboardingProfile: user.onboardingProfile ?? null
  };
}
