/**
 * Runs reference solutions for one challenge module through the real harness and Piston, so a
 * new challenge is known to be solvable in every language it offers before it is seeded.
 *
 *   pnpm exec tsx scripts/verify-challenge.ts prisma/challenges/<slug>.ts <solutions dir> [lang,lang]
 *
 * The solutions dir holds one file per language - javascript.js typescript.ts python.py php.php
 * ruby.rb java.java go.go cpp.cpp csharp.cs rust.rs - and stays outside the repo: a reference
 * solution next to the challenge would be one `git log` away from every user. Languages without a
 * file are reported as MISSING. csharp runs only with RUN_CSHARP=1, because Mono cannot start
 * under the QEMU emulation the amd64 Piston image needs on Apple Silicon.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { buildWrappedProgram, extractIoProgramOutput, outputsMatch } from "@/lib/server/io-harness";
import { executeWithPiston } from "@/lib/server/piston-runner";

const EXT: Record<string, string> = {
  javascript: "js", typescript: "ts", python: "py", php: "php", ruby: "rb",
  java: "java", go: "go", cpp: "cpp", csharp: "cs", rust: "rs",
};

async function main() {
  const [modPath, solDir, only] = process.argv.slice(2);
  if (!modPath || !solDir) throw new Error("usage: verify-challenge.ts <module.ts> <solutions dir> [langs]");
  const mod = await import(pathToFileURL(resolve(modPath)).href);
  const ch = mod.challenge;
  const callables = ch.evaluationConfig.callableByLanguage as Record<string, string>;
  const wanted = only ? only.split(",") : (ch.supportedLanguages as string[]);
  let failures = 0;

  for (const lang of wanted) {
    if (lang === "csharp" && process.env.RUN_CSHARP !== "1") { console.log(`${lang}: SKIPPED (RUN_CSHARP=1 to run)`); continue; }
    const file = resolve(solDir, `${lang}.${EXT[lang]}`);
    if (!existsSync(file)) { console.log(`${lang}: MISSING ${file}`); failures++; continue; }
    const code = readFileSync(file, "utf8");
    for (const tc of ch.testCases as { id: number; name: string; input: string; expected: string }[]) {
      const wrapped = buildWrappedProgram(lang as never, code, callables[lang], tc.input);
      const r = await executeWithPiston(lang as never, wrapped, tc.input);
      const out = extractIoProgramOutput(r.stdout);
      const ok = r.ok && !r.compileFailed && outputsMatch(out, tc.expected);
      if (!ok) {
        failures++;
        console.log(`${lang} #${tc.id} ${tc.name}: FAIL`);
        console.log(`   input:    ${tc.input}`);
        console.log(`   expected: ${tc.expected}`);
        console.log(`   actual:   ${(out || r.stderr || r.compileOutput || `exit ${r.exitCode}`).slice(0, 600)}`);
      }
    }
    console.log(`${lang}: done`);
  }
  console.log(failures === 0 ? "\nALL PASSED" : `\n${failures} FAILURE(S)`);
  process.exit(failures === 0 ? 0 : 1);
}

void main();
