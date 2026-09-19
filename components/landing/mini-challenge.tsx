"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Play, RotateCcw, X } from "lucide-react";
import { useTranslations } from "next-intl";

export const DEMO_CASES = [
  { input: [1, 2, 3, 4], expected: [2, 4] },
  { input: [0, -2, 3], expected: [0, -2] },
  { input: [1, 3, 5], expected: [] },
];
const CHOICES = {
  even: "n % 2 === 0",
  odd: "n % 2 !== 0",
  positive: "n > 0",
} as const;
type Choice = keyof typeof CHOICES;

/** A fixed, local teaching example. Never evaluates visitor-provided code. */
export function evaluateDemo(choice: string): boolean[] {
  const predicates: Record<Choice, (n: number) => boolean> = {
    even: (n) => n % 2 === 0,
    odd: (n) => n % 2 !== 0,
    positive: (n) => n > 0,
  };
  if (!Object.hasOwn(predicates, choice)) return DEMO_CASES.map(() => false);
  return DEMO_CASES.map(
    ({ input, expected }) =>
      JSON.stringify(input.filter(predicates[choice as Choice])) ===
      JSON.stringify(expected),
  );
}

export function MiniChallenge() {
  const t = useTranslations("dashboard.landing.demo");
  const [choice, setChoice] = useState<Choice | null>(null);
  const [results, setResults] = useState<boolean[] | null>(null);
  const passed = results?.every(Boolean);
  return (
    <section id="try-it" className="lp-demo-section">
      <div className="lp-container lp-demo-grid">
        <div>
          <p className="lp-kicker">{t("eyebrow")}</p>
          <h2>{t("title")}</h2>
          <p className="lp-lead">{t("intro")}</p>
          <p className="lp-demo-note">{t("note")}</p>
          <Link href="/challenge" className="lp-text-link">
            {t("realChallenge")}
            <ArrowRight size={17} aria-hidden />
          </Link>
        </div>
        <div className="lp-demo-editor">
          <div className="lp-window-bar">
            <span className="lp-window-dots" aria-hidden>
              <i />
              <i />
              <i />
            </span>
            <span>{"keepEven.js"}</span>
            <span>{t("example")}</span>
          </div>
          <div className="lp-demo-body">
            <p>{t("task")}</p>
            <pre className="lp-code">
              <code>
                <span>{"const keepEven = (numbers) =>"}</span>
                {"\n  numbers.filter(n => "}
                <mark>{choice ? CHOICES[choice] : "???"}</mark>
                {");"}
              </code>
            </pre>
            <fieldset>
              <legend>{t("choose")}</legend>
              <div className="lp-options">
                {(Object.entries(CHOICES) as [Choice, string][]).map(
                  ([id, code]) => (
                    <label
                      key={id}
                      className={
                        choice === id
                          ? "lp-option lp-option-selected"
                          : "lp-option"
                      }
                    >
                      <input
                        type="radio"
                        name="predicate"
                        value={id}
                        checked={choice === id}
                        onChange={() => {
                          setChoice(id);
                          setResults(null);
                        }}
                      />
                      <code>{code}</code>
                    </label>
                  ),
                )}
              </div>
            </fieldset>
            <div className="lp-demo-controls">
              <button
                className="lp-button lp-button-primary"
                disabled={!choice}
                onClick={() => {
                  if (choice) setResults(evaluateDemo(choice));
                }}
              >
                <Play size={16} aria-hidden />
                {t("run")}
              </button>
              {results ? (
                <button
                  className="lp-reset"
                  onClick={() => {
                    setChoice(null);
                    setResults(null);
                  }}
                  aria-label={t("reset")}
                >
                  <RotateCcw size={18} aria-hidden />
                </button>
              ) : null}
              <span>{t("local")}</span>
            </div>
            <div aria-live="polite" aria-atomic="true">
              {results ? (
                <div
                  className={
                    passed ? "lp-results lp-results-success" : "lp-results"
                  }
                >
                  <strong>{passed ? t("success") : t("retry")}</strong>
                  {DEMO_CASES.map(({ input, expected }, i) => (
                    <div className="lp-test-result" key={i}>
                      {results[i] ? (
                        <Check size={15} aria-label={t("passed")} />
                      ) : (
                        <X size={15} aria-label={t("failed")} />
                      )}
                      <code>
                        {JSON.stringify(input)}
                        {" → "}
                        {JSON.stringify(expected)}
                      </code>
                    </div>
                  ))}
                  <p>{passed ? t("successDetail") : t("hint")}</p>
                  {passed ? (
                    <Link href="/register" className="lp-text-link">
                      {t("signup")}
                      <ArrowRight size={16} aria-hidden />
                    </Link>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
