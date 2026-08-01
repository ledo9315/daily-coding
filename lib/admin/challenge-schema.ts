import { z } from "zod";
import { CODE_LANGUAGES } from "@/lib/challenge-languages";
import { HINT_TITLE_MAX } from "@/lib/challenge-hints";

const codeLanguageZ = z.enum(CODE_LANGUAGES);

/** Payload sent by the admin form / API to create a challenge. */
export const adminCreateChallengeSchema = z.object({
  id: z
    .string()
    .min(3)
    .max(96)
    .regex(/^[a-z0-9-]+$/u, "Nur Kleinbuchstaben, Ziffern und Bindestrich."),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(50000),
  /** Staged hints. Required rather than defaulted: an omitted field would silently clear them. */
  hints: z.array(
    z.object({
      title: z.string().min(1).max(HINT_TITLE_MAX),
      body: z.string().min(1).max(10000),
    }),
  ),
  difficulty: z.enum(["easy", "medium", "hard"]),
  points: z.number().int().min(1).max(100000),
  categoryId: z.string().min(1),
  examples: z.array(
    z.object({
      input: z.string(),
      output: z.string(),
    }),
  ),
  testCases: z
    .array(
      z.object({
        id: z.number().int().optional(),
        name: z.string().min(1),
        input: z.string().optional(),
        expected: z.string().optional(),
      }),
    )
    .min(1)
    .max(20),
  evaluationConfig: z.object({
    /*
      Java is the only optional one. Its harness needs typed input, which rules out challenges
      whose test cases mix types in one array or nest a structure. Leaving the method name empty
      is how such a challenge says "no Java" — supportedLanguages then omits it and the dropdown
      never offers a language whose submission would fail.

      Ruby has no such limit: `data` is just a value, so every challenge can support it.
    */
    callableByLanguage: z.object({
      javascript: z.string().min(1),
      typescript: z.string().min(1),
      python: z.string().min(1),
      php: z.string().min(1),
      ruby: z.string().min(1),
      java: z.string().optional(),
      go: z.string().optional(),
    }),
  }),
  starterCodes: z.object({
    javascript: z.string(),
    typescript: z.string(),
    python: z.string(),
    php: z.string(),
    ruby: z.string(),
    java: z.string().optional(),
    go: z.string().optional(),
  }),
  supportedLanguages: z.array(codeLanguageZ).optional(),
  isActive: z.boolean().optional(),
  /** Start of the UTC day as an ISO string, or empty for no daily date */
  dateIso: z.string().optional().nullable(),
});

export type AdminCreateChallengeInput = z.infer<typeof adminCreateChallengeSchema>;

/** Same fields as create, minus the id — that one lives in the URL. */
export const adminUpdateChallengeSchema = adminCreateChallengeSchema.omit({
  id: true,
});

export type AdminUpdateChallengeInput = z.infer<typeof adminUpdateChallengeSchema>;
