#!/usr/bin/env node
/**
 * Installs runtimes via GET /api/v2/packages + POST /api/v2/packages.
 * In pkgs/index the Node runtime is called "node", not "javascript" — using the
 * wrong name yields a 404 or an empty filter result.
 *
 * Env: PISTON_API_URL or PISTON_URL (defaults to http://127.0.0.1:2000)
 */
const origin = (
  process.env.PISTON_API_URL ||
  process.env.PISTON_URL ||
  "http://127.0.0.1:2000"
)
  .trim()
  .replace(/\/+$/u, "");
const packagesUrl = `${origin}/api/v2/packages`;
const runtimesUrl = `${origin}/api/v2/runtimes`;

/** Our app language id -> the name used in Piston's pkgs/index (ppman) */
const RUNTIME_INSTALL = [
  { app: "javascript", pkg: "node" },
  { app: "typescript", pkg: "typescript" },
  { app: "python", pkg: "python" },
  { app: "php", pkg: "php" },
  { app: "java", pkg: "java" },
];

/** Rough semver comparison — higher versions come first under an ascending sort */
function compareSemverDesc(a, b) {
  const core = (v) => v.split("-")[0].split("+")[0];
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

function python3Only(rows) {
  return rows.filter((p) => {
    const v = String(p.language_version);
    const major = parseInt(v.split(".")[0], 10);
    return !Number.isNaN(major) && major >= 3;
  });
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
  const list = await res.json();
  if (!Array.isArray(list)) {
    throw new Error("Unerwartete Antwort von /api/v2/packages (kein Array)");
  }
  return list;
}

async function installOne({ app, pkg }, index) {
  let rows = index.filter((p) => p && p.language === pkg);
  if (pkg === "python") {
    rows = python3Only(rows);
  }
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
  const pending = rows.filter((p) => !p.installed);
  if (!pending.length) {
    console.log(`· ${app} (Paket ${pkg}, bereits installiert)`);
    return;
  }
  pending.sort((a, b) =>
    compareSemverDesc(String(a.language_version), String(b.language_version))
  );
  const version = String(pending[0].language_version);

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
    const j = JSON.parse(text);
    if (typeof j.message === "string") msg = j.message;
  } catch {
    /* raw */
  }
  if (/already installed/i.test(msg)) {
    console.log(`· ${app} (Paket ${pkg}, bereits installiert)`);
    return;
  }
  throw new Error(`${app} (${pkg} @ ${version}): HTTP ${res.status} — ${msg.slice(0, 500)}`);
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

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  console.error(
    "\nTipp: docker compose up -d piston\n" +
      "Hinweis: JavaScript = Paket „node“ im offiziellen Piston-Index.\n" +
      "Downloads auf arm64+amd64-Emulation können mehrere Minuten dauern."
  );
  process.exit(1);
});
