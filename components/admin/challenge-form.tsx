"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import type { ChallengeFormInitial } from "@/lib/admin/map-challenge-to-form";

const DEFAULT_EXAMPLES = `[
  { "input": "[1, 2, 3]", "output": "[1, 3, 6]" }
]`;

const DEFAULT_TESTS = `[
  { "id": 1, "name": "Beispiel", "input": "[1,2,3]", "expected": "[1,3,6]" }
]`;

type CategoryOption = { id: string; name: string };

export function AdminChallengeForm({
  categories,
  mode,
  initial,
}: {
  categories: CategoryOption[];
  mode: "create" | "edit";
  initial?: ChallengeFormInitial;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [id, setId] = useState(initial?.id ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [hint, setHint] = useState(initial?.hint ?? "");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    initial?.difficulty ?? "medium",
  );
  const [points, setPoints] = useState(initial?.points ?? 100);
  const [categoryId, setCategoryId] = useState(
    initial?.categoryId ?? categories[0]?.id ?? "",
  );
  const [examplesJson, setExamplesJson] = useState(
    initial?.examplesJson ?? DEFAULT_EXAMPLES,
  );
  const [testsJson, setTestsJson] = useState(
    initial?.testsJson ?? DEFAULT_TESTS,
  );
  const [fnJs, setFnJs] = useState(initial?.fnJs ?? "solve");
  const [fnTs, setFnTs] = useState(initial?.fnTs ?? "solve");
  const [fnPy, setFnPy] = useState(initial?.fnPy ?? "solve");
  const [starterJs, setStarterJs] = useState(
    initial?.starterJs ??
      "function solve(arr) {\n  // …\n  return arr;\n}",
  );
  const [starterTs, setStarterTs] = useState(
    initial?.starterTs ??
      "function solve(arr: number[]): number[] {\n  // …\n  return arr;\n}",
  );
  const [starterPy, setStarterPy] = useState(
    initial?.starterPy ?? "def solve(arr):\n    # …\n    pass\n",
  );
  const [isActive, setIsActive] = useState(initial?.isActive ?? false);
  const [dateLocal, setDateLocal] = useState(initial?.dateLocal ?? "");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    let examples: unknown;
    let testCases: unknown;
    try {
      examples = JSON.parse(examplesJson);
    } catch {
      toast.error("Beispiele (JSON) sind ungültig.");
      return;
    }
    try {
      testCases = JSON.parse(testsJson);
    } catch {
      toast.error("Testfälle (JSON) sind ungültig.");
      return;
    }
    if (!Array.isArray(examples) || !Array.isArray(testCases)) {
      toast.error("Beispiele und Testfälle müssen JSON-Arrays sein.");
      return;
    }

    const payload = {
      ...(mode === "create" ? { id: id.trim() } : {}),
      title: title.trim(),
      description: description.trim(),
      hint: hint.trim() || null,
      difficulty,
      points,
      categoryId,
      examples,
      testCases,
      evaluationConfig: {
        callableByLanguage: {
          javascript: fnJs.trim(),
          typescript: fnTs.trim(),
          python: fnPy.trim(),
        },
      },
      starterCodes: {
        javascript: starterJs,
        typescript: starterTs,
        python: starterPy,
      },
      supportedLanguages: ["javascript", "typescript", "python"] as const,
      isActive,
      dateIso: dateLocal ? new Date(dateLocal).toISOString() : null,
    };

    setPending(true);
    try {
      const url =
        mode === "create"
          ? "/api/admin/challenges"
          : `/api/admin/challenges/${encodeURIComponent(initial!.id)}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        id?: string;
      };
      if (!res.ok) {
        toast.error(data.error ?? `Fehler ${res.status}`);
        return;
      }
      toast.success(
        mode === "create"
          ? `Aufgabe „${data.id ?? ""}“ angelegt.`
          : "Änderungen gespeichert.",
      );
      if (mode === "create") {
        router.push("/admin/challenges");
      } else {
        router.push("/admin/challenges");
      }
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8 border-2 border-border p-6">
      {mode === "edit" && (
        <p className="text-sm">
          <Link
            href="/admin/challenges"
            className="text-primary underline underline-offset-2"
          >
            ← Zur Übersicht
          </Link>
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="cid">Challenge-ID (URL, eindeutig)</Label>
          <Input
            id="cid"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="challenge-meine-aufgabe"
            className="rounded-none font-mono text-sm"
            required={mode === "create"}
            readOnly={mode === "edit"}
            disabled={mode === "edit"}
          />
        </div>
        {/* rest same as before */}
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="title">Titel</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-none"
            required
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="desc">Beschreibung (Markdown möglich als Text)</Label>
          <Textarea
            id="desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-none min-h-[120px]"
            required
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="hint">Hinweis (optional)</Label>
          <Textarea
            id="hint"
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            className="rounded-none min-h-[72px]"
          />
        </div>
        <div className="space-y-2">
          <Label>Kategorie</Label>
          <Select
            value={categoryId}
            onValueChange={setCategoryId}
            disabled={categories.length === 0}
          >
            <SelectTrigger className="rounded-none">
              <SelectValue placeholder="Kategorie wählen" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Schwierigkeit</Label>
          <Select
            value={difficulty}
            onValueChange={(v) =>
              setDifficulty(v as "easy" | "medium" | "hard")
            }
          >
            <SelectTrigger className="rounded-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">easy</SelectItem>
              <SelectItem value="medium">medium</SelectItem>
              <SelectItem value="hard">hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="points">Punkte</Label>
          <Input
            id="points"
            type="number"
            min={1}
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
            className="rounded-none"
            required
          />
        </div>
        <div className="space-y-2 flex items-end gap-2">
          <Checkbox
            id="active"
            checked={isActive}
            onCheckedChange={(c) => setIsActive(c === true)}
          />
          <Label htmlFor="active" className="cursor-pointer">
            Aktiv (Fallback für Daily, wenn kein Datum passt)
          </Label>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="date">Daily-Datum (optional, UTC interpretiert)</Label>
          <Input
            id="date"
            type="datetime-local"
            value={dateLocal}
            onChange={(e) => setDateLocal(e.target.value)}
            className="rounded-none max-w-md"
          />
          <p className="text-xs text-muted-foreground">
            Nur ein Challenge-Eintrag pro Zeitstempel möglich (unique).
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Beispiele (JSON-Array: input / output)</Label>
        <Textarea
          value={examplesJson}
          onChange={(e) => setExamplesJson(e.target.value)}
          className="rounded-none font-mono text-xs min-h-[100px]"
        />
      </div>
      <div className="space-y-2">
        <Label>Testfälle (JSON-Array)</Label>
        <Textarea
          value={testsJson}
          onChange={(e) => setTestsJson(e.target.value)}
          className="rounded-none font-mono text-xs min-h-[140px]"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="fjs">Funktionsname JS</Label>
          <Input
            id="fjs"
            value={fnJs}
            onChange={(e) => setFnJs(e.target.value)}
            className="rounded-none font-mono text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fts">Funktionsname TS</Label>
          <Input
            id="fts"
            value={fnTs}
            onChange={(e) => setFnTs(e.target.value)}
            className="rounded-none font-mono text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fpy">Funktionsname Python</Label>
          <Input
            id="fpy"
            value={fnPy}
            onChange={(e) => setFnPy(e.target.value)}
            className="rounded-none font-mono text-sm"
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Starter-Code</Label>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">JavaScript</p>
          <Textarea
            value={starterJs}
            onChange={(e) => setStarterJs(e.target.value)}
            className="rounded-none font-mono text-xs min-h-[100px]"
          />
        </div>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">TypeScript</p>
          <Textarea
            value={starterTs}
            onChange={(e) => setStarterTs(e.target.value)}
            className="rounded-none font-mono text-xs min-h-[100px]"
          />
        </div>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Python</p>
          <Textarea
            value={starterPy}
            onChange={(e) => setStarterPy(e.target.value)}
            className="rounded-none font-mono text-xs min-h-[100px]"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={pending || categories.length === 0}
        className="rounded-none pixel-btn w-full sm:w-auto"
      >
        {pending
          ? "Speichern…"
          : mode === "create"
            ? "Aufgabe speichern"
            : "Änderungen speichern"}
      </Button>
    </form>
  );
}

/** @deprecated Nutze AdminChallengeForm mit mode="create" */
export function CreateChallengeForm(props: {
  categories: CategoryOption[];
}) {
  return <AdminChallengeForm categories={props.categories} mode="create" />;
}
