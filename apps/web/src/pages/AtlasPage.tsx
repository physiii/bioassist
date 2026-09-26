import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import DataObjectRoundedIcon from "@mui/icons-material/DataObjectRounded";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import MemoryOutlinedIcon from "@mui/icons-material/MemoryOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import {
  Alert,
  Box,
  ButtonBase,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  InputAdornment,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "../api/client";

type Coverage = "deep" | "master" | "supporting";

type AtlasBranch = {
  id: string;
  index: number;
  label: string;
  groupId: string;
  coverage: Coverage;
  summary: string;
  sourceCodes: string[];
  measurementFamilies: string[];
  buildTargets: string[];
};

type AtlasSource = {
  filename: string;
  code: string;
  title: string;
  kind: "master" | "domain" | "system";
  branchId: string | null;
  pageCount: number | null;
  summary: string;
  measurementFamilies: string[];
  initiatives: string[];
  registered: boolean;
  sha256: string;
  checksumStatus: "verified" | "missing" | "mismatch";
};

type AtlasPayload = {
  atlasVersion: string;
  title: string;
  description: string;
  safetyNotice: string;
  principles: Array<{ id: string; title: string; description: string }>;
  pipeline: Array<{ id: string; label: string; description: string; output: string }>;
  axes: Array<{ id: string; code: string; label: string; prompt: string }>;
  profileLayers: Array<{ id: string; label: string; description: string }>;
  branchGroups: Array<{ id: string; label: string; description: string }>;
  branches: AtlasBranch[];
  sources: AtlasSource[];
  programs: Array<{
    id: string;
    title: string;
    lane: "software" | "data" | "research" | "hardware" | "governance";
    stage: "now" | "next" | "later";
    summary: string;
    deliverables: string[];
    sourceCodes: string[];
  }>;
  skills: Array<{ id: string; name: string; description: string; path: string }>;
  stats: {
    sourceCount: number;
    declaredSourceCount: number;
    pageCount: number;
    branchCount: number;
    deepBranchCount: number;
    axisCount: number;
    skillCount: number;
  };
  integrity: {
    ok: boolean;
    missingFiles: string[];
    unregisteredFiles: string[];
    checksumProblems: Array<{ filename: string; status: string }>;
    duplicatesIgnored: Array<{ path: string; sha256: string; reason: string }>;
  };
};

const groupColors: Record<string, string> = {
  outcomes: "#1565C0",
  biology: "#00897B",
  experience: "#7B1FA2",
  context: "#EF6C00",
  action: "#455A64"
};

const coverageLabels: Record<Coverage, string> = {
  deep: "Deep packet",
  master: "Master atlas",
  supporting: "Supporting coverage"
};

function Metric({ label, value, icon }: { label: string; value: string | number; icon: ReactNode }) {
  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", height: "100%" }}>
      <CardContent sx={{ display: "flex", gap: 1.5, alignItems: "center", py: 1.6, "&:last-child": { pb: 1.6 } }}>
        <Box sx={{ color: "primary.main", display: "grid", placeItems: "center" }}>{icon}</Box>
        <Box>
          <Typography variant="h6" lineHeight={1.1}>
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

function HealthMap({ data }: { data: AtlasPayload }) {
  const [selectedId, setSelectedId] = useState(data.branches[0]?.id ?? "");
  const selected = data.branches.find((branch) => branch.id === selectedId) ?? data.branches[0];
  const selectedSources = selected
    ? data.sources.filter((source) => selected.sourceCodes.includes(source.code))
    : [];

  return (
    <Stack spacing={2.5}>
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent>
          <Stack spacing={1.5}>
            <Box>
              <Typography variant="h6">Nine coordinates for every health concept</Typography>
              <Typography variant="body2" color="text.secondary">
                The tree answers where to start. These axes keep any branch from becoming another silo.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {data.axes.map((axis) => (
                <Chip key={axis.id} label={`${axis.code} · ${axis.label}`} title={axis.prompt} variant="outlined" />
              ))}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.25fr) minmax(340px, .75fr)" }, gap: 2 }}>
        <Stack spacing={2}>
          {data.branchGroups.map((group) => {
            const branches = data.branches.filter((branch) => branch.groupId === group.id);
            if (!branches.length) return null;
            const color = groupColors[group.id] ?? "#455A64";
            return (
              <Box key={group.id}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 0.2, sm: 1 }} alignItems={{ sm: "baseline" }} sx={{ mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight={800}>
                    {group.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {group.description}
                  </Typography>
                </Stack>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 1 }}>
                  {branches.map((branch) => {
                    const active = selected?.id === branch.id;
                    return (
                      <Card
                        key={branch.id}
                        elevation={0}
                        sx={{
                          border: "1px solid",
                          borderColor: active ? color : "divider",
                          bgcolor: active ? alpha(color, 0.07) : "background.paper",
                          transition: "border-color 120ms ease, background-color 120ms ease"
                        }}
                      >
                        <ButtonBase
                          onClick={() => setSelectedId(branch.id)}
                          aria-pressed={active}
                          sx={{ width: "100%", textAlign: "left", justifyContent: "stretch" }}
                        >
                          <Box sx={{ p: 1.6, width: "100%" }}>
                            <Stack direction="row" spacing={1.2} alignItems="flex-start">
                              <Box
                                sx={{
                                  width: 30,
                                  height: 30,
                                  flex: "0 0 auto",
                                  borderRadius: "10px",
                                  color: "white",
                                  bgcolor: color,
                                  display: "grid",
                                  placeItems: "center",
                                  fontWeight: 800,
                                  fontSize: 13
                                }}
                              >
                                {branch.index}
                              </Box>
                              <Box sx={{ minWidth: 0 }}>
                                <Typography variant="body2" fontWeight={800}>
                                  {branch.label}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {coverageLabels[branch.coverage]}
                                </Typography>
                              </Box>
                            </Stack>
                          </Box>
                        </ButtonBase>
                      </Card>
                    );
                  })}
                </Box>
              </Box>
            );
          })}
        </Stack>

        {selected && (
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", alignSelf: "start", position: { lg: "sticky" }, top: { lg: 88 } }}>
            <CardContent>
              <Stack spacing={2}>
                <Box>
                  <Chip
                    size="small"
                    label={coverageLabels[selected.coverage]}
                    color={selected.coverage === "deep" ? "success" : "default"}
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="h6">{selected.label}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.7 }}>
                    {selected.summary}
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="overline" color="text.secondary">
                    Measurement families
                  </Typography>
                  <Stack direction="row" spacing={0.8} useFlexGap flexWrap="wrap" sx={{ mt: 0.5 }}>
                    {selected.measurementFamilies.map((family) => (
                      <Chip key={family} label={family} size="small" variant="outlined" />
                    ))}
                  </Stack>
                </Box>
                <Box>
                  <Typography variant="overline" color="text.secondary">
                    Build targets
                  </Typography>
                  <Stack spacing={0.7} sx={{ mt: 0.4 }}>
                    {selected.buildTargets.map((target) => (
                      <Stack key={target} direction="row" spacing={1} alignItems="center">
                        <ArrowForwardRoundedIcon color="primary" fontSize="small" />
                        <Typography variant="body2">{target}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
                <Box>
                  <Typography variant="overline" color="text.secondary">
                    Source coverage · {selectedSources.length} {selectedSources.length === 1 ? "volume" : "volumes"}
                  </Typography>
                  <Stack spacing={0.7} sx={{ mt: 0.4 }}>
                    {selectedSources.slice(0, 5).map((source) => (
                      <Typography key={source.code} variant="body2">
                        <Box component="span" sx={{ color: "text.secondary", mr: 0.8 }}>
                          {source.code}
                        </Box>
                        {source.title}
                      </Typography>
                    ))}
                    {selectedSources.length > 5 && (
                      <Typography variant="caption" color="text.secondary">
                        +{selectedSources.length - 5} additional system volumes
                      </Typography>
                    )}
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        )}
      </Box>
    </Stack>
  );
}

function SourceLibrary({ data }: { data: AtlasPayload }) {
  const [query, setQuery] = useState("");
  const filteredSources = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return data.sources;
    return data.sources.filter((source) =>
      [source.code, source.title, source.summary, ...source.measurementFamilies, ...source.initiatives]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }, [data.sources, query]);

  return (
    <Stack spacing={2}>
      <TextField
        label="Search sources, measurements, or initiatives"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        fullWidth
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon />
              </InputAdornment>
            )
          }
        }}
      />
      <Typography variant="body2" color="text.secondary">
        {filteredSources.length} of {data.sources.length} canonical volumes
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }, gap: 2 }}>
        {filteredSources.map((source) => (
          <Card key={source.filename} elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Stack spacing={1.4}>
                <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="overline" color="primary.main">
                      {source.code} · {source.pageCount ?? "?"} pages
                    </Typography>
                    <Typography variant="h6" fontSize={17}>
                      {source.title}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    icon={source.checksumStatus === "verified" ? <CheckCircleOutlineRoundedIcon /> : undefined}
                    label={source.checksumStatus}
                    color={source.checksumStatus === "verified" ? "success" : "warning"}
                    variant="outlined"
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {source.summary}
                </Typography>
                <Stack direction="row" spacing={0.7} useFlexGap flexWrap="wrap">
                  {source.measurementFamilies.map((family) => (
                    <Chip key={family} label={family} size="small" />
                  ))}
                </Stack>
                <Divider />
                <Box>
                  <Typography variant="overline" color="text.secondary">
                    Research directions
                  </Typography>
                  {source.initiatives.map((initiative) => (
                    <Typography key={initiative} variant="body2">
                      {initiative}
                    </Typography>
                  ))}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>
      {!filteredSources.length && <Alert severity="info">No atlas source matches “{query}”.</Alert>}
    </Stack>
  );
}

function BuildProgram({ data }: { data: AtlasPayload }) {
  const stageLabels = { now: "Now", next: "Next", later: "Later" } as const;
  return (
    <Stack spacing={3}>
      {(["now", "next", "later"] as const).map((stage) => (
        <Box key={stage}>
          <Typography variant="h6" sx={{ mb: 1.2 }}>
            {stageLabels[stage]}
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }, gap: 2 }}>
            {data.programs
              .filter((program) => program.stage === stage)
              .map((program) => (
                <Card key={program.id} elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
                  <CardContent>
                    <Stack spacing={1.2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1" fontWeight={800}>
                          {program.title}
                        </Typography>
                        <Chip label={program.lane} size="small" variant="outlined" />
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {program.summary}
                      </Typography>
                      <Stack direction="row" spacing={0.7} useFlexGap flexWrap="wrap">
                        {program.deliverables.map((deliverable) => (
                          <Chip key={deliverable} label={deliverable} size="small" />
                        ))}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
          </Box>
        </Box>
      ))}

      <Box>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.2 }}>
          <MemoryOutlinedIcon color="primary" />
          <Typography variant="h6">Behind-the-scenes skill suite</Typography>
        </Stack>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" }, gap: 1.5 }}>
          {data.skills.map((skill) => (
            <Card key={skill.id} elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={800} gutterBottom>
                  {skill.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {skill.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </Stack>
  );
}

export function AtlasPage() {
  const [data, setData] = useState<AtlasPayload | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"map" | "sources" | "program">("map");

  useEffect(() => {
    api
      .get<AtlasPayload>("/api/atlas")
      .then((response) => setData(response.data))
      .catch(() => setError("Could not load the Health Atlas catalog."));
  }, []);

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!data) {
    return (
      <Box sx={{ minHeight: 420, display: "grid", placeItems: "center" }}>
        <CircularProgress aria-label="Loading Health Atlas" />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <Card
        elevation={0}
        sx={{
          color: "white",
          overflow: "hidden",
          background: "linear-gradient(135deg, #0B3558 0%, #0B6F72 60%, #168B7A 100%)"
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 4 }, "&:last-child": { pb: { xs: 2.5, md: 4 } } }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={3} justifyContent="space-between">
            <Box sx={{ maxWidth: 720 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <HubOutlinedIcon />
                <Typography variant="overline" sx={{ color: alpha("#fff", 0.78), letterSpacing: 1.3 }}>
                  Source-backed · version {data.atlasVersion}
                </Typography>
              </Stack>
              <Typography variant="h4" sx={{ mb: 1 }}>
                Your health, mapped without flattening it
              </Typography>
              <Typography sx={{ color: alpha("#fff", 0.84), maxWidth: 680 }}>
                {data.description} Explore what is covered, how it can be measured, and what BioAssist builds next.
              </Typography>
            </Box>
            <Box sx={{ minWidth: { md: 220 }, alignSelf: { md: "center" } }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CheckCircleOutlineRoundedIcon />
                <Box>
                  <Typography fontWeight={800}>{data.integrity.ok ? "All sources verified" : "Source review needed"}</Typography>
                  <Typography variant="caption" sx={{ color: alpha("#fff", 0.75) }}>
                    {data.integrity.duplicatesIgnored.length} exact duplicate ignored
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" }, gap: 1.5 }}>
        <Metric label="verified source volumes" value={data.stats.sourceCount} icon={<CheckCircleOutlineRoundedIcon />} />
        <Metric label="source pages" value={data.stats.pageCount.toLocaleString()} icon={<DataObjectRoundedIcon />} />
        <Metric label="health branches" value={data.stats.branchCount} icon={<AccountTreeOutlinedIcon />} />
        <Metric label="cross-cutting axes" value={data.stats.axisCount} icon={<HubOutlinedIcon />} />
      </Box>

      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent>
          <Typography variant="overline" color="text.secondary">
            Operating loop
          </Typography>
          <Box sx={{ display: "flex", overflowX: "auto", gap: 1, pt: 0.7, pb: 0.5 }}>
            {data.pipeline.map((step, index) => (
              <Stack key={step.id} direction="row" spacing={1} alignItems="center" sx={{ flex: "0 0 auto" }}>
                <Box sx={{ minWidth: { xs: 150, md: 120 }, maxWidth: 190 }}>
                  <Typography variant="subtitle2" fontWeight={800}>
                    {step.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {step.output}
                  </Typography>
                </Box>
                {index < data.pipeline.length - 1 && <ArrowForwardRoundedIcon color="disabled" />}
              </Stack>
            ))}
          </Box>
        </CardContent>
      </Card>

      <Alert severity="info" icon={<ShieldOutlinedIcon />}>
        {data.safetyNotice}
      </Alert>

      <Box>
        <Tabs value={tab} onChange={(_event, value) => setTab(value)} aria-label="Atlas views" sx={{ mb: 2 }}>
          <Tab value="map" label="Health map" />
          <Tab value="sources" label="Source library" />
          <Tab value="program" label="Build program" />
        </Tabs>
        {tab === "map" && <HealthMap data={data} />}
        {tab === "sources" && <SourceLibrary data={data} />}
        {tab === "program" && <BuildProgram data={data} />}
      </Box>
    </Stack>
  );
}
