"use client";

import { useMemo, useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import type { ChallengeFormInitial } from "@/lib/admin/map-challenge-to-form";
import { LANGUAGE_LIST, perLanguage, type CodeLanguageId } from "@/lib/challenge-languages";

const DEFAULT_EXAMPLES = `[
  { "input": "[1, 2, 3]", "output": "[1, 3, 6]" }
]`;

const DEFAULT_HINTS = `[
  { "title": "Die Idee", "body": "Was ist der Kerngedanke?" },
  { "title": "Umsetzung", "body": "Wie sieht das im Code aus?" },
  { "title": "Fallstricke", "body": "Woran scheitern die meisten?" }
]`;

const DEFAULT_TESTS = `[
  { "id": 1, "name": "Beispiel", "input": "[1,2,3]", "expected": "[1,3,6]" }
]`;

type CategoryOption = { id: string; name: string };

type HintDraft = { title: string; body: string };
type TestCaseDraft = { id?: number | string; name: string };

/** JSON straight out of a textarea. Half-typed is the normal state here, so no error. */
function parseJsonArray(text: string): unknown[] {
  try {
    const value: unknown = JSON.parse(text);
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function readHintDrafts(json: string): HintDraft[] {
  return parseJsonArray(json).flatMap((entry) => {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) return [];
    const { title, body } = entry as Record<string, unknown>;
    return [
      {
        title: typeof title === "string" ? title : "",
        body: typeof body === "string" ? body : "",
      },
    ];
  });
}

function readTestCaseDrafts(json: string): TestCaseDraft[] {
  return parseJsonArray(json).flatMap((entry) => {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) return [];
    const { id, name } = entry as Record<string, unknown>;
    return [
      {
        id: typeof id === "number" || typeof id === "string" ? id : undefined,
        name: typeof name === "string" ? name : "",
      },
    ];
  });
}

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
  const [hintsJson, setHintsJson] = useState(initial?.hintsJson ?? DEFAULT_HINTS);
  const [testsJson, setTestsJson] = useState(
    initial?.testsJson ?? DEFAULT_TESTS,
  );
  /*
    One record instead of fourteen useState pairs. Every language added used to mean two more
    hooks, two more form fields and two more payload entries here; now it means one entry in the
    registry.
  */
  const [callables, setCallables] = useState<Record<CodeLanguageId, string>>(
    initial?.callables ?? perLanguage((spec) => (spec.typed ? "" : "solve")),
  );
  const [starters, setStarters] = useState<Record<CodeLanguageId, string>>(
    initial?.starters ?? perLanguage((spec) => (spec.typed ? "" : spec.starter)),
  );
  const [isActive, setIsActive] = useState(initial?.isActive ?? false);
  const [dateUtcDay, setDateUtcDay] = useState(initial?.dateUtcDay ?? "");

  const [contentLang, setContentLang] = useState<"de" | "en">("de");
  const [enTitle, setEnTitle] = useState(initial?.english?.title ?? "");
  const [enDescription, setEnDescription] = useState(
    initial?.english?.description ?? "",
  );
  const [enHints, setEnHints] = useState<HintDraft[]>(
    initial?.english?.hints ?? [],
  );
  const [enTestCaseNames, setEnTestCaseNames] = useState<Record<string, string>>(
    initial?.english?.testCaseNames ?? {},
  );

  /*
    The English fields follow the German ones instead of repeating their structure: a hint per
    German hint, a name per German test case. That is what keeps input, expected value and hint
    order single - only the prose exists twice.
  */
  const germanHints = useMemo(() => readHintDrafts(hintsJson), [hintsJson]);
  const germanTestCases = useMemo(() => readTestCaseDrafts(testsJson), [testsJson]);

  function setEnHint(index: number, patch: Partial<HintDraft>) {
    setEnHints((prev) => {
      const next = [...prev];
      while (next.length <= index) next.push({ title: "", body: "" });
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }

  const englishTouched =
    enTitle.trim() !== "" ||
    enDescription.trim() !== "" ||
    enHints.some((hint) => hint.title.trim() !== "" || hint.body.trim() !== "") ||
    Object.values(enTestCaseNames).some((name) => name.trim() !== "");

  /**
   * The English version, or null when there is none. A translation row replaces the whole
   * hint list for its locale, so a hint left blank is filled from the German one rather than
   * dropped - otherwise an English reader would lose the step entirely. Test-case names are
   * keyed by id and looked up one by one, so a blank one can simply be omitted.
   */
  function buildEnglishText() {
    const trimmedTitle = enTitle.trim();
    const trimmedDescription = enDescription.trim();
    if (!trimmedTitle || !trimmedDescription) return null;

    const hints = germanHints.map((german, index) => ({
      title: enHints[index]?.title.trim() || german.title,
      body: enHints[index]?.body.trim() || german.body,
    }));

    const testCaseNames: Record<string, string> = {};
    for (const testCase of germanTestCases) {
      if (testCase.id === undefined) continue;
      const name = enTestCaseNames[String(testCase.id)]?.trim();
      if (name) testCaseNames[String(testCase.id)] = name;
    }

    return { title: trimmedTitle, description: trimmedDescription, hints, testCaseNames };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    /*
      Radix unmounts the inactive tab, so the browser cannot enforce `required` on the German
      fields while the English tab is open. They are checked here instead, and the tab that
      holds the problem is brought forward.
    */
    if (!title.trim() || !description.trim()) {
      setContentLang("de");
      toast.error("Titel und Beschreibung sind auf Deutsch Pflicht.");
      return;
    }

    let examples: unknown;
    let testCases: unknown;
    let hints: unknown;
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
    try {
      hints = JSON.parse(hintsJson);
    } catch {
      toast.error("Hinweise (JSON) sind ungültig.");
      return;
    }
    if (!Array.isArray(examples) || !Array.isArray(testCases) || !Array.isArray(hints)) {
      toast.error("Beispiele, Testfälle und Hinweise müssen JSON-Arrays sein.");
      return;
    }

    const english = buildEnglishText();
    if (!english && englishTouched) {
      setContentLang("en");
      toast.error(
        "Die englische Fassung braucht Titel und Beschreibung, oder alle englischen Felder leeren.",
      );
      return;
    }

    /*
      A typed language counts as supported only when a function name is filled in. Its harness
      cannot express every input shape, and a dropdown entry whose submission always fails is
      worse than a missing one.
    */
    const supportedLanguages = LANGUAGE_LIST.filter(
      (spec) => !spec.typed || callables[spec.id].trim().length > 0,
    ).map((spec) => spec.id);

    const entries = <T,>(pick: (id: CodeLanguageId) => T) =>
      Object.fromEntries(supportedLanguages.map((id) => [id, pick(id)]));

    const payload = {
      ...(mode === "create" ? { id: id.trim() } : {}),
      title: title.trim(),
      description: description.trim(),
      hints,
      difficulty,
      points,
      categoryId,
      examples,
      testCases,
      evaluationConfig: {
        callableByLanguage: entries((id) => callables[id].trim()),
      },
      starterCodes: entries((id) => starters[id]),
      supportedLanguages,
      isActive,
      // Interpret this as a UTC day, not as local time: otherwise the challenge
      // lands on the previous day for time zones east of UTC (#71).
      dateIso: dateUtcDay ? `${dateUtcDay}T00:00:00.000Z` : null,
      // Always sent, `en` only when there is one: an empty object is how the form says the
      // English version was removed.
      translations: english ? { en: english } : {},
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
      router.push("/admin/challenges");
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
            Aktiv (Teil der täglichen Rotation)
          </Label>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="date">Daily-Datum (optional, UTC-Tag)</Label>
          <Input
            id="date"
            type="date"
            value={dateUtcDay}
            onChange={(e) => setDateUtcDay(e.target.value)}
            className="rounded-none max-w-md"
          />
          <p className="text-xs text-muted-foreground">
            Der Tag gilt ganztägig in UTC. Eine Uhrzeit gibt es bewusst nicht. Pro
            UTC-Tag ist nur eine Aufgabe möglich. Ohne Datum nimmt die Aufgabe an
            der täglichen Rotation teil.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <Tabs
          value={contentLang}
          onValueChange={(v) => setContentLang(v as "de" | "en")}
        >
          <TabsList className="rounded-none">
            <TabsTrigger value="de" className="rounded-none">
              Deutsch (Pflicht)
            </TabsTrigger>
            <TabsTrigger value="en" className="rounded-none">
              Englisch (optional)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="de" className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titel</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Beschreibung (Absätze bleiben erhalten)</Label>
              <Textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-none min-h-[120px]"
              />
            </div>
            <div className="space-y-2">
              <Label>Hinweise (JSON-Array: title / body, leeres Array für keine)</Label>
              <Textarea
                value={hintsJson}
                onChange={(e) => setHintsJson(e.target.value)}
                className="rounded-none font-mono text-xs min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground">
                Werden einzeln aufgeklappt. Vom Groben zum Konkreten sortieren. Der letzte
                Schritt darf die typischen Fehler nennen.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Testfälle (JSON-Array)</Label>
              <Textarea
                value={testsJson}
                onChange={(e) => setTestsJson(e.target.value)}
                className="rounded-none font-mono text-xs min-h-[140px]"
              />
              <p className="text-xs text-muted-foreground">
                Jeder Testfall braucht eine <code>id</code>. Der englische Name hängt daran,
                nicht an der Position.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="en" className="space-y-6 pt-4">
            <p className="text-xs text-muted-foreground">
              Leer lassen ist erlaubt: ohne englische Fassung sieht ein englischer Leser den
              deutschen Text. Einzelne leere Felder werden ebenfalls deutsch angezeigt.
            </p>
            <div className="space-y-2">
              <Label htmlFor="en-title">Title</Label>
              <Input
                id="en-title"
                value={enTitle}
                onChange={(e) => setEnTitle(e.target.value)}
                className="rounded-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="en-desc">Description</Label>
              <Textarea
                id="en-desc"
                value={enDescription}
                onChange={(e) => setEnDescription(e.target.value)}
                className="rounded-none min-h-[120px]"
              />
            </div>

            <div className="space-y-4">
              <Label>Hints</Label>
              {germanHints.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Keine Hinweise im deutschen Reiter, oder das JSON dort ist noch ungültig.
                </p>
              ) : (
                germanHints.map((german, index) => (
                  <div key={index} className="space-y-2 border-l-2 border-border pl-3">
                    <p className="text-xs text-muted-foreground">
                      {index + 1}. {german.title || "(ohne Titel)"}
                    </p>
                    <Input
                      value={enHints[index]?.title ?? ""}
                      onChange={(e) => setEnHint(index, { title: e.target.value })}
                      placeholder="Title"
                      className="rounded-none"
                    />
                    <Textarea
                      value={enHints[index]?.body ?? ""}
                      onChange={(e) => setEnHint(index, { body: e.target.value })}
                      placeholder="Body"
                      className="rounded-none min-h-[80px]"
                    />
                  </div>
                ))
              )}
            </div>

            <div className="space-y-3">
              <Label>Test case names</Label>
              {germanTestCases.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Keine Testfälle im deutschen Reiter, oder das JSON dort ist noch ungültig.
                </p>
              ) : (
                germanTestCases.map((testCase, index) =>
                  testCase.id === undefined ? (
                    <p key={index} className="text-xs text-muted-foreground">
                      {index + 1}. {testCase.name || "(ohne Name)"}: ohne{" "}
                      <code>id</code> nicht übersetzbar.
                    </p>
                  ) : (
                    <div key={String(testCase.id)} className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        {testCase.id}. {testCase.name || "(ohne Name)"}
                      </p>
                      <Input
                        value={enTestCaseNames[String(testCase.id)] ?? ""}
                        onChange={(e) =>
                          setEnTestCaseNames((prev) => ({
                            ...prev,
                            [String(testCase.id)]: e.target.value,
                          }))
                        }
                        className="rounded-none"
                      />
                    </div>
                  ),
                )
              )}
            </div>
          </TabsContent>
        </Tabs>
        <p className="text-xs text-muted-foreground">
          Punkte, Schwierigkeit, Kategorie, Beispiele, Testdaten, Funktionsnamen und
          Starter-Code gehören zur Aufgabe und nicht zu einer Sprache. Sie stehen nur einmal
          im Formular.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Beispiele (JSON-Array: input / output)</Label>
        <Textarea
          value={examplesJson}
          onChange={(e) => setExamplesJson(e.target.value)}
          className="rounded-none font-mono text-xs min-h-[100px]"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {LANGUAGE_LIST.map((spec) => (
          <div key={spec.id} className="space-y-2">
            <Label htmlFor={`fn-${spec.id}`}>Funktionsname {spec.label}</Label>
            <Input
              id={`fn-${spec.id}`}
              value={callables[spec.id]}
              onChange={(e) =>
                setCallables((prev) => ({ ...prev, [spec.id]: e.target.value }))
              }
              placeholder={spec.typed ? `leer = kein ${spec.label}` : undefined}
              className="rounded-none font-mono text-sm"
            />
            {spec.typed && (
              <p className="text-xs text-muted-foreground">
                Leer lassen, wenn die Testfälle Typen mischen oder verschachtelt sind.
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <Label>Starter-Code</Label>
        {LANGUAGE_LIST.map((spec) => (
          <div key={spec.id} className="space-y-2">
            <p className="text-xs text-muted-foreground">{spec.label}</p>
            <Textarea
              value={starters[spec.id]}
              onChange={(e) =>
                setStarters((prev) => ({ ...prev, [spec.id]: e.target.value }))
              }
              className="rounded-none font-mono text-xs min-h-[100px]"
            />
          </div>
        ))}
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

/** @deprecated Use AdminChallengeForm with mode="create" */
export function CreateChallengeForm(props: {
  categories: CategoryOption[];
}) {
  return <AdminChallengeForm categories={props.categories} mode="create" />;
}
