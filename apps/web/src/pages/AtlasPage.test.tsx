import { ThemeProvider } from "@mui/material";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../api/client";
import { theme } from "../theme";
import { AtlasPage } from "./AtlasPage";

vi.mock("../api/client", () => ({
  api: { get: vi.fn() }
}));

const atlasFixture = {
  atlasVersion: "2026-08-13",
  title: "Health Atlas Research Suite",
  description: "A source-backed map.",
  safetyNotice: "Research and organization only.",
  principles: [],
  pipeline: [
    { id: "collect", label: "Collect", description: "Collect sources", output: "Source event" },
    { id: "validate", label: "Validate", description: "Validate quality", output: "Quality envelope" }
  ],
  axes: [{ id: "domain", code: "D", label: "Domain or target", prompt: "What is affected?" }],
  profileLayers: [],
  branchGroups: [
    { id: "outcomes", label: "Whole-person outcomes", description: "Outcomes" },
    { id: "biology", label: "Biological and clinical", description: "Biology" }
  ],
  branches: [
    {
      id: "whole-person",
      index: 1,
      label: "Whole-person health states and outcomes",
      groupId: "outcomes",
      coverage: "deep",
      summary: "Whole-person profile.",
      sourceCodes: ["00", "01"],
      measurementFamilies: ["Patient-reported outcomes"],
      buildTargets: ["Whole-person trajectory view"]
    },
    {
      id: "organ-systems",
      index: 3,
      label: "Organ-system health",
      groupId: "biology",
      coverage: "deep",
      summary: "Fifteen system packets.",
      sourceCodes: ["00", "03B"],
      measurementFamilies: ["Electrical and electrophysiology"],
      buildTargets: ["Cardiovascular first pilot"]
    }
  ],
  sources: [
    {
      filename: "Atlas.pdf",
      code: "00",
      title: "Atlas of Human Health",
      kind: "master",
      branchId: "measurement-data",
      pageCount: 217,
      summary: "Master taxonomy.",
      measurementFamilies: ["Taxonomy"],
      initiatives: ["Core ontology"],
      registered: true,
      sha256: "abc",
      checksumStatus: "verified"
    },
    {
      filename: "Respiratory.pdf",
      code: "03B",
      title: "Respiratory Health and Measurement Engineering",
      kind: "system",
      branchId: "organ-systems",
      pageCount: 83,
      summary: "Respiratory systems.",
      measurementFamilies: ["Spirometry"],
      initiatives: ["Equity-critical oximetry study"],
      registered: true,
      sha256: "def",
      checksumStatus: "verified"
    }
  ],
  programs: [
    {
      id: "knowledge-registry",
      title: "Atlas knowledge registry",
      lane: "software",
      stage: "now",
      summary: "Queryable atlas data.",
      deliverables: ["Catalog API"],
      sourceCodes: ["00"]
    }
  ],
  skills: [
    {
      id: "measurement-quality",
      name: "measurement-quality",
      description: "Validate measurement quality.",
      path: "skills/measurement-quality/SKILL.md"
    }
  ],
  stats: {
    sourceCount: 19,
    declaredSourceCount: 19,
    pageCount: 1494,
    branchCount: 15,
    deepBranchCount: 4,
    axisCount: 9,
    skillCount: 6
  },
  integrity: {
    ok: true,
    missingFiles: [],
    unregisteredFiles: [],
    checksumProblems: [],
    duplicatesIgnored: [{ path: "docs/Cardiovascular.pdf", sha256: "abc", reason: "duplicate" }]
  }
};

function renderAtlas() {
  render(
    <ThemeProvider theme={theme}>
      <AtlasPage />
    </ThemeProvider>
  );
}

describe("AtlasPage", () => {
  beforeEach(() => {
    vi.mocked(api.get).mockResolvedValue({ data: atlasFixture });
  });

  it("renders source-backed summary and lets the user inspect a branch", async () => {
    renderAtlas();
    expect(await screen.findByText(/your health, mapped without flattening it/i)).toBeInTheDocument();
    expect(screen.getByText("1,494")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /organ-system health/i }));
    expect(screen.getByText("Fifteen system packets.")).toBeInTheDocument();
    expect(screen.getByText("Cardiovascular first pilot")).toBeInTheDocument();
    expect(screen.getByText(/2 volumes/i)).toBeInTheDocument();
  });

  it("filters sources and exposes the discovered skill suite", async () => {
    renderAtlas();
    await screen.findByText(/your health, mapped without flattening it/i);

    await userEvent.click(screen.getByRole("tab", { name: /source library/i }));
    await userEvent.type(screen.getByLabelText(/search sources/i), "spirometry");
    await waitFor(() => expect(screen.getByText("Respiratory Health and Measurement Engineering")).toBeInTheDocument());
    expect(screen.queryByText("Atlas of Human Health")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("tab", { name: /build program/i }));
    expect(screen.getByText("measurement-quality")).toBeInTheDocument();
    expect(screen.getByText("Atlas knowledge registry")).toBeInTheDocument();
  });
});
