import { z } from "zod";
import { CODE_LANGUAGES } from "@/lib/challenge-languages";

const codeLanguageZ = z.enum(CODE_LANGUAGES);

/** Payload vom Admin-Formular / API zum Anlegen einer Challenge. */
export const adminCreateChallengeSchema = z.object({
  id: z
    .string()
    .min(3)
    .max(96)
    .regex(/^[a-z0-9-]+$/u, "Nur Kleinbuchstaben, Ziffern und Bindestrich."),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(50000),
  hint: z.string().max(10000).optional().nullable(),
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
    callableByLanguage: z.object({
      javascript: z.string().min(1),
      typescript: z.string().min(1),
      python: z.string().min(1),
      php: z.string().min(1),
    }),
  }),
  starterCodes: z.object({
    javascript: z.string(),
    typescript: z.string(),
    python: z.string(),
    php: z.string(),
  }),
  supportedLanguages: z.array(codeLanguageZ).optional(),
  isActive: z.boolean().optional(),
  /** UTC-Tagesbeginn als ISO-String oder leer → kein Daily-Datum */
  dateIso: z.string().optional().nullable(),
});

export type AdminCreateChallengeInput = z.infer<typeof adminCreateChallengeSchema>;

/** Gleiche Felder wie Create, aber ohne id (steht in der URL). */
export const adminUpdateChallengeSchema = adminCreateChallengeSchema.omit({
  id: true,
});

export type AdminUpdateChallengeInput = z.infer<typeof adminUpdateChallengeSchema>;
