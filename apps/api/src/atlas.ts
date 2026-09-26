import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const catalogSchema = z.object({
  schemaVersion: z.number().int().positive(),
  atlasVersion: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  safetyNotice: z.string().min(1),
  principles: z.array(
    z.object({
      id: z.string().min(1),
      title: z.string().min(1),
      description: z.string().min(1)
    })
  ),
  pipeline: z.array(
    z.object({
      id: z.string().min(1),
      label: z.string().min(1),
      description: z.string().min(1),
      output: z.string().min(1)
    })
  ),
  axes: z.array(
    z.object({
      id: z.string().min(1),
      code: z.string().min(1),
      label: z.string().min(1),
      prompt: z.string().min(1)
    })
  ),
  profileLayers: z.array(
    z.object({
      id: z.string().min(1),
      label: z.string().min(1),
      description: z.string().min(1)
    })
  ),
  branchGroups: z.array(
    z.object({
      id: z.string().min(1),
      label: z.string().min(1),
      description: z.string().min(1)
    })
  ),
  branches: z.array(
    z.object({
      id: z.string().min(1),
      index: z.number().int().positive(),
      label: z.string().min(1),
      groupId: z.string().min(1),
      coverage: z.enum(["deep", "master", "supporting"]),
      summary: z.string().min(1),
      sourceCodes: z.array(z.string()),
      measurementFamilies: z.array(z.string()),
      buildTargets: z.array(z.string())
    })
  ),
  sourceMetadata: z.record(
    z.string(),
    z.object({
      code: z.string().min(1),
      title: z.string().min(1),
      kind: z.enum(["master", "domain", "system"]),
      branchId: z.string().min(1),
      pageCount: z.number().int().positive(),
      summary: z.string().min(1),
      measurementFamilies: z.array(z.string()),
      initiatives: z.array(z.string())
    })
  ),
  programs: z.array(
    z.object({
      id: z.string().min(1),
      title: z.string().min(1),
      lane: z.enum(["software", "data", "research", "hardware", "governance"]),
      stage: z.enum(["now", "next", "later"]),
      summary: z.string().min(1),
      deliverables: z.array(z.string()),
      sourceCodes: z.array(z.string())
    })
  )
});

type AtlasCatalog = z.infer<typeof catalogSchema>;

const moduleDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = process.env.BIOASSIST_REPO_ROOT
  ? resolve(process.env.BIOASSIST_REPO_ROOT)
  : resolve(moduleDirectory, "../../..");
const canonicalSourceDirectory = resolve(repositoryRoot, "docs/Health_Atlas_Research_Suite_Complete_2026");
const catalogPath = resolve(repositoryRoot, "docs/atlas/catalog.json");
const skillsDirectory = resolve(repositoryRoot, "skills");

function parseManifest(manifest: string) {
  const checksums = new Map<string, string>();
  for (const line of manifest.split(/\r?\n/)) {
    const match = line.match(/^([a-f0-9]{64})\s{2}(.+\.pdf)$/i);
    if (match) checksums.set(match[2], match[1].toLowerCase());
  }
  const declaredCount = Number(manifest.match(/^PDF count:\s*(\d+)$/m)?.[1] ?? checksums.size);
  return { checksums, declaredCount };
}

async function sha256(path: string) {
  const contents = await readFile(path);
  return createHash("sha256").update(contents).digest("hex");
}

function humanizeFilename(filename: string) {
  return filename
    .replace(/\.pdf$/i, "")
    .replace(/^\d+[A-Z]?_/, "")
    .replaceAll("_", " ")
    .replace(/\s+2026$/, "");
}

function parseSkillFrontmatter(contents: string, fallbackName: string) {
  const frontmatter = contents.match(/^---\s*\n([\s\S]*?)\n---/);
  const fields = new Map<string, string>();
  for (const line of frontmatter?.[1]?.split(/\r?\n/) ?? []) {
    const separator = line.indexOf(":");
    if (separator > 0) fields.set(line.slice(0, separator).trim(), line.slice(separator + 1).trim());
  }
  return {
    name: fields.get("name") || fallbackName,
    description: fields.get("description") || "Project capability"
  };
}

async function discoverSkills() {
  const entries = await readdir(skillsDirectory, { withFileTypes: true });
  const skills = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        const skillPath = resolve(skillsDirectory, entry.name, "SKILL.md");
        try {
          const contents = await readFile(skillPath, "utf8");
          const metadata = parseSkillFrontmatter(contents, entry.name);
          return {
            id: entry.name,
            ...metadata,
            path: relative(repositoryRoot, skillPath)
          };
        } catch {
          return null;
        }
      })
  );
  return skills.filter((skill): skill is NonNullable<typeof skill> => skill !== null).sort((a, b) => a.name.localeCompare(b.name));
}

async function discoverDuplicateSources(canonicalChecksums: Set<string>) {
  const entries = await readdir(resolve(repositoryRoot, "docs"), { withFileTypes: true });
  const topLevelPdfs = entries.filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".pdf"));
  const candidates = await Promise.all(
    topLevelPdfs.map(async (entry) => {
      const path = resolve(repositoryRoot, "docs", entry.name);
      const checksum = await sha256(path);
      return canonicalChecksums.has(checksum)
        ? { path: relative(repositoryRoot, path), sha256: checksum, reason: "Matches a canonical suite source" }
        : null;
    })
  );
  return candidates.filter((candidate): candidate is NonNullable<typeof candidate> => candidate !== null);
}

async function buildAtlas() {
  const [catalogText, manifestText, sourceEntries, skills] = await Promise.all([
    readFile(catalogPath, "utf8"),
    readFile(resolve(canonicalSourceDirectory, "MANIFEST.txt"), "utf8"),
    readdir(canonicalSourceDirectory, { withFileTypes: true }),
    discoverSkills()
  ]);
  const catalog: AtlasCatalog = catalogSchema.parse(JSON.parse(catalogText));
  const { checksums, declaredCount } = parseManifest(manifestText);
  const filenames = sourceEntries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".pdf"))
    .map((entry) => entry.name)
    .sort();

  const sources = await Promise.all(
    filenames.map(async (filename) => {
      const expectedChecksum = checksums.get(filename) ?? null;
      const actualChecksum = await sha256(resolve(canonicalSourceDirectory, filename));
      const metadata = catalog.sourceMetadata[filename];
      return {
        filename,
        code: metadata?.code ?? "unregistered",
        title: metadata?.title ?? humanizeFilename(filename),
        kind: metadata?.kind ?? "domain",
        branchId: metadata?.branchId ?? null,
        pageCount: metadata?.pageCount ?? null,
        summary: metadata?.summary ?? "Source discovered; semantic metadata has not been curated yet.",
        measurementFamilies: metadata?.measurementFamilies ?? [],
        initiatives: metadata?.initiatives ?? [],
        registered: Boolean(metadata),
        sha256: actualChecksum,
        checksumStatus: expectedChecksum === null ? "missing" : expectedChecksum === actualChecksum ? "verified" : "mismatch"
      };
    })
  );
  sources.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));

  const duplicatesIgnored = await discoverDuplicateSources(new Set(sources.map((source) => source.sha256)));
  const missingFiles = Object.keys(catalog.sourceMetadata).filter((filename) => !filenames.includes(filename));
  const unregisteredFiles = sources.filter((source) => !source.registered).map((source) => source.filename);
  const checksumProblems = sources
    .filter((source) => source.checksumStatus !== "verified")
    .map((source) => ({ filename: source.filename, status: source.checksumStatus }));
  const pageCount = sources.reduce((total, source) => total + (source.pageCount ?? 0), 0);

  return {
    schemaVersion: catalog.schemaVersion,
    atlasVersion: catalog.atlasVersion,
    title: catalog.title,
    description: catalog.description,
    safetyNotice: catalog.safetyNotice,
    principles: catalog.principles,
    pipeline: catalog.pipeline,
    axes: catalog.axes,
    profileLayers: catalog.profileLayers,
    branchGroups: catalog.branchGroups,
    branches: catalog.branches,
    sources,
    programs: catalog.programs,
    skills,
    stats: {
      sourceCount: sources.length,
      declaredSourceCount: declaredCount,
      pageCount,
      branchCount: catalog.branches.length,
      deepBranchCount: catalog.branches.filter((branch) => branch.coverage === "deep").length,
      axisCount: catalog.axes.length,
      skillCount: skills.length
    },
    integrity: {
      ok: missingFiles.length === 0 && unregisteredFiles.length === 0 && checksumProblems.length === 0,
      missingFiles,
      unregisteredFiles,
      checksumProblems,
      duplicatesIgnored
    }
  };
}

let atlasPromise: ReturnType<typeof buildAtlas> | null = null;

export function loadAtlas() {
  atlasPromise ??= buildAtlas();
  return atlasPromise;
}
