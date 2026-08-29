#!/usr/bin/env node
/**
 * Installs runtimes via GET /api/v2/packages + POST /api/v2/packages.
 * In pkgs/index the Node runtime is called "node", not "javascript" - using the
 * wrong name yields a 404 or an empty filter result, which is why the package name
 * lives in the language registry rather than being guessed from the id.
 *
 * Env: PISTON_API_URL or PISTON_URL (defaults to http://127.0.0.1:2000)
 */
import { LANGUAGE_LIST } from "../lib/challenge-languages";

type PackageRow = { language: string; language_version: string; installed?: boolean };
const origin = (
  process.env.PISTON_API_URL ||
  process.env.PISTON_URL ||
  "http://127.0.0.1:2000"
)
  .trim()
  .replace(/\/+$/u, "");
const packagesUrl = `${origin}/api/v2/packages`;
const runtimesUrl = `${origin}/api/v2/runtimes`;

/*
  Straight from the registry, so a new language cannot be added to the app and forgotten here.
  This file used to keep its own copy of the mapping, which is how it ends up one entry behind.
*/
const RUNTIME_INSTALL = LANGUAGE_LIST.map((spec) => ({
  app: spec.id,
  pkg: spec.pistonPackage,
  versionPrefix: spec.versionPrefix,
}));

/** Rough semver comparison - higher versions come first under an ascending sort */
function compareSemverDesc(a: string, b: string) {
  const core = (v: string) => v.split("-")[0]!.split("+")[0]!;
  const pa = core(a)
    .split(".")
    .map((x) => parseInt(x, 10) || 0);
  const pb = core(b)
    .split(".")
    .map((x) => parseInt(x, 10) || 0);
  const n = Math.max(pa.length, pb.length);
  for (let i = 0; i < n; i++) {
    const da = pa[i] ?? 0;
    const db = pb[i] ?? 0;
    if (da !== db) return db - da;
  }
  return core(b).localeCompare(core(a));
}

/** Piston keeps outdated majors around - Python 2, Ruby 2.5, TypeScript 4. */
function matchingVersion(rows: PackageRow[], versionPrefix?: string) {
  if (!versionPrefix) return rows;
  const filtered = rows.filter((p) => String(p.language_version).startsWith(versionPrefix));
  return filtered.length > 0 ? filtered : rows;
}

async function ensureReachable() {
  const res = await fetch(runtimesUrl, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(
      `Piston nicht erreichbar unter ${runtimesUrl} (HTTP ${res.status})\n${t.slice(0, 200)}`
    );
  }
}

async function fetchPackageList() {
  const res = await fetch(packagesUrl, { signal: AbortSignal.timeout(60_000) });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(
      `Paketliste fehlgeschlagen: HTTP ${res.status}\n${t.slice(0, 300)}`
    );
  }
  const list = (await res.json()) as PackageRow[];
  if (!Array.isArray(list)) {
    throw new Error("Unerwartete Antwort von /api/v2/packages (kein Array)");
  }
  return list;
}

async function installOne(
  { app, pkg, versionPrefix }: (typeof RUNTIME_INSTALL)[number],
  index: PackageRow[]
) {
  const rows = matchingVersion(
    index.filter((p) => p && p.language === pkg),
    versionPrefix
  );
  if (!rows.length) {
    if (!index.length) {
      throw new Error(
        `Paketindex ist leer. Der Piston-Container muss ${"https://github.com/engineer-man/piston/releases/download/pkgs/index"} laden können (Firewall / DNS / Proxy). Optional: PISTON_REPO_URL setzen.`
      );
    }
    throw new Error(
      `Keine Pakete für „${pkg}“ im Index (App: ${app}). Netzwerk vom Container zu GitHub prüfen.`
    );
  }
  /*
    Any matching version being present is enough. Filtering to the uninstalled ones and taking
    the highest of *those* is how this script quietly added Python 3.10 next to an existing 3.12
    and PHP 8.0 next to 8.2 - older runtimes that only make the version choice ambiguous.
  */
  if (rows.some((p) => p.installed)) {
    const have = rows.find((p) => p.installed)!.language_version;
    console.log(`· ${app} (Paket ${pkg} @ ${have}, bereits installiert)`);
    return;
  }
  const pending = rows.filter((p) => !p.installed);
  pending.sort((a, b) =>
    compareSemverDesc(String(a.language_version), String(b.language_version))
  );
  const version = String(pending[0]!.language_version);

  const res = await fetch(packagesUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ language: pkg, version }),
    signal: AbortSignal.timeout(600_000),
  });
  const text = await res.text();
  if (res.ok) {
    console.log(`✓ ${app} (Paket ${pkg} @ ${version})`);
    return;
  }
  let msg = text;
  try {
    const j = JSON.parse(text) as { message?: unknown };
    if (typeof j.message === "string") msg = j.message;
  } catch {
    /* raw */
  }
  if (/already installed/i.test(msg)) {
    console.log(`· ${app} (Paket ${pkg}, bereits installiert)`);
    return;
  }
  throw new Error(`${app} (${pkg} @ ${version}): HTTP ${res.status}: ${msg.slice(0, 500)}`);
}

async function main() {
  console.log(`Piston: ${origin}\n`);
  await ensureReachable();
  for (const spec of RUNTIME_INSTALL) {
    console.log(`Installiere ${spec.app} (Piston-Paket „${spec.pkg}“) …`);
    const index = await fetchPackageList();
    await installOne(spec, index);
  }
  const check = await fetch(runtimesUrl);
  const list = await check.json();
  console.log(`\nFertig. Runtimes: ${Array.isArray(list) ? list.length : 0}`);
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : e);
  console.error(
    "\nTipp: docker compose up -d piston\n" +
      "Hinweis: JavaScript = Paket „node“ im offiziellen Piston-Index.\n" +
      "Downloads auf arm64+amd64-Emulation können mehrere Minuten dauern."
  );
  process.exit(1);
});
