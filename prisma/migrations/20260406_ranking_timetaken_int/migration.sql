-- Convert RankingEntry.timeTaken from "M:SS" string to integer seconds
ALTER TABLE "RankingEntry"
  ALTER COLUMN "timeTaken" TYPE INTEGER
  USING (
    CASE WHEN "timeTaken" IS NULL THEN NULL
    ELSE SPLIT_PART("timeTaken", ':', 1)::INTEGER * 60
       + SPLIT_PART("timeTaken", ':', 2)::INTEGER
    END
  );
