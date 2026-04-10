-- Bestehende Challenges: php in supportedLanguages ergänzen (Dropdown / API)
UPDATE "Challenge"
SET "supportedLanguages" = "supportedLanguages" || ARRAY['php']::"CodeLanguage"[]
WHERE NOT ('php' = ANY ("supportedLanguages"));

-- IO-Auswertung: gleicher Funktionsname wie JS/TS/PY, falls noch kein php-Eintrag
UPDATE "Challenge"
SET "evaluationConfig" = jsonb_set(
  "evaluationConfig"::jsonb,
  '{callableByLanguage,php}',
  COALESCE(
    "evaluationConfig"::jsonb#>'{callableByLanguage,javascript}',
    "evaluationConfig"::jsonb#>'{callableByLanguage,typescript}',
    "evaluationConfig"::jsonb#>'{callableByLanguage,python}',
    '"solve"'::jsonb
  ),
  true
)
WHERE "evaluationConfig" IS NOT NULL
  AND jsonb_typeof("evaluationConfig"::jsonb->'callableByLanguage') = 'object'
  AND NOT ("evaluationConfig"::jsonb->'callableByLanguage' ? 'php');
